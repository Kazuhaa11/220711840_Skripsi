<?php

namespace App\Http\Controllers\Api\Peserta;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingHistory;
use App\Models\BookingGroup;
use App\Models\BookingPayment;
use App\Models\BookingRefund;
use App\Models\Certificate;
use App\Models\Participant;
use App\Models\TrainingSchedule;
use App\Services\BookingWhatsAppNotificationService;
use App\Support\BookingCapacityManager;
use App\Support\DateFormatter;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingGroupPesertaController extends Controller
{
    public function __construct(
        private readonly BookingWhatsAppNotificationService $bookingWhatsAppNotificationService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $groups = BookingGroup::query()
            ->with([
                'participant.user',
                'coursePackage',
                'instructor.user',
                'vehicle',
                'payment.verifier',
                'refund.processor',
                'refund.requester',
                'bookings' => function ($query) {
                    $query->orderBy('sesi_ke')->orderBy('id');
                },
                'bookings.trainingSchedule.timeSlot',
                'bookings.trainingSchedule.instructor.user',
                'bookings.trainingSchedule.vehicle',
                'bookings.trainingSchedule.coursePackage',
                'bookings.coursePackage',
                'bookings.trainingResult',
            ])
            ->where('participant_id', $participant->id)
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data booking paket peserta berhasil diambil.',
            'data' => [
                'items' => collect($groups->items())
                    ->map(fn (BookingGroup $group) => $this->formatBookingGroup($group))
                    ->values(),
                'pagination' => [
                    'current_page' => $groups->currentPage(),
                    'last_page' => $groups->lastPage(),
                    'per_page' => $groups->perPage(),
                    'total' => $groups->total(),
                ],
            ],
        ]);
    }

    public function riwayatPaket(Request $request): JsonResponse
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $groups = BookingGroup::query()
            ->with([
                'participant.user',
                'coursePackage',
                'instructor.user',
                'vehicle',
                'payment.verifier',
                'refund.processor',
                'refund.requester',
                'bookings' => function ($query) {
                    $query->orderBy('sesi_ke')->orderBy('id');
                },
                'bookings.trainingSchedule.timeSlot',
                'bookings.trainingSchedule.instructor.user',
                'bookings.trainingSchedule.vehicle',
                'bookings.trainingSchedule.coursePackage',
                'bookings.coursePackage',
                'bookings.trainingResult.certificate',
            ])
            ->where('participant_id', $participant->id)
            ->where(function ($query) {
                $query
                    ->where(function ($completedQuery) {
                        $completedQuery
                            ->where(function ($progressQuery) {
                                $progressQuery
                                    ->where('status', 'Selesai')
                                    ->orWhereColumn('jumlah_sesi_selesai', '>=', 'total_sesi');
                            })
                            ->whereHas('bookings.trainingResult.certificate', function ($certificateQuery) {
                                $certificateQuery->where('status', 'Terbit');
                            });
                    })
                    ->orWhere('status', 'Dibatalkan')
                    ->orWhere('status', 'Ditolak')
                    ->orWhereHas('payment', function ($paymentQuery) {
                        $paymentQuery->where('status', 'Ditolak');
                    });
            })
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_group', 'like', "%{$keyword}%")
                        ->orWhere('status', 'like', "%{$keyword}%")
                        ->orWhereHas('coursePackage', function ($packageQuery) use ($keyword) {
                            $packageQuery
                                ->where('nama_paket', 'like', "%{$keyword}%")
                                ->orWhere('kode_paket', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('instructor.user', function ($userQuery) use ($keyword) {
                            $userQuery->where('name', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('vehicle', function ($vehicleQuery) use ($keyword) {
                            $vehicleQuery
                                ->where('nama_kendaraan', 'like', "%{$keyword}%")
                                ->orWhere('nomor_plat', 'like', "%{$keyword}%")
                                ->orWhere('transmisi', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('tanggal_mulai'), function ($query) use ($request) {
                $query->whereDate('tanggal_booking', '>=', $request->query('tanggal_mulai'));
            })
            ->when($request->filled('tanggal_selesai'), function ($query) use ($request) {
                $query->whereDate('tanggal_booking', '<=', $request->query('tanggal_selesai'));
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data riwayat booking paket peserta berhasil diambil.',
            'data' => [
                'items' => collect($groups->items())
                    ->map(fn (BookingGroup $group) => $this->formatBookingGroup($group))
                    ->values(),
                'pagination' => [
                    'current_page' => $groups->currentPage(),
                    'last_page' => $groups->lastPage(),
                    'per_page' => $groups->perPage(),
                    'total' => $groups->total(),
                ],
            ],
        ]);
    }

    public function batalPaket(Request $request, string $id): JsonResponse
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'alasan_pembatalan' => ['nullable', 'string'],
            'bank_tujuan' => ['nullable', 'string', 'max:100'],
            'nomor_rekening' => ['nullable', 'string', 'max:50'],
            'nama_penerima' => ['nullable', 'string', 'max:150'],
            'catatan_refund' => ['nullable', 'string'],
        ]);

        $result = DB::transaction(function () use ($request, $participant, $id, $validated) {
            /** @var BookingGroup|null $group */
            $group = BookingGroup::query()
                ->where('participant_id', $participant->id)
                ->lockForUpdate()
                ->find($id);

            if (!$group) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Booking paket tidak ditemukan.',
                ];
            }

            if (in_array($group->status, ['Selesai', 'Dibatalkan'], true)) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Booking paket tidak dapat dibatalkan.',
                ];
            }

            $activeBookings = Booking::query()
                ->with(['trainingSchedule.timeSlot'])
                ->where('booking_group_id', $group->id)
                ->where('participant_id', $participant->id)
                ->whereNotIn('status', ['Selesai', 'Dibatalkan'])
                ->orderBy('sesi_ke')
                ->lockForUpdate()
                ->get();

            if ($activeBookings->isEmpty()) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Tidak ada sesi aktif yang dapat dibatalkan pada paket ini.',
                ];
            }

            $nearestBooking = $activeBookings
                ->filter(fn (Booking $booking) => $booking->trainingSchedule?->tanggal_latihan !== null)
                ->sortBy(function (Booking $booking) {
                    $schedule = $booking->trainingSchedule;
                    $date = $schedule?->tanggal_latihan
                        ? Carbon::parse($schedule->tanggal_latihan)->format('Y-m-d')
                        : '9999-12-31';
                    $startTime = $schedule?->timeSlot?->jam_mulai
                        ? DateFormatter::time($schedule->timeSlot->jam_mulai)
                        : '23:59:59';

                    return $date . ' ' . $startTime;
                })
                ->first();

            $windowValidation = $this->validatePackageCancelWindow($nearestBooking?->trainingSchedule?->tanggal_latihan);

            if (!$windowValidation['allowed']) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => $windowValidation['message'],
                    'data' => [
                        'deadline_date' => $windowValidation['deadline_date'] ?? null,
                        'training_date' => $windowValidation['training_date'] ?? null,
                    ],
                ];
            }

            /** @var BookingPayment|null $payment */
            $payment = BookingPayment::query()
                ->where('booking_group_id', $group->id)
                ->lockForUpdate()
                ->first();

            $hasUploadedPaymentProof = $payment
                && (!empty($payment->bukti_bayar_path) || !empty($payment->bukti_bayar));

            $needsRefund = $payment
                && (
                    $payment->status === 'Terkonfirmasi'
                    || ($payment->status === 'Menunggu Konfirmasi' && $hasUploadedPaymentProof)
                );

            if ($needsRefund) {
                $missingRefundFields = collect(['bank_tujuan', 'nomor_rekening', 'nama_penerima'])
                    ->filter(fn (string $field) => empty($validated[$field] ?? null))
                    ->values();

                if ($missingRefundFields->isNotEmpty()) {
                    return [
                        'error' => true,
                        'status' => 422,
                        'message' => 'Data rekening refund wajib diisi karena peserta sudah mengunggah bukti pembayaran atau pembayaran sudah terkonfirmasi.',
                        'data' => [
                            'required_fields' => $missingRefundFields,
                        ],
                    ];
                }
            }

            $reason = $validated['alasan_pembatalan'] ?? null;
            $oldGroupStatus = $group->status;
            $scheduleIds = $activeBookings
                ->pluck('training_schedule_id')
                ->filter()
                ->unique()
                ->values();

            foreach ($activeBookings as $booking) {
                $oldStatus = $booking->status;

                $booking->update([
                    'status' => 'Dibatalkan',
                    'tanggal_dibatalkan' => now(),
                    'alasan_pembatalan' => $reason,
                ]);

                BookingHistory::create([
                    'booking_id' => $booking->id,
                    'old_training_schedule_id' => $booking->training_schedule_id,
                    'new_training_schedule_id' => null,
                    'aksi' => 'Dibatalkan',
                    'status_sebelum' => $oldStatus,
                    'status_sesudah' => 'Dibatalkan',
                    'catatan' => $reason ?: 'Booking paket dibatalkan oleh peserta.',
                    'changed_by' => $request->user()->id,
                ]);
            }

            foreach ($scheduleIds as $scheduleId) {
                /** @var TrainingSchedule|null $schedule */
                $schedule = TrainingSchedule::query()
                    ->with('bookings')
                    ->lockForUpdate()
                    ->find($scheduleId);

                if ($schedule) {
                    BookingCapacityManager::syncFromBookings($schedule);
                }
            }

            $group->update([
                'status' => 'Dibatalkan',
                'tanggal_dibatalkan' => now(),
                'alasan_pembatalan' => $reason,
            ]);

            if ($payment && !$needsRefund && $payment->status !== 'Terkonfirmasi') {
                $payment->update([
                    'status' => 'Ditolak',
                    'tanggal_verifikasi' => now(),
                    'alasan_penolakan' => 'Booking paket dibatalkan oleh peserta sebelum pembayaran diverifikasi.',
                    'catatan_admin' => null,
                    'verified_by' => null,
                ]);
            }

            if ($needsRefund && $payment) {
                BookingRefund::updateOrCreate(
                    ['booking_group_id' => $group->id],
                    [
                        'booking_payment_id' => $payment->id,
                        'requested_by' => $request->user()->id,
                        'processed_by' => null,
                        'nominal_refund' => $payment->nominal_bayar,
                        'tipe_refund' => 'Penuh',
                        'status_refund' => 'Diajukan',
                        'bank_tujuan' => $validated['bank_tujuan'],
                        'nomor_rekening' => $validated['nomor_rekening'],
                        'nama_penerima' => $validated['nama_penerima'],
                        'alasan_refund' => $reason,
                        'catatan_peserta' => $validated['catatan_refund'] ?? null,
                        'catatan_admin' => null,
                        'tanggal_pengajuan' => now(),
                        'tanggal_diproses' => null,
                        'tanggal_refund' => null,
                    ]
                );
            }

            $this->syncParticipantAfterPackageCancellation($participant, $group);

            BookingHistory::create([
                'booking_id' => $activeBookings->first()->id,
                'old_training_schedule_id' => null,
                'new_training_schedule_id' => null,
                'aksi' => 'Dibatalkan',
                'status_sebelum' => $oldGroupStatus,
                'status_sesudah' => 'Dibatalkan',
                'catatan' => $reason ?: 'Seluruh paket booking dibatalkan oleh peserta.',
                'changed_by' => $request->user()->id,
            ]);

            /** @var BookingGroup $group */
            $group = BookingGroup::query()
                ->with([
                    'participant.user',
                    'coursePackage',
                    'instructor.user',
                    'vehicle',
                    'payment.verifier',
                'refund.processor',
                'refund.requester',
                    'bookings' => function ($query) {
                        $query->orderBy('sesi_ke')->orderBy('id');
                    },
                    'bookings.trainingSchedule.timeSlot',
                    'bookings.trainingSchedule.instructor.user',
                    'bookings.trainingSchedule.vehicle',
                    'bookings.trainingSchedule.coursePackage',
                    'bookings.coursePackage',
                    'bookings.trainingResult',
                ])
                ->findOrFail($group->id);

            return [
                'error' => false,
                'group' => $group,
            ];
        });

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
                'data' => $result['data'] ?? null,
            ], $result['status']);
        }

        $this->bookingWhatsAppNotificationService->notifyPackageCancelled($result['group']);

        return response()->json([
            'success' => true,
            'message' => 'Booking paket berhasil dibatalkan.',
            'data' => [
                'item' => $this->formatBookingGroup($result['group']),
            ],
        ]);
    }

    private function validatePackageCancelWindow($scheduleDate): array
    {
        if (!$scheduleDate) {
            return [
                'allowed' => false,
                'deadline_date' => null,
                'training_date' => null,
                'message' => 'Tanggal sesi terdekat pada paket ini tidak ditemukan.',
            ];
        }

        $today = now()->startOfDay();
        $trainingDate = Carbon::parse($scheduleDate)->startOfDay();
        $deadlineDate = $trainingDate->copy()->subDays(3);

        if ($today->gte($deadlineDate)) {
            return [
                'allowed' => false,
                'deadline_date' => $deadlineDate->toDateString(),
                'training_date' => $trainingDate->toDateString(),
                'message' => 'Booking paket tidak dapat dibatalkan karena sudah memasuki batas H-3 sebelum sesi terdekat.',
            ];
        }

        return [
            'allowed' => true,
            'deadline_date' => $deadlineDate->toDateString(),
            'training_date' => $trainingDate->toDateString(),
            'message' => null,
        ];
    }

    private function getAuthenticatedParticipant(Request $request): ?Participant
    {
        return Participant::query()
            ->where('user_id', $request->user()->id)
            ->first();
    }

    private function syncParticipantAfterPackageCancellation(Participant $participant, BookingGroup $cancelledGroup): void
    {
        /** @var Participant|null $participant */
        $participant = Participant::query()
            ->lockForUpdate()
            ->find($participant->id);

        if (!$participant) {
            return;
        }

        $activeGroups = BookingGroup::query()
            ->where('participant_id', $participant->id)
            ->where('id', '!=', $cancelledGroup->id)
            ->whereIn('status', [
                'Menunggu Pembayaran',
                'Menunggu Konfirmasi Pembayaran',
                'Dikonfirmasi',
                'Dijadwalkan Ulang',
                'Berlangsung',
            ])
            ->orderByDesc('tanggal_booking')
            ->orderByDesc('id')
            ->get();

        if ($activeGroups->isEmpty()) {
            $participant->update([
                'paket_aktif_id' => null,
                'jumlah_sesi_total' => 0,
                'jumlah_sesi_selesai' => 0,
                'jumlah_absen' => 0,
                'status_sertifikat' => 'Belum Ada',
            ]);

            return;
        }

        $activePackage = $activeGroups->first();
        $totalSessions = (int) $activeGroups->sum('total_sesi');
        $completedSessions = (int) $activeGroups->sum('jumlah_sesi_selesai');

        $participant->update([
            'paket_aktif_id' => $activePackage?->course_package_id,
            'jumlah_sesi_total' => max(0, $totalSessions),
            'jumlah_sesi_selesai' => max(0, min($completedSessions, $totalSessions)),
            'status_sertifikat' => $completedSessions > 0 ? 'Dalam Proses' : 'Belum Ada',
        ]);
    }

    private function formatBookingGroup(BookingGroup $group): array
    {
        $payment = $group->payment;
        $sessions = $group->bookings
            ? $group->bookings->map(fn (Booking $booking) => $this->formatSession($booking))->values()
            : collect();

        return [
            'id' => $group->id,
            'kode_group' => $group->kode_group,
            'status' => $group->status,
            'status_label' => $this->resolveGroupStatusLabel($group->status),
            'total_sesi' => (int) $group->total_sesi,
            'jumlah_sesi_selesai' => (int) $group->jumlah_sesi_selesai,
            'progress_label' => ((int) $group->jumlah_sesi_selesai) . '/' . ((int) $group->total_sesi) . ' sesi',
            'tanggal_booking' => DateFormatter::dateTime($group->tanggal_booking),
            'tanggal_dikonfirmasi' => DateFormatter::dateTime($group->tanggal_dikonfirmasi),
            'tanggal_dibatalkan' => DateFormatter::dateTime($group->tanggal_dibatalkan),
            'alasan_pembatalan' => $group->alasan_pembatalan,
            'catatan' => $group->catatan,
            'pakai_antar_jemput' => (bool) $group->pakai_antar_jemput,
            'pakai_sim' => (bool) $group->pakai_sim,
            'alamat_jemput' => $group->alamat_jemput,
            'harga_paket' => (int) $group->harga_paket,
            'course_package' => $group->coursePackage ? [
                'id' => $group->coursePackage->id,
                'kode_paket' => $group->coursePackage->kode_paket,
                'nama_paket' => $group->coursePackage->nama_paket,
                'durasi_jam' => (int) $group->coursePackage->durasi_jam,
            ] : null,
            'instructor' => $group->instructor ? [
                'id' => $group->instructor->id,
                'kode_instruktur' => $group->instructor->kode_instruktur,
                'nama_instruktur' => $group->instructor->user?->name,
                'spesialisasi' => $group->instructor->spesialisasi,
            ] : null,
            'vehicle' => $group->vehicle ? [
                'id' => $group->vehicle->id,
                'kode_kendaraan' => $group->vehicle->kode_kendaraan,
                'nama_kendaraan' => $group->vehicle->nama_kendaraan,
                'model' => $group->vehicle->model,
                'nomor_plat' => $group->vehicle->nomor_plat,
                'transmisi' => $group->vehicle->transmisi,
            ] : null,
            'payment' => $payment ? $this->formatPayment($payment) : null,
            'refund' => $group->refund ? $this->formatRefund($group->refund) : null,
            'certificate' => $this->resolveGroupCertificate($group),
            'sessions' => $sessions,
            'created_at' => DateFormatter::dateTime($group->created_at),
            'updated_at' => DateFormatter::dateTime($group->updated_at),
        ];
    }

    private function formatSession(Booking $booking): array
    {
        $schedule = $booking->trainingSchedule;
        $timeSlot = $schedule?->timeSlot;
        $window = $this->resolveChangeWindow($schedule?->tanggal_latihan, $booking->status);

        return [
            'id' => $booking->id,
            'kode_booking' => $booking->kode_booking,
            'sesi_ke' => (int) $booking->sesi_ke,
            'total_sesi' => (int) $booking->total_sesi,
            'status' => $booking->status,
            'status_label' => $this->resolveBookingStatusLabel($booking->status),
            'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),
            'can_change_or_cancel' => $window['allowed'],
            'change_deadline_date' => $window['deadline_date'],
            'change_window_message' => $window['message'],
            'training_schedule' => $schedule ? [
                'id' => $schedule->id,
                'kode_jadwal' => $schedule->kode_jadwal,
                'tanggal_latihan' => DateFormatter::date($schedule->tanggal_latihan),
                'status' => $schedule->status,
                'kapasitas' => (int) $schedule->kapasitas,
                'jumlah_booking' => (int) $schedule->jumlah_booking,
                'time_slot' => $timeSlot ? [
                    'id' => $timeSlot->id,
                    'kode_slot' => $timeSlot->kode_slot,
                    'nama_slot' => $timeSlot->nama_slot,
                    'subtitle' => $timeSlot->subtitle,
                    'jam_mulai' => DateFormatter::time($timeSlot->jam_mulai),
                    'jam_selesai' => DateFormatter::time($timeSlot->jam_selesai),
                    'durasi_menit' => (int) $timeSlot->durasi_menit,
                ] : null,
                'instructor' => $schedule->instructor ? [
                    'id' => $schedule->instructor->id,
                    'kode_instruktur' => $schedule->instructor->kode_instruktur,
                    'nama_instruktur' => $schedule->instructor->user?->name,
                ] : null,
                'vehicle' => $schedule->vehicle ? [
                    'id' => $schedule->vehicle->id,
                    'kode_kendaraan' => $schedule->vehicle->kode_kendaraan,
                    'nama_kendaraan' => $schedule->vehicle->nama_kendaraan,
                    'nomor_plat' => $schedule->vehicle->nomor_plat,
                    'transmisi' => $schedule->vehicle->transmisi,
                ] : null,
            ] : null,
            'training_result' => $booking->trainingResult ? [
                'id' => $booking->trainingResult->id,
                'status_kehadiran' => $booking->trainingResult->status_kehadiran,
                'nilai_akhir' => $booking->trainingResult->nilai_akhir !== null
                    ? (float) $booking->trainingResult->nilai_akhir
                    : null,
                'status_kelulusan' => $booking->trainingResult->status_kelulusan,
                'catatan_instruktur' => $booking->trainingResult->catatan_instruktur,
            ] : null,
        ];
    }

    private function resolveGroupCertificate(BookingGroup $group): ?array
    {
        $certificate = Certificate::query()
            ->where('peserta_id', $group->participant_id)
            ->where('paket_id', $group->course_package_id)
            ->where('status', 'Terbit')
            ->whereHas('trainingResult.booking', function ($query) use ($group) {
                $query->where('booking_group_id', $group->id);
            })
            ->latest('tanggal_terbit')
            ->latest('id')
            ->first();

        if (!$certificate) {
            return null;
        }

        return [
            'id' => $certificate->id,
            'nomor_sertifikat' => $certificate->nomor_sertifikat,
            'kode_verifikasi' => $certificate->kode_verifikasi,
            'status' => $certificate->status,
            'tanggal_terbit' => DateFormatter::date($certificate->tanggal_terbit),
        ];
    }

    private function formatPayment(BookingPayment $payment): array
    {
        return [
            'id' => $payment->id,
            'booking_id' => $payment->booking_id,
            'booking_group_id' => $payment->booking_group_id,
            'nominal_bayar' => (int) $payment->nominal_bayar,
            'metode_pembayaran' => $payment->metode_pembayaran ?: BookingPayment::METODE_TRANSFER,
            'metode_pembayaran_label' => $payment->paymentMethodLabel(),
            'status' => $payment->status,
            'ada_bukti_bayar' => $payment->isTransfer() && (!empty($payment->bukti_bayar_path) || !empty($payment->bukti_bayar)),
            'bukti_bayar_url' => $this->resolvePaymentProofUrl($payment),
            'nama_pengirim' => $payment->nama_pengirim,
            'bank_pengirim' => $payment->bank_pengirim,
            'tanggal_upload' => DateFormatter::dateTime($payment->tanggal_upload),
            'tanggal_verifikasi' => DateFormatter::dateTime($payment->tanggal_verifikasi),
            'catatan_peserta' => $payment->catatan_peserta,
            'catatan_admin' => $payment->catatan_admin,
            'alasan_penolakan' => $payment->alasan_penolakan,
        ];
    }

    private function formatRefund(BookingRefund $refund): array
    {
        return [
            'id' => $refund->id,
            'booking_group_id' => $refund->booking_group_id,
            'booking_payment_id' => $refund->booking_payment_id,
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
            'processed_by' => $refund->processor ? [
                'id' => $refund->processor->id,
                'name' => $refund->processor->name,
                'email' => $refund->processor->email,
            ] : null,
        ];
    }

    private function resolvePaymentProofUrl(BookingPayment $payment): ?string
    {
        if (!$payment->booking_id || (empty($payment->bukti_bayar_path) && empty($payment->bukti_bayar))) {
            return null;
        }

        return route('peserta.booking.bukti-bayar', ['id' => $payment->booking_id]);
    }

    private function resolveChangeWindow($scheduleDate, string $bookingStatus): array
    {
        if (in_array($bookingStatus, ['Selesai', 'Dibatalkan'], true) || !$scheduleDate) {
            return [
                'allowed' => false,
                'deadline_date' => null,
                'message' => 'Sesi ini tidak dapat diubah atau dibatalkan.',
            ];
        }

        $today = now()->startOfDay();
        $trainingDate = Carbon::parse($scheduleDate)->startOfDay();
        $deadlineDate = $trainingDate->copy()->subDays(3);

        if ($today->gte($deadlineDate)) {
            return [
                'allowed' => false,
                'deadline_date' => $deadlineDate->toDateString(),
                'message' => 'Sudah masuk batas H-3. Tombol ubah dan batal tidak ditampilkan.',
            ];
        }

        return [
            'allowed' => true,
            'deadline_date' => $deadlineDate->toDateString(),
            'message' => null,
        ];
    }

    private function resolveGroupStatusLabel(string $status): string
    {
        return match ($status) {
            'Menunggu Pembayaran' => 'MENUNGGU PEMBAYARAN',
            'Menunggu Konfirmasi Pembayaran' => 'MENUNGGU KONFIRMASI',
            'Dikonfirmasi' => 'TERKONFIRMASI',
            'Dijadwalkan Ulang' => 'DIJADWALKAN ULANG',
            'Selesai' => 'SELESAI',
            'Dibatalkan' => 'DIBATALKAN',
            default => strtoupper($status),
        };
    }

    private function resolveBookingStatusLabel(string $status): string
    {
        return match ($status) {
            'Menunggu Pembayaran' => 'MENUNGGU PEMBAYARAN',
            'Menunggu Konfirmasi Pembayaran' => 'MENUNGGU KONFIRMASI',
            'Dikonfirmasi' => 'TERKONFIRMASI',
            'Dijadwalkan Ulang' => 'DIJADWALKAN ULANG',
            'Selesai' => 'SELESAI',
            'Dibatalkan' => 'DIBATALKAN',
            default => strtoupper($status),
        };
    }
}
