<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BookingRefund;
use App\Services\BookingWhatsAppNotificationService;
use App\Support\DateFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingRefundController extends Controller
{
    public function __construct(
        private readonly BookingWhatsAppNotificationService $bookingWhatsAppNotificationService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $refunds = BookingRefund::query()
            ->with($this->relations())
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function (Builder $subQuery) use ($keyword) {
                    $subQuery
                        ->where('bank_tujuan', 'like', "%{$keyword}%")
                        ->orWhere('nomor_rekening', 'like', "%{$keyword}%")
                        ->orWhere('nama_penerima', 'like', "%{$keyword}%")
                        ->orWhere('status_refund', 'like', "%{$keyword}%")
                        ->orWhereHas('bookingGroup', function (Builder $groupQuery) use ($keyword) {
                            $groupQuery->where('kode_group', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('bookingGroup.participant.user', function (Builder $userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('bookingGroup.coursePackage', function (Builder $packageQuery) use ($keyword) {
                            $packageQuery->where('nama_paket', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', function (Builder $query) use ($request) {
                $query->where('status_refund', $request->query('status'));
            })
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_pengajuan', '>=', $request->query('start_date'));
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('tanggal_pengajuan', '<=', $request->query('end_date'));
            })
            ->latest('tanggal_pengajuan')
            ->latest('id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data refund booking berhasil diambil.',
            'data' => [
                'items' => collect($refunds->items())
                    ->map(fn (BookingRefund $refund) => $this->formatRefund($refund))
                    ->values(),
                'pagination' => [
                    'current_page' => $refunds->currentPage(),
                    'last_page' => $refunds->lastPage(),
                    'per_page' => $refunds->perPage(),
                    'total' => $refunds->total(),
                ],
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $refund = BookingRefund::query()
            ->with($this->relations())
            ->find($id);

        if (!$refund) {
            return response()->json([
                'success' => false,
                'message' => 'Data refund booking tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail refund booking berhasil diambil.',
            'data' => [
                'item' => $this->formatRefund($refund),
            ],
        ]);
    }

    public function proses(Request $request, string $id): JsonResponse
    {
        $refund = BookingRefund::query()->find($id);

        if (!$refund) {
            return response()->json([
                'success' => false,
                'message' => 'Data refund booking tidak ditemukan.',
            ], 404);
        }

        if ($refund->status_refund !== 'Diajukan') {
            return response()->json([
                'success' => false,
                'message' => 'Refund hanya dapat diproses dari status Diajukan.',
            ], 422);
        }

        $validated = $request->validate([
            'catatan_admin' => ['nullable', 'string'],
        ]);

        $refund->update([
            'status_refund' => 'Diproses',
            'processed_by' => $request->user()->id,
            'tanggal_diproses' => now(),
            'catatan_admin' => $validated['catatan_admin'] ?? $refund->catatan_admin,
        ]);

        return $this->actionResponse($refund->fresh($this->relations()), 'Refund booking berhasil ditandai sedang diproses.');
    }

    public function selesaikan(Request $request, string $id): JsonResponse
    {
        $refund = BookingRefund::query()
            ->with('bookingPayment')
            ->find($id);

        if (!$refund) {
            return response()->json([
                'success' => false,
                'message' => 'Data refund booking tidak ditemukan.',
            ], 404);
        }

        if ($refund->status_refund !== 'Diproses') {
            return response()->json([
                'success' => false,
                'message' => 'Refund harus diproses terlebih dahulu sebelum dapat diselesaikan.',
            ], 422);
        }

        $maxRefund = (float) ($refund->bookingPayment?->nominal_bayar ?? $refund->nominal_refund);

        $validated = $request->validate([
            'nominal_refund' => ['nullable', 'numeric', 'min:0', 'max:' . $maxRefund],
            'tipe_refund' => ['nullable', 'in:Penuh,Sebagian'],
            'catatan_admin' => ['nullable', 'string'],
        ]);

        $nominalRefund = array_key_exists('nominal_refund', $validated)
            ? (float) $validated['nominal_refund']
            : (float) $refund->nominal_refund;

        $refund->update([
            'status_refund' => 'Selesai',
            'nominal_refund' => $nominalRefund,
            'tipe_refund' => $validated['tipe_refund'] ?? ($nominalRefund >= $maxRefund ? 'Penuh' : 'Sebagian'),
            'processed_by' => $request->user()->id,
            'tanggal_diproses' => $refund->tanggal_diproses ?? now(),
            'tanggal_refund' => now(),
            'catatan_admin' => $validated['catatan_admin'] ?? $refund->catatan_admin,
        ]);

        $refund = $refund->fresh($this->relations());

        if ($refund) {
            $this->bookingWhatsAppNotificationService->notifyRefundFinished($refund);
        }

        return $this->actionResponse($refund, 'Refund booking berhasil diselesaikan.');
    }

    public function tolak(Request $request, string $id): JsonResponse
    {
        $refund = BookingRefund::query()->find($id);

        if (!$refund) {
            return response()->json([
                'success' => false,
                'message' => 'Data refund booking tidak ditemukan.',
            ], 404);
        }

        if (!in_array($refund->status_refund, ['Diajukan', 'Diproses'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Refund hanya dapat ditolak dari status Diajukan atau Diproses.',
            ], 422);
        }

        $validated = $request->validate([
            'catatan_admin' => ['required', 'string'],
        ]);

        $refund->update([
            'status_refund' => 'Ditolak',
            'processed_by' => $request->user()->id,
            'tanggal_diproses' => $refund->tanggal_diproses ?? now(),
            'catatan_admin' => $validated['catatan_admin'],
        ]);

        return $this->actionResponse($refund->fresh($this->relations()), 'Refund booking berhasil ditolak.');
    }

    private function actionResponse(?BookingRefund $refund, string $message): JsonResponse
    {
        if (!$refund) {
            return response()->json([
                'success' => false,
                'message' => 'Data refund booking gagal dimuat ulang.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => [
                'item' => $this->formatRefund($refund),
            ],
        ]);
    }

    private function relations(): array
    {
        return [
            'bookingGroup.participant.user',
            'bookingGroup.coursePackage',
            'bookingGroup.payment',
            'bookingPayment',
            'requester',
            'processor',
        ];
    }

    private function formatRefund(BookingRefund $refund): array
    {
        $group = $refund->bookingGroup;
        $payment = $refund->bookingPayment ?? $group?->payment;

        return [
            'id' => $refund->id,
            'booking_group_id' => $refund->booking_group_id,
            'booking_payment_id' => $refund->booking_payment_id,
            'kode_group' => $group?->kode_group,
            'participant' => $group?->participant ? [
                'id' => $group->participant->id,
                'kode_peserta' => $group->participant->kode_peserta,
                'nama_peserta' => $group->participant->user?->name,
                'email' => $group->participant->user?->email,
            ] : null,
            'course_package' => $group?->coursePackage ? [
                'id' => $group->coursePackage->id,
                'kode_paket' => $group->coursePackage->kode_paket,
                'nama_paket' => $group->coursePackage->nama_paket,
            ] : null,
            'payment' => $payment ? [
                'id' => $payment->id,
                'nominal_bayar' => (int) $payment->nominal_bayar,
                'status' => $payment->status,
                'ada_bukti_bayar' => !empty($payment->bukti_bayar_path) || !empty($payment->bukti_bayar),
                'bukti_bayar_url' => $this->resolvePaymentProofUrl($refund, $payment),
                'tanggal_upload' => DateFormatter::dateTime($payment->tanggal_upload),
                'tanggal_verifikasi' => DateFormatter::dateTime($payment->tanggal_verifikasi),
            ] : null,
            'nominal_refund' => (int) $refund->nominal_refund,
            'tipe_refund' => $refund->tipe_refund,
            'status_refund' => $refund->status_refund,
            'bank_tujuan' => $refund->bank_tujuan,
            'nomor_rekening' => $refund->nomor_rekening,
            'nama_penerima' => $refund->nama_penerima,
            'alasan_refund' => $refund->alasan_refund,
            'catatan_peserta' => $refund->catatan_peserta,
            'catatan_admin' => $refund->catatan_admin,
            'tanggal_pengajuan' => DateFormatter::dateTime($refund->tanggal_pengajuan),
            'tanggal_diproses' => DateFormatter::dateTime($refund->tanggal_diproses),
            'tanggal_refund' => DateFormatter::dateTime($refund->tanggal_refund),
            'requested_by' => $refund->requester ? [
                'id' => $refund->requester->id,
                'name' => $refund->requester->name,
                'email' => $refund->requester->email,
            ] : null,
            'processed_by' => $refund->processor ? [
                'id' => $refund->processor->id,
                'name' => $refund->processor->name,
                'email' => $refund->processor->email,
            ] : null,
            'created_at' => DateFormatter::dateTime($refund->created_at),
            'updated_at' => DateFormatter::dateTime($refund->updated_at),
        ];
    }
    private function resolvePaymentProofUrl(BookingRefund $refund, $payment): ?string
    {
        if (!$payment || (empty($payment->bukti_bayar_path) && empty($payment->bukti_bayar))) {
            return null;
        }

        if ($refund->booking_group_id) {
            return route('admin.booking-paket.bukti-bayar', ['id' => $refund->booking_group_id]);
        }

        if ($payment->booking_id) {
            return route('admin.booking.bukti-bayar', ['id' => $payment->booking_id]);
        }

        return null;
    }

}
