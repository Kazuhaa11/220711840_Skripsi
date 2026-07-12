<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingGroup;
use App\Models\BookingHistory;
use App\Models\BookingPayment;
use App\Models\Participant;
use App\Models\TrainingSchedule;
use App\Services\BookingWhatsAppNotificationService;
use App\Support\BookingCapacityManager;
use App\Support\BookingPaymentProofResponder;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingGroupAdminController extends Controller
{
    public function __construct(
        private readonly BookingWhatsAppNotificationService $bookingWhatsAppNotificationService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $groups = BookingGroup::query()
            ->with($this->relations())
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_group', 'like', "%{$keyword}%")
                        ->orWhere('status', 'like', "%{$keyword}%")
                        ->orWhereHas('participant.user', function ($userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%")
                                ->orWhere('no_telepon', 'like', "%{$keyword}%");
                        })
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
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('payment_status'), function ($query) use ($request) {
                $query->whereHas('payment', function ($paymentQuery) use ($request) {
                    $paymentQuery->where('status', $request->query('payment_status'));
                });
            })
            ->when($request->filled('metode_pembayaran'), function ($query) use ($request) {
                $query->whereHas('payment', function ($paymentQuery) use ($request) {
                    $paymentQuery->where('metode_pembayaran', $request->query('metode_pembayaran'));
                });
            })
            ->when($request->filled('participant_id'), function ($query) use ($request) {
                $query->where('participant_id', $request->query('participant_id'));
            })
            ->when($request->filled('course_package_id'), function ($query) use ($request) {
                $query->where('course_package_id', $request->query('course_package_id'));
            })
            ->when($request->filled('tanggal'), function ($query) use ($request) {
                $query->whereHas('bookings.trainingSchedule', function ($scheduleQuery) use ($request) {
                    $scheduleQuery->whereDate('tanggal_latihan', $request->query('tanggal'));
                });
            })
            ->when($request->filled('tanggal_mulai'), function ($query) use ($request) {
                $query->whereHas('bookings.trainingSchedule', function ($scheduleQuery) use ($request) {
                    $scheduleQuery->whereDate('tanggal_latihan', '>=', $request->query('tanggal_mulai'));
                });
            })
            ->when($request->filled('tanggal_selesai'), function ($query) use ($request) {
                $query->whereHas('bookings.trainingSchedule', function ($scheduleQuery) use ($request) {
                    $scheduleQuery->whereDate('tanggal_latihan', '<=', $request->query('tanggal_selesai'));
                });
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data booking paket berhasil diambil.',
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

    public function show(string $id): JsonResponse
    {
        $group = BookingGroup::query()
            ->with($this->relations())
            ->find($id);

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Booking paket tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail booking paket berhasil diambil.',
            'data' => [
                'item' => $this->formatBookingGroup($group, true),
            ],
        ]);
    }

    public function konfirmasiPembayaran(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'catatan_admin' => ['nullable', 'string'],
        ]);

        $result = DB::transaction(function () use ($request, $id, $validated) {
            /** @var BookingGroup|null $group */
            $group = BookingGroup::query()
                ->with(['payment', 'bookings.trainingSchedule'])
                ->lockForUpdate()
                ->find($id);

            if (!$group) {
                return $this->error(404, 'Booking paket tidak ditemukan.');
            }

            /** @var BookingPayment|null $payment */
            $payment = BookingPayment::query()
                ->where('booking_group_id', $group->id)
                ->lockForUpdate()
                ->first();

            if (!$payment) {
                return $this->error(404, 'Data pembayaran booking paket tidak ditemukan.');
            }

            if ($payment->status !== 'Menunggu Konfirmasi') {
                return $this->error(422, 'Pembayaran paket hanya dapat dikonfirmasi jika statusnya Menunggu Konfirmasi.');
            }

            if ($group->status !== 'Menunggu Konfirmasi Pembayaran') {
                return $this->error(422, 'Booking paket tidak berada pada status menunggu konfirmasi pembayaran.');
            }

            $oldGroupStatus = $group->status;

            $payment->update([
                'status' => 'Terkonfirmasi',
                'tanggal_verifikasi' => now(),
                'catatan_admin' => $validated['catatan_admin'] ?? null,
                'alasan_penolakan' => null,
                'verified_by' => $request->user()->id,
            ]);

            $group->update([
                'status' => 'Dikonfirmasi',
                'tanggal_dikonfirmasi' => now(),
                'tanggal_dibatalkan' => null,
                'alasan_pembatalan' => null,
            ]);

            $group->bookings->each(function (Booking $booking) use ($request, $validated) {
                if (in_array($booking->status, ['Selesai', 'Dibatalkan'], true)) {
                    return;
                }

                $oldStatus = $booking->status;

                $booking->update([
                    'status' => 'Dikonfirmasi',
                    'tanggal_dikonfirmasi' => now(),
                    'tanggal_dibatalkan' => null,
                    'alasan_pembatalan' => null,
                ]);

                if ($booking->trainingSchedule) {
                    BookingCapacityManager::syncStatus($booking->trainingSchedule);
                }

                BookingHistory::create([
                    'booking_id' => $booking->id,
                    'old_training_schedule_id' => $booking->training_schedule_id,
                    'new_training_schedule_id' => $booking->training_schedule_id,
                    'aksi' => 'Pembayaran Dikonfirmasi',
                    'status_sebelum' => $oldStatus,
                    'status_sesudah' => 'Dikonfirmasi',
                    'catatan' => $validated['catatan_admin'] ?? 'Pembayaran paket dikonfirmasi oleh admin.',
                    'changed_by' => $request->user()->id,
                ]);
            });

            return [
                'error' => false,
                'group_id' => $group->id,
                'old_status' => $oldGroupStatus,
            ];
        });

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        $group = BookingGroup::query()
            ->with($this->relations())
            ->find($result['group_id']);

        if ($group) {
            $this->bookingWhatsAppNotificationService->notifyPaymentConfirmed($group);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran paket berhasil dikonfirmasi. Semua sesi dalam paket sudah valid.',
            'data' => [
                'item' => $this->formatBookingGroup($group, true),
            ],
        ]);
    }

    public function tolakPembayaran(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'alasan_penolakan' => ['required', 'string'],
            'catatan_admin' => ['nullable', 'string'],
        ], [
            'alasan_penolakan.required' => 'Alasan penolakan wajib diisi.',
        ]);

        $result = DB::transaction(function () use ($request, $id, $validated) {
            /** @var BookingGroup|null $group */
            $group = BookingGroup::query()
                ->with(['payment', 'bookings.trainingSchedule'])
                ->lockForUpdate()
                ->find($id);

            if (!$group) {
                return $this->error(404, 'Booking paket tidak ditemukan.');
            }

            /** @var BookingPayment|null $payment */
            $payment = BookingPayment::query()
                ->where('booking_group_id', $group->id)
                ->lockForUpdate()
                ->first();

            if (!$payment) {
                return $this->error(404, 'Data pembayaran booking paket tidak ditemukan.');
            }

            if ($payment->status !== 'Menunggu Konfirmasi') {
                return $this->error(422, 'Pembayaran paket hanya dapat ditolak jika statusnya Menunggu Konfirmasi.');
            }

            if ($group->status !== 'Menunggu Konfirmasi Pembayaran') {
                return $this->error(422, 'Pembayaran paket hanya dapat ditolak jika booking paket masih berstatus Menunggu Konfirmasi Pembayaran.');
            }

            $payment->update([
                'status' => 'Ditolak',
                'tanggal_verifikasi' => now(),
                'catatan_admin' => $validated['catatan_admin'] ?? null,
                'alasan_penolakan' => $validated['alasan_penolakan'],
                'verified_by' => $request->user()->id,
            ]);

            $group->update([
                'status' => 'Menunggu Pembayaran',
                'tanggal_dikonfirmasi' => null,
            ]);

            $group->bookings->each(function (Booking $booking) use ($request, $validated) {
                if (in_array($booking->status, ['Selesai', 'Dibatalkan'], true)) {
                    return;
                }

                $oldStatus = $booking->status;

                $booking->update([
                    'status' => 'Menunggu Pembayaran',
                    'tanggal_dikonfirmasi' => null,
                ]);

                if ($booking->trainingSchedule) {
                    BookingCapacityManager::syncStatus($booking->trainingSchedule);
                }

                BookingHistory::create([
                    'booking_id' => $booking->id,
                    'old_training_schedule_id' => $booking->training_schedule_id,
                    'new_training_schedule_id' => $booking->training_schedule_id,
                    'aksi' => 'Pembayaran Ditolak',
                    'status_sebelum' => $oldStatus,
                    'status_sesudah' => 'Menunggu Pembayaran',
                    'catatan' => $validated['alasan_penolakan'],
                    'changed_by' => $request->user()->id,
                ]);
            });

            return [
                'error' => false,
                'group_id' => $group->id,
            ];
        });

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        $group = BookingGroup::query()
            ->with($this->relations())
            ->find($result['group_id']);

        if ($group) {
            $this->bookingWhatsAppNotificationService->notifyPaymentRejected($group);
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran paket berhasil ditolak. Peserta dapat mengunggah ulang bukti pembayaran.',
            'data' => [
                'item' => $this->formatBookingGroup($group, true),
            ],
        ]);
    }

    public function buktiBayar(string $id): mixed
    {
        $group = BookingGroup::query()
            ->with('payment')
            ->find($id);

        if (!$group || !$group->payment) {
            return response()->json([
                'success' => false,
                'message' => 'Bukti bayar tidak ditemukan.',
            ], 404);
        }

        return BookingPaymentProofResponder::response($group->payment);
    }

    public function batal(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'alasan_pembatalan' => ['nullable', 'string'],
        ]);

        $reason = trim((string) ($validated['alasan_pembatalan'] ?? ''))
            ?: 'Booking paket dibatalkan oleh admin.';

        $result = DB::transaction(function () use ($request, $id, $reason) {
            /** @var BookingGroup|null $group */
            $group = BookingGroup::query()
                ->with(['payment', 'participant', 'bookings.trainingSchedule'])
                ->lockForUpdate()
                ->find($id);

            if (!$group) {
                return $this->error(404, 'Booking paket tidak ditemukan.');
            }

            if (in_array($group->status, ['Selesai', 'Dibatalkan'], true)) {
                return $this->error(422, 'Booking paket tidak dapat dibatalkan karena sudah selesai atau sudah dibatalkan.');
            }

            $oldGroupStatus = $group->status;
            $activeBookings = $group->bookings
                ? $group->bookings->whereNotIn('status', ['Selesai', 'Dibatalkan'])->values()
                : collect();

            if ($activeBookings->isEmpty()) {
                return $this->error(422, 'Booking paket tidak memiliki sesi aktif yang dapat dibatalkan.');
            }

            $scheduleIds = [];

            $activeBookings->each(function (Booking $booking) use ($request, $reason, &$scheduleIds) {
                $oldStatus = $booking->status;

                if (BookingCapacityManager::occupiesCapacity($booking->status) && $booking->training_schedule_id) {
                    $scheduleIds[] = $booking->training_schedule_id;
                }

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
                    'catatan' => $reason,
                    'changed_by' => $request->user()->id,
                ]);
            });

            collect($scheduleIds)
                ->unique()
                ->each(function ($scheduleId) {
                    $schedule = TrainingSchedule::query()
                        ->with('bookings')
                        ->lockForUpdate()
                        ->find($scheduleId);

                    if ($schedule) {
                        BookingCapacityManager::syncFromBookings($schedule);
                    }
                });

            /** @var BookingPayment|null $payment */
            $payment = BookingPayment::query()
                ->where('booking_group_id', $group->id)
                ->lockForUpdate()
                ->first();

            if ($payment && $payment->status !== 'Terkonfirmasi') {
                $payment->update([
                    'status' => 'Ditolak',
                    'tanggal_verifikasi' => now(),
                    'alasan_penolakan' => 'Booking paket dibatalkan oleh admin sebelum pembayaran dikonfirmasi.',
                    'catatan_admin' => $reason,
                    'verified_by' => $request->user()->id,
                ]);
            } elseif ($payment && $payment->status === 'Terkonfirmasi') {
                $payment->update([
                    'catatan_admin' => trim(($payment->catatan_admin ? $payment->catatan_admin . "\n" : '') . 'Booking paket dibatalkan oleh admin setelah pembayaran terkonfirmasi. Proses refund manual bila diperlukan.'),
                ]);
            }

            $group->update([
                'status' => 'Dibatalkan',
                'tanggal_dibatalkan' => now(),
                'alasan_pembatalan' => $reason,
            ]);

            if ($group->participant) {
                $this->syncParticipantAfterPackageCancellation($group->participant, $group);
            }

            return [
                'error' => false,
                'group_id' => $group->id,
                'old_status' => $oldGroupStatus,
            ];
        });

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        $group = BookingGroup::query()
            ->with($this->relations())
            ->find($result['group_id']);

        if ($group) {
            $this->bookingWhatsAppNotificationService->notifyPackageCancelled($group);
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking paket berhasil dibatalkan oleh admin. Semua sesi paket ikut dibatalkan.',
            'data' => [
                'item' => $this->formatBookingGroup($group, true),
            ],
        ]);
    }

    private function syncParticipantAfterPackageCancellation(Participant $participant, BookingGroup $cancelledGroup): void
    {
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

        $participant->update([
            'paket_aktif_id' => $activePackage->course_package_id,
            'jumlah_sesi_total' => (int) $activeGroups->sum('total_sesi'),
            'jumlah_sesi_selesai' => (int) $activeGroups->sum('jumlah_sesi_selesai'),
        ]);
    }

    private function relations(): array
    {
        return [
            'participant.user',
            'coursePackage',
            'instructor.user',
            'vehicle',
            'payment.verifier',
            'bookings' => function ($query) {
                $query->orderBy('sesi_ke')->orderBy('id');
            },
            'bookings.trainingSchedule.timeSlot',
            'bookings.trainingSchedule.instructor.user',
            'bookings.trainingSchedule.vehicle',
            'bookings.trainingSchedule.coursePackage',
            'bookings.coursePackage',
            'bookings.payment.verifier',
            'bookings.trainingResult',
            'bookings.histories.changedBy',
        ];
    }

    private function formatBookingGroup(?BookingGroup $group, bool $includeHistories = false): array
    {
        if (!$group) {
            return [];
        }

        $firstBooking = $group->bookings?->sortBy('sesi_ke')->first();
        $payment = $group->payment;
        $sessions = $group->bookings
            ? $group->bookings->map(fn (Booking $booking) => $this->formatSession($booking))->values()
            : collect();

        return [
            'id' => $group->id,
            'kode_booking' => $group->kode_group,
            'kode_group' => $group->kode_group,
            'booking_group_id' => $group->id,
            'status' => $group->status,
            'status_label' => $this->resolveStatusLabel($group->status),
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
            'peserta' => $group->participant ? [
                'id' => $group->participant->id,
                'kode_peserta' => $group->participant->kode_peserta,
                'nama_peserta' => $group->participant->user?->name,
                'email' => $group->participant->user?->email,
                'no_telepon' => $group->participant->user?->no_telepon,
            ] : null,
            'course_package' => $group->coursePackage ? [
                'id' => $group->coursePackage->id,
                'kode_paket' => $group->coursePackage->kode_paket,
                'nama_paket' => $group->coursePackage->nama_paket,
                'durasi_jam' => (int) $group->coursePackage->durasi_jam,
            ] : null,
            'training_schedule' => $firstBooking?->trainingSchedule ? $this->formatSchedule($firstBooking->trainingSchedule) : null,
            'payment' => $payment ? $this->formatPayment($payment) : null,
            'sessions' => $sessions,
            'histories' => $includeHistories ? $this->formatHistories($group) : [],
            'created_at' => DateFormatter::dateTime($group->created_at),
            'updated_at' => DateFormatter::dateTime($group->updated_at),
        ];
    }

    private function formatSession(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'kode_booking' => $booking->kode_booking,
            'sesi_ke' => (int) $booking->sesi_ke,
            'total_sesi' => (int) $booking->total_sesi,
            'status' => $booking->status,
            'status_label' => $this->resolveStatusLabel($booking->status),
            'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),
            'training_schedule' => $booking->trainingSchedule ? $this->formatSchedule($booking->trainingSchedule) : null,
            'training_result' => $booking->trainingResult ? [
                'id' => $booking->trainingResult->id,
                'status_kehadiran' => $booking->trainingResult->status_kehadiran,
                'nilai_akhir' => $booking->trainingResult->nilai_akhir !== null ? (float) $booking->trainingResult->nilai_akhir : null,
                'status_kelulusan' => $booking->trainingResult->status_kelulusan,
                'catatan_instruktur' => $booking->trainingResult->catatan_instruktur,
            ] : null,
        ];
    }

    private function formatSchedule($schedule): array
    {
        return [
            'id' => $schedule->id,
            'kode_jadwal' => $schedule->kode_jadwal,
            'tanggal_latihan' => DateFormatter::date($schedule->tanggal_latihan),
            'status' => $schedule->status,
            'kapasitas' => (int) $schedule->kapasitas,
            'jumlah_booking' => (int) $schedule->jumlah_booking,
            'time_slot' => $schedule->timeSlot ? [
                'id' => $schedule->timeSlot->id,
                'kode_slot' => $schedule->timeSlot->kode_slot,
                'nama_slot' => $schedule->timeSlot->nama_slot,
                'subtitle' => $schedule->timeSlot->subtitle,
                'jam_mulai' => DateFormatter::time($schedule->timeSlot->jam_mulai),
                'jam_selesai' => DateFormatter::time($schedule->timeSlot->jam_selesai),
                'durasi_menit' => (int) $schedule->timeSlot->durasi_menit,
            ] : null,
            'instructor' => $schedule->instructor ? [
                'id' => $schedule->instructor->id,
                'kode_instruktur' => $schedule->instructor->kode_instruktur,
                'nama_instruktur' => $schedule->instructor->user?->name,
                'spesialisasi' => $schedule->instructor->spesialisasi,
            ] : null,
            'vehicle' => $schedule->vehicle ? [
                'id' => $schedule->vehicle->id,
                'kode_kendaraan' => $schedule->vehicle->kode_kendaraan,
                'nama_kendaraan' => $schedule->vehicle->nama_kendaraan,
                'model' => $schedule->vehicle->model,
                'nomor_plat' => $schedule->vehicle->nomor_plat,
                'transmisi' => $schedule->vehicle->transmisi,
            ] : null,
            'course_package' => $schedule->coursePackage ? [
                'id' => $schedule->coursePackage->id,
                'kode_paket' => $schedule->coursePackage->kode_paket,
                'nama_paket' => $schedule->coursePackage->nama_paket,
                'durasi_jam' => (int) $schedule->coursePackage->durasi_jam,
            ] : null,
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
            'bukti_bayar' => null,
            'bukti_bayar_url' => ($payment->isTransfer() && (!empty($payment->bukti_bayar_path) || !empty($payment->bukti_bayar)))
                ? route('admin.booking-paket.bukti-bayar', ['id' => $payment->booking_group_id])
                : null,
            'bukti_bayar_original_name' => $payment->bukti_bayar_original_name,
            'bukti_bayar_mime' => $payment->bukti_bayar_mime,
            'bukti_bayar_size' => $payment->bukti_bayar_size ? (int) $payment->bukti_bayar_size : null,
            'ada_bukti_bayar' => $payment->isTransfer() && (!empty($payment->bukti_bayar_path) || !empty($payment->bukti_bayar)),
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
        ];
    }

    private function formatHistories(BookingGroup $group): array
    {
        return $group->bookings
            ? $group->bookings
                ->flatMap(fn (Booking $booking) => $booking->histories ?? collect())
                ->sortByDesc('created_at')
                ->values()
                ->map(fn (BookingHistory $history) => [
                    'id' => $history->id,
                    'aksi' => $history->aksi,
                    'status_sebelum' => $history->status_sebelum,
                    'status_sesudah' => $history->status_sesudah,
                    'catatan' => $history->catatan,
                    'changed_by' => $history->changedBy ? [
                        'id' => $history->changedBy->id,
                        'name' => $history->changedBy->name,
                        'email' => $history->changedBy->email,
                    ] : null,
                    'created_at' => DateFormatter::dateTime($history->created_at),
                ])
                ->all()
            : [];
    }

    private function resolveStatusLabel(?string $status): string
    {
        return match ($status) {
            'Menunggu Pembayaran' => 'MENUNGGU PEMBAYARAN',
            'Menunggu Konfirmasi Pembayaran' => 'MENUNGGU KONFIRMASI',
            'Dikonfirmasi' => 'TERKONFIRMASI',
            'Dijadwalkan Ulang' => 'DIJADWALKAN ULANG',
            'Selesai' => 'SELESAI',
            'Dibatalkan' => 'DIBATALKAN',
            default => strtoupper((string) $status),
        };
    }

    private function error(int $status, string $message): array
    {
        return [
            'error' => true,
            'status' => $status,
            'message' => $message,
        ];
    }
}
