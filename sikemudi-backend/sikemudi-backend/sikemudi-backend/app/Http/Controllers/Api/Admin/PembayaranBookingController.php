<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BookingPayment;
use App\Services\BookingPaymentVerificationService;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PembayaranBookingController extends Controller
{
    public function __construct(private BookingPaymentVerificationService $paymentVerificationService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $payments = BookingPayment::query()
            ->with([
                'booking.participant.user',
                'booking.trainingSchedule.timeSlot',
                'booking.trainingSchedule.instructor.user',
                'booking.trainingSchedule.vehicle',
                'booking.coursePackage',
                'verifier',
            ])
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('nama_pengirim', 'like', "%{$keyword}%")
                        ->orWhere('bank_pengirim', 'like', "%{$keyword}%")
                        ->orWhereHas('booking', function ($bookingQuery) use ($keyword) {
                            $bookingQuery->where('kode_booking', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('booking.participant.user', function ($userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%")
                                ->orWhere('no_telepon', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('tanggal_upload'), function ($query) use ($request) {
                $query->whereDate('tanggal_upload', $request->query('tanggal_upload'));
            })
            ->when($request->filled('tanggal_mulai'), function ($query) use ($request) {
                $query->whereDate('tanggal_upload', '>=', $request->query('tanggal_mulai'));
            })
            ->when($request->filled('tanggal_selesai'), function ($query) use ($request) {
                $query->whereDate('tanggal_upload', '<=', $request->query('tanggal_selesai'));
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data pembayaran booking berhasil diambil.',
            'data' => [
                'items' => collect($payments->items())
                    ->map(fn(BookingPayment $payment) => $this->formatPayment($payment, false))
                    ->values(),
                'pagination' => [
                    'current_page' => $payments->currentPage(),
                    'last_page' => $payments->lastPage(),
                    'per_page' => $payments->perPage(),
                    'total' => $payments->total(),
                ],
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $payment = BookingPayment::query()
            ->with([
                'booking.participant.user',
                'booking.trainingSchedule.timeSlot',
                'booking.trainingSchedule.instructor.user',
                'booking.trainingSchedule.vehicle',
                'booking.coursePackage',
                'verifier',
            ])
            ->find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Data pembayaran booking tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail pembayaran booking berhasil diambil.',
            'data' => [
                'item' => $this->formatPayment($payment, true),
            ],
        ]);
    }

    public function konfirmasi(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'catatan_admin' => ['nullable', 'string'],
        ]);

        $result = $this->paymentVerificationService->confirmByPaymentId(
            $id,
            $request->user()->id,
            $validated['catatan_admin'] ?? null
        );

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil dikonfirmasi. Booking peserta sudah valid.',
            'data' => [
                'item' => $this->formatPayment($result['payment'], true),
            ],
        ]);
    }

    public function tolak(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'alasan_penolakan' => ['required', 'string'],
            'catatan_admin' => ['nullable', 'string'],
        ], [
            'alasan_penolakan.required' => 'Alasan penolakan wajib diisi.',
        ]);

        $result = $this->paymentVerificationService->rejectByPaymentId(
            $id,
            $request->user()->id,
            $validated['alasan_penolakan'],
            $validated['catatan_admin'] ?? null
        );

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran berhasil ditolak. Peserta dapat mengunggah ulang bukti pembayaran.',
            'data' => [
                'item' => $this->formatPayment($result['payment'], true),
            ],
        ]);
    }

    private function formatPayment(BookingPayment $payment, bool $includeProof): array
    {
        $booking = $payment->booking;

        return [
            'id' => $payment->id,
            'booking_id' => $payment->booking_id,
            'nominal_bayar' => (int) $payment->nominal_bayar,
            'bukti_bayar' => null,
            'bukti_bayar_url' => $booking && (!empty($payment->bukti_bayar_path) || !empty($payment->bukti_bayar))
                ? route('admin.booking.bukti-bayar', ['id' => $booking->id])
                : null,
            'bukti_bayar_original_name' => $payment->bukti_bayar_original_name,
            'bukti_bayar_mime' => $payment->bukti_bayar_mime,
            'bukti_bayar_size' => $payment->bukti_bayar_size ? (int) $payment->bukti_bayar_size : null,
            'ada_bukti_bayar' => !empty($payment->bukti_bayar_path) || !empty($payment->bukti_bayar),
            'bukti_bayar_legacy' => empty($payment->bukti_bayar_path) && !empty($payment->bukti_bayar),
            'nama_pengirim' => $payment->nama_pengirim,
            'bank_pengirim' => $payment->bank_pengirim,
            'tanggal_upload' => DateFormatter::dateTime($payment->tanggal_upload),
            'tanggal_verifikasi' => DateFormatter::dateTime($payment->tanggal_verifikasi),
            'status' => $payment->status,
            'catatan_peserta' => $payment->catatan_peserta,
            'catatan_admin' => $payment->catatan_admin,
            'alasan_penolakan' => $payment->alasan_penolakan,

            'verifier' => $payment->verifier ? [
                'id' => $payment->verifier->id,
                'name' => $payment->verifier->name,
                'email' => $payment->verifier->email,
            ] : null,

            'booking' => $booking ? [
                'id' => $booking->id,
                'kode_booking' => $booking->kode_booking,
                'status' => $booking->status,
                'harga_paket' => (int) $booking->harga_paket,
                'pakai_antar_jemput' => (bool) $booking->pakai_antar_jemput,
                'pakai_sim' => (bool) $booking->pakai_sim,
                'alamat_jemput' => $booking->alamat_jemput,
                'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),
                'tanggal_dikonfirmasi' => DateFormatter::dateTime($booking->tanggal_dikonfirmasi),

                'peserta' => $booking->participant ? [
                    'id' => $booking->participant->id,
                    'kode_peserta' => $booking->participant->kode_peserta,
                    'nama_peserta' => $booking->participant->user?->name,
                    'email' => $booking->participant->user?->email,
                    'no_telepon' => $booking->participant->user?->no_telepon,
                ] : null,

                'course_package' => $booking->coursePackage ? [
                    'id' => $booking->coursePackage->id,
                    'kode_paket' => $booking->coursePackage->kode_paket,
                    'nama_paket' => $booking->coursePackage->nama_paket,
                    'durasi_jam' => (int) $booking->coursePackage->durasi_jam,
                ] : null,

                'training_schedule' => $booking->trainingSchedule ? [
                    'id' => $booking->trainingSchedule->id,
                    'kode_jadwal' => $booking->trainingSchedule->kode_jadwal,
                    'tanggal_latihan' => DateFormatter::date($booking->trainingSchedule->tanggal_latihan),
                    'status' => $booking->trainingSchedule->status,
                    'kapasitas' => (int) $booking->trainingSchedule->kapasitas,
                    'jumlah_booking' => (int) $booking->trainingSchedule->jumlah_booking,

                    'time_slot' => $booking->trainingSchedule->timeSlot ? [
                        'id' => $booking->trainingSchedule->timeSlot->id,
                        'nama_slot' => $booking->trainingSchedule->timeSlot->nama_slot,
                        'jam_mulai' => DateFormatter::time($booking->trainingSchedule->timeSlot->jam_mulai),
                        'jam_selesai' => DateFormatter::time($booking->trainingSchedule->timeSlot->jam_selesai),
                    ] : null,

                    'instructor' => $booking->trainingSchedule->instructor ? [
                        'id' => $booking->trainingSchedule->instructor->id,
                        'kode_instruktur' => $booking->trainingSchedule->instructor->kode_instruktur,
                        'nama_instruktur' => $booking->trainingSchedule->instructor->user?->name,
                    ] : null,

                    'vehicle' => $booking->trainingSchedule->vehicle ? [
                        'id' => $booking->trainingSchedule->vehicle->id,
                        'kode_kendaraan' => $booking->trainingSchedule->vehicle->kode_kendaraan,
                        'nama_kendaraan' => $booking->trainingSchedule->vehicle->nama_kendaraan,
                        'nomor_plat' => $booking->trainingSchedule->vehicle->nomor_plat,
                        'transmisi' => $booking->trainingSchedule->vehicle->transmisi,
                    ] : null,
                ] : null,
            ] : null,

            'created_at' => DateFormatter::dateTime($payment->created_at),
            'updated_at' => DateFormatter::dateTime($payment->updated_at),
        ];
    }
}
