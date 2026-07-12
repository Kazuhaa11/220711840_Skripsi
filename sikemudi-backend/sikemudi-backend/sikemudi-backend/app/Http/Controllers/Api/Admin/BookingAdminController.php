<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingHistory;
use App\Models\BookingPayment;
use App\Models\CoursePackage;
use App\Models\Participant;
use App\Models\TrainingSchedule;
use App\Services\BookingPaymentVerificationService;
use App\Support\BookingCapacityManager;
use App\Support\BookingPaymentProofResponder;
use App\Support\CourseProgressManager;
use App\Support\DateFormatter;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use RuntimeException;

class BookingAdminController extends Controller
{
    public function __construct(private BookingPaymentVerificationService $paymentVerificationService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $bookings = Booking::query()
            ->with([
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment.verifier',
                'trainingResult',
            ])
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_booking', 'like', "%{$keyword}%")
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
                        ->orWhereHas('trainingSchedule', function ($scheduleQuery) use ($keyword) {
                            $scheduleQuery->where('kode_jadwal', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('trainingSchedule.instructor.user', function ($userQuery) use ($keyword) {
                            $userQuery->where('name', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('trainingSchedule.vehicle', function ($vehicleQuery) use ($keyword) {
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
            ->when($request->filled('participant_id'), function ($query) use ($request) {
                $query->where('participant_id', $request->query('participant_id'));
            })
            ->when($request->filled('course_package_id'), function ($query) use ($request) {
                $query->where('course_package_id', $request->query('course_package_id'));
            })
            ->when($request->filled('tanggal'), function ($query) use ($request) {
                $query->whereHas('trainingSchedule', function ($scheduleQuery) use ($request) {
                    $scheduleQuery->whereDate('tanggal_latihan', $request->query('tanggal'));
                });
            })
            ->when($request->filled('tanggal_mulai'), function ($query) use ($request) {
                $query->whereHas('trainingSchedule', function ($scheduleQuery) use ($request) {
                    $scheduleQuery->whereDate('tanggal_latihan', '>=', $request->query('tanggal_mulai'));
                });
            })
            ->when($request->filled('tanggal_selesai'), function ($query) use ($request) {
                $query->whereHas('trainingSchedule', function ($scheduleQuery) use ($request) {
                    $scheduleQuery->whereDate('tanggal_latihan', '<=', $request->query('tanggal_selesai'));
                });
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data booking berhasil diambil.',
            'data' => [
                'items' => collect($bookings->items())
                    ->map(fn(Booking $booking) => $this->formatBooking($booking))
                    ->values(),
                'pagination' => [
                    'current_page' => $bookings->currentPage(),
                    'last_page' => $bookings->lastPage(),
                    'per_page' => $bookings->perPage(),
                    'total' => $bookings->total(),
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'participant_id' => ['required', 'exists:participants,id'],
            'training_schedule_id' => ['required', 'exists:training_schedules,id'],
            'course_package_id' => ['required', 'exists:course_packages,id'],
            'pakai_antar_jemput' => ['required', 'boolean'],
            'pakai_sim' => ['required', 'boolean'],
            'alamat_jemput' => ['nullable', 'string'],
            'catatan' => ['nullable', 'string'],
        ], [
            'participant_id.required' => 'Peserta wajib dipilih.',
            'participant_id.exists' => 'Peserta tidak ditemukan.',
            'training_schedule_id.required' => 'Jadwal latihan wajib dipilih.',
            'training_schedule_id.exists' => 'Jadwal latihan tidak ditemukan.',
            'course_package_id.required' => 'Paket kursus wajib dipilih.',
            'course_package_id.exists' => 'Paket kursus tidak ditemukan.',
            'pakai_antar_jemput.required' => 'Pilihan antar jemput wajib diisi.',
            'pakai_sim.required' => 'Pilihan layanan SIM wajib diisi.',
        ]);

        $result = DB::transaction(function () use ($request, $validated) {
            /** @var Participant|null $participant */
            $participant = Participant::query()
                ->with('user')
                ->lockForUpdate()
                ->find($validated['participant_id']);

            if (!$participant) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Peserta tidak ditemukan.',
                ];
            }

            if ($participant->user?->status_akun !== 'Aktif') {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Akun peserta tidak aktif.',
                ];
            }

            /** @var TrainingSchedule|null $schedule */
            $schedule = TrainingSchedule::query()
                ->with(['timeSlot', 'instructor.user', 'vehicle', 'coursePackage'])
                ->lockForUpdate()
                ->find($validated['training_schedule_id']);

            if (!$schedule) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Jadwal latihan tidak ditemukan.',
                ];
            }

            if (!$schedule->isAvailable()) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Jadwal latihan sudah tidak tersedia.',
                ];
            }

            $scheduleDate = Carbon::parse($schedule->tanggal_latihan)->startOfDay();

            if ($scheduleDate->lt(now()->startOfDay())) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Jadwal latihan yang sudah lewat tidak dapat dibooking.',
                ];
            }

            /** @var CoursePackage|null $package */
            $package = CoursePackage::query()
                ->where('status', 'Aktif')
                ->find($validated['course_package_id']);

            if (!$package) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Paket kursus tidak aktif atau tidak ditemukan.',
                ];
            }

            if ($schedule->course_package_id && (int) $schedule->course_package_id !== (int) $package->id) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Paket kursus tidak sesuai dengan jadwal latihan yang dipilih.',
                ];
            }

            $packageValidation = $this->validateParticipantCanBookPackage($participant, $package);

            if ($packageValidation) {
                return $packageValidation;
            }

            if ((bool) $validated['pakai_antar_jemput'] && empty($validated['alamat_jemput'])) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Alamat jemput wajib diisi jika memilih layanan antar jemput.',
                ];
            }

            $hasActiveBookingAtSameSchedule = Booking::query()
                ->where('participant_id', $participant->id)
                ->where('training_schedule_id', $schedule->id)
                ->whereNotIn('status', ['Dibatalkan'])
                ->exists();

            if ($hasActiveBookingAtSameSchedule) {
                return [
                    'error' => true,
                    'status' => 409,
                    'message' => 'Peserta sudah memiliki booking pada jadwal ini.',
                ];
            }

            $hasActiveBookingAtSameTime = Booking::query()
                ->where('participant_id', $participant->id)
                ->whereNotIn('status', ['Dibatalkan', 'Selesai'])
                ->whereHas('trainingSchedule', function ($query) use ($schedule) {
                    $query
                        ->whereDate('tanggal_latihan', $schedule->tanggal_latihan)
                        ->where('time_slot_id', $schedule->time_slot_id);
                })
                ->exists();

            if ($hasActiveBookingAtSameTime) {
                return [
                    'error' => true,
                    'status' => 409,
                    'message' => 'Peserta sudah memiliki booking pada tanggal dan slot waktu yang sama.',
                ];
            }

            if (!BookingCapacityManager::hasCapacity($schedule)) {
                return [
                    'error' => true,
                    'status' => 409,
                    'message' => 'Kapasitas jadwal sudah penuh. Silakan pilih jadwal lain.',
                ];
            }

            $price = $this->resolvePackagePrice(
                $package,
                (bool) $validated['pakai_antar_jemput'],
                (bool) $validated['pakai_sim']
            );

            $booking = $this->createBookingWithUniqueCode([
                'participant_id' => $participant->id,
                'training_schedule_id' => $schedule->id,
                'course_package_id' => $package->id,
                'pakai_antar_jemput' => (bool) $validated['pakai_antar_jemput'],
                'pakai_sim' => (bool) $validated['pakai_sim'],
                'alamat_jemput' => $validated['alamat_jemput'] ?? null,
                'harga_paket' => $price,
                'status' => 'Menunggu Pembayaran',
                'tanggal_booking' => now(),
                'catatan' => $validated['catatan'] ?? null,
            ]);

            BookingPayment::create([
                'booking_id' => $booking->id,
                'nominal_bayar' => 0,
                'bukti_bayar' => null,
                'tanggal_upload' => null,
                'tanggal_verifikasi' => null,
                'status' => 'Belum Upload',
            ]);

            BookingCapacityManager::reserve($schedule);
            CourseProgressManager::startOrSyncActivePackage($participant, $package, $schedule);

            BookingHistory::create([
                'booking_id' => $booking->id,
                'old_training_schedule_id' => null,
                'new_training_schedule_id' => $schedule->id,
                'aksi' => 'Dibuat',
                'status_sebelum' => null,
                'status_sesudah' => 'Menunggu Pembayaran',
                'catatan' => 'Booking dibuat oleh admin dan menunggu pembayaran.',
                'changed_by' => $request->user()->id,
            ]);

            $booking = $booking->fresh([
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment',
            ]);

            return [
                'error' => false,
                'booking' => $booking,
            ];
        });

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil dibuat oleh admin.',
            'data' => [
                'item' => $this->formatBooking($result['booking']),
            ],
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $booking = Booking::query()
            ->with([
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment.verifier',
                'trainingResult.instructor.user',
                'histories.changedBy',
            ])
            ->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail booking berhasil diambil.',
            'data' => [
                'item' => $this->formatBooking($booking, true),
            ],
        ]);
    }

    public function ubahJadwal(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'training_schedule_id' => ['required', 'exists:training_schedules,id'],
            'catatan' => ['nullable', 'string'],
        ], [
            'training_schedule_id.required' => 'Jadwal latihan baru wajib dipilih.',
            'training_schedule_id.exists' => 'Jadwal latihan baru tidak ditemukan.',
        ]);

        $result = DB::transaction(function () use ($request, $id, $validated) {
            /** @var Booking|null $booking */
            $booking = Booking::query()
                ->with(['payment', 'trainingSchedule'])
                ->lockForUpdate()
                ->find($id);

            if (!$booking) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Booking tidak ditemukan.',
                ];
            }

            $allowedRescheduleStatuses = [
                'Menunggu Pembayaran',
                'Menunggu Konfirmasi Pembayaran',
                'Dikonfirmasi',
                'Dijadwalkan Ulang',
            ];

            if (!in_array($booking->status, $allowedRescheduleStatuses, true)) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Jadwal booking hanya dapat diubah jika pembayaran sedang menunggu konfirmasi atau booking sudah dikonfirmasi.',
                ];
            }

            if ((int) $booking->training_schedule_id === (int) $validated['training_schedule_id']) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Jadwal baru tidak boleh sama dengan jadwal lama.',
                ];
            }

            /** @var TrainingSchedule|null $oldSchedule */
            $oldSchedule = TrainingSchedule::query()
                ->lockForUpdate()
                ->find($booking->training_schedule_id);

            /** @var TrainingSchedule|null $newSchedule */
            $newSchedule = TrainingSchedule::query()
                ->with(['timeSlot', 'instructor.user', 'vehicle', 'coursePackage'])
                ->lockForUpdate()
                ->find($validated['training_schedule_id']);

            if (!$newSchedule) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Jadwal latihan baru tidak ditemukan.',
                ];
            }

            if (!$newSchedule->isAvailable()) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Jadwal latihan baru sudah tidak tersedia.',
                ];
            }

            $newScheduleDate = Carbon::parse($newSchedule->tanggal_latihan)->startOfDay();

            if ($newScheduleDate->lt(now()->startOfDay())) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Jadwal latihan yang sudah lewat tidak dapat dipilih.',
                ];
            }

            if ($newSchedule->course_package_id && (int) $newSchedule->course_package_id !== (int) $booking->course_package_id) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Jadwal baru tidak sesuai dengan paket booking.',
                ];
            }

            $hasActiveBookingAtSameTime = Booking::query()
                ->where('participant_id', $booking->participant_id)
                ->where('id', '!=', $booking->id)
                ->whereNotIn('status', ['Dibatalkan', 'Selesai'])
                ->whereHas('trainingSchedule', function ($query) use ($newSchedule) {
                    $query
                        ->whereDate('tanggal_latihan', $newSchedule->tanggal_latihan)
                        ->where('time_slot_id', $newSchedule->time_slot_id);
                })
                ->exists();

            if ($hasActiveBookingAtSameTime) {
                return [
                    'error' => true,
                    'status' => 409,
                    'message' => 'Peserta sudah memiliki booking lain pada tanggal dan slot waktu yang sama.',
                ];
            }

            $oldStatus = $booking->status;
            $oldScheduleId = $booking->training_schedule_id;
            $bookingOccupiesCapacity = BookingCapacityManager::occupiesCapacity($booking->status);

            if ($bookingOccupiesCapacity && $oldSchedule) {
                BookingCapacityManager::release($oldSchedule);
            }

            if ($bookingOccupiesCapacity) {
                BookingCapacityManager::reserve($newSchedule);
            }

            $booking->update([
                'training_schedule_id' => $newSchedule->id,
                'status' => in_array($booking->status, ['Dikonfirmasi', 'Dijadwalkan Ulang'], true) ? 'Dijadwalkan Ulang' : $booking->status,
                'catatan' => $validated['catatan'] ?? $booking->catatan,
            ]);

            BookingHistory::create([
                'booking_id' => $booking->id,
                'old_training_schedule_id' => $oldScheduleId,
                'new_training_schedule_id' => $newSchedule->id,
                'aksi' => 'Diubah',
                'status_sebelum' => $oldStatus,
                'status_sesudah' => in_array($booking->status, ['Dikonfirmasi', 'Dijadwalkan Ulang'], true) ? 'Dijadwalkan Ulang' : $booking->status,
                'catatan' => $validated['catatan'] ?? 'Admin mengubah jadwal booking.',
                'changed_by' => $request->user()->id,
            ]);

            $booking = $booking->fresh([
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment',
            ]);

            return [
                'error' => false,
                'booking' => $booking,
            ];
        });

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Jadwal booking berhasil diubah oleh admin.',
            'data' => [
                'item' => $this->formatBooking($result['booking']),
            ],
        ]);
    }

    public function konfirmasiPembayaran(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'catatan_admin' => ['nullable', 'string'],
        ]);

        $result = $this->paymentVerificationService->confirmByBookingId(
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
                'item' => $this->formatBooking($result['booking']),
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

        $result = $this->paymentVerificationService->rejectByBookingId(
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
                'item' => $this->formatBooking($result['booking']),
            ],
        ]);
    }

    public function buktiBayar(string $id): mixed
    {
        $booking = Booking::query()
            ->with('payment')
            ->find($id);

        if (!$booking || !$booking->payment) {
            return response()->json([
                'success' => false,
                'message' => 'Bukti bayar tidak ditemukan.',
            ], 404);
        }

        return BookingPaymentProofResponder::response($booking->payment);
    }

    public function batal(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'alasan_pembatalan' => ['nullable', 'string'],
        ]);

        $result = DB::transaction(function () use ($request, $id, $validated) {
            /** @var Booking|null $booking */
            $booking = Booking::query()
                ->with(['payment', 'trainingSchedule'])
                ->lockForUpdate()
                ->find($id);

            if (!$booking) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Booking tidak ditemukan.',
                ];
            }

            if (in_array($booking->status, ['Selesai', 'Dibatalkan'], true)) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Booking tidak dapat dibatalkan.',
                ];
            }

            $oldStatus = $booking->status;

            if (BookingCapacityManager::occupiesCapacity($booking->status)) {
                /** @var TrainingSchedule|null $schedule */
                $schedule = $booking->trainingSchedule()->lockForUpdate()->first();

                if ($schedule) {
                    BookingCapacityManager::release($schedule);
                }
            }

            if ($booking->payment && $booking->payment->status === 'Menunggu Konfirmasi') {
                $booking->payment->update([
                    'status' => 'Ditolak',
                    'tanggal_verifikasi' => now(),
                    'alasan_penolakan' => 'Booking dibatalkan oleh admin sebelum pembayaran dikonfirmasi.',
                    'catatan_admin' => $validated['alasan_pembatalan'] ?? null,
                    'verified_by' => $request->user()->id,
                ]);
            }

            $booking->update([
                'status' => 'Dibatalkan',
                'tanggal_dibatalkan' => now(),
                'alasan_pembatalan' => $validated['alasan_pembatalan'] ?? null,
            ]);

            BookingHistory::create([
                'booking_id' => $booking->id,
                'old_training_schedule_id' => $booking->training_schedule_id,
                'new_training_schedule_id' => null,
                'aksi' => 'Dibatalkan',
                'status_sebelum' => $oldStatus,
                'status_sesudah' => 'Dibatalkan',
                'catatan' => $validated['alasan_pembatalan'] ?? 'Booking dibatalkan oleh admin.',
                'changed_by' => $request->user()->id,
            ]);

            $booking = $booking->fresh([
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment',
            ]);

            return [
                'error' => false,
                'booking' => $booking,
            ];
        });

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil dibatalkan oleh admin.',
            'data' => [
                'item' => $this->formatBooking($result['booking']),
            ],
        ]);
    }

    private function resolvePackagePrice(CoursePackage $package, bool $pickup, bool $withSim): float
    {
        if ($pickup && $withSim) {
            return (float) $package->harga_dengan_sim_antar_jemput;
        }

        if (!$pickup && $withSim) {
            return (float) $package->harga_dengan_sim_tidak_antar_jemput;
        }

        if ($pickup && !$withSim) {
            return (float) $package->harga_antar_jemput;
        }

        return (float) $package->harga_tidak_antar_jemput;
    }


    private function createBookingWithUniqueCode(array $attributes): Booking
    {
        $lastException = null;

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            try {
                $attributes['kode_booking'] = $this->generateBookingCode($attempt);

                return Booking::create($attributes);
            } catch (QueryException $exception) {
                if (!$this->isDuplicateKeyException($exception)) {
                    throw $exception;
                }

                $lastException = $exception;
            }
        }

        throw new RuntimeException(
            'Kode booking gagal dibuat secara unik. Silakan coba kembali.',
            0,
            $lastException
        );
    }

    private function isDuplicateKeyException(QueryException $exception): bool
    {
        $errorInfo = $exception->errorInfo;

        return ($errorInfo[0] ?? null) === '23000'
            && (int) ($errorInfo[1] ?? 0) === 1062;
    }

    private function generateBookingCode(int $attempt = 1): string
    {
        $lastBooking = Booking::query()
            ->lockForUpdate()
            ->orderByDesc('id')
            ->first();

        $nextNumber = ($lastBooking ? $lastBooking->id : 0) + $attempt;

        return 'BKG-' . now()->format('Ymd') . '-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function validateParticipantCanBookPackage(Participant $participant, CoursePackage $package): ?array
    {
        $participant->refresh();

        $hasUnfinishedActivePackage = CourseProgressManager::hasUnfinishedDifferentActivePackage($participant, $package);

        if ($hasUnfinishedActivePackage) {
            return [
                'error' => true,
                'status' => 409,
                'message' => 'Peserta masih memiliki paket aktif yang belum selesai. Paket aktif harus diselesaikan sebelum mengambil paket berbeda.',
            ];
        }

        $hasDifferentActiveBookingPackage = Booking::query()
            ->where('participant_id', $participant->id)
            ->where('course_package_id', '!=', $package->id)
            ->whereNotIn('status', ['Dibatalkan', 'Selesai'])
            ->exists();

        if ($hasDifferentActiveBookingPackage) {
            return [
                'error' => true,
                'status' => 409,
                'message' => 'Peserta masih memiliki booking aktif pada paket berbeda. Selesaikan atau batalkan booking tersebut sebelum memilih paket lain.',
            ];
        }

        return null;
    }

    private function formatBooking(Booking $booking, bool $withHistories = false): array
    {
        $schedule = $booking->trainingSchedule;

        $data = [
            'id' => $booking->id,
            'kode_booking' => $booking->kode_booking,
            'status' => $booking->status,
            'status_label' => $this->resolveBookingStatusLabel($booking->status),

            'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),
            'tanggal_dikonfirmasi' => DateFormatter::dateTime($booking->tanggal_dikonfirmasi),
            'tanggal_dibatalkan' => DateFormatter::dateTime($booking->tanggal_dibatalkan),
            'alasan_pembatalan' => $booking->alasan_pembatalan,
            'catatan' => $booking->catatan,

            'pakai_antar_jemput' => (bool) $booking->pakai_antar_jemput,
            'pakai_sim' => (bool) $booking->pakai_sim,
            'alamat_jemput' => $booking->alamat_jemput,
            'harga_paket' => (int) $booking->harga_paket,

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

            'training_schedule' => $schedule ? [
                'id' => $schedule->id,
                'kode_jadwal' => $schedule->kode_jadwal,
                'tanggal_latihan' => DateFormatter::date($schedule->tanggal_latihan),

                'time_slot' => $schedule->timeSlot ? [
                    'id' => $schedule->timeSlot->id,
                    'nama_slot' => $schedule->timeSlot->nama_slot,
                    'jam_mulai' => DateFormatter::time($schedule->timeSlot->jam_mulai),
                    'jam_selesai' => DateFormatter::time($schedule->timeSlot->jam_selesai),
                    'jam_label' => DateFormatter::time($schedule->timeSlot->jam_mulai)
                        . ' - '
                        . DateFormatter::time($schedule->timeSlot->jam_selesai),
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

                'status' => $schedule->status,
                'kapasitas' => (int) $schedule->kapasitas,
                'jumlah_booking' => (int) $schedule->jumlah_booking,
            ] : null,

            'payment' => $booking->payment ? [
                'id' => $booking->payment->id,
                'nominal_bayar' => (int) $booking->payment->nominal_bayar,
                'bukti_bayar' => null,
                'bukti_bayar_url' => $this->resolvePaymentProofUrl($booking),
                'bukti_bayar_original_name' => $booking->payment->bukti_bayar_original_name,
                'bukti_bayar_mime' => $booking->payment->bukti_bayar_mime,
                'bukti_bayar_size' => $booking->payment->bukti_bayar_size ? (int) $booking->payment->bukti_bayar_size : null,
                'ada_bukti_bayar' => !empty($booking->payment->bukti_bayar_path) || !empty($booking->payment->bukti_bayar),
                'bukti_bayar_legacy' => empty($booking->payment->bukti_bayar_path) && !empty($booking->payment->bukti_bayar),
                'nama_pengirim' => $booking->payment->nama_pengirim,
                'bank_pengirim' => $booking->payment->bank_pengirim,
                'tanggal_upload' => DateFormatter::dateTime($booking->payment->tanggal_upload),
                'tanggal_verifikasi' => DateFormatter::dateTime($booking->payment->tanggal_verifikasi),
                'status' => $booking->payment->status,
                'catatan_peserta' => $booking->payment->catatan_peserta,
                'catatan_admin' => $booking->payment->catatan_admin,
                'alasan_penolakan' => $booking->payment->alasan_penolakan,
                'verifier' => $booking->payment->verifier ? [
                    'id' => $booking->payment->verifier->id,
                    'name' => $booking->payment->verifier->name,
                    'email' => $booking->payment->verifier->email,
                ] : null,
            ] : null,

            'training_result' => $booking->trainingResult ? [
                'id' => $booking->trainingResult->id,
                'status_kehadiran' => $booking->trainingResult->status_kehadiran,
                'nilai_akhir' => $booking->trainingResult->nilai_akhir !== null
                    ? (float) $booking->trainingResult->nilai_akhir
                    : null,
                'status_kelulusan' => $booking->trainingResult->status_kelulusan,
            ] : null,

            'created_at' => DateFormatter::dateTime($booking->created_at),
            'updated_at' => DateFormatter::dateTime($booking->updated_at),
        ];

        if ($withHistories) {
            $data['histories'] = $booking->histories
                ? $booking->histories->map(function (BookingHistory $history) {
                    return [
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
                    ];
                })->values()
                : [];
        }

        return $data;
    }

    private function resolvePaymentProofUrl(Booking $booking): ?string
    {
        if (!$booking->payment || (empty($booking->payment->bukti_bayar_path) && empty($booking->payment->bukti_bayar))) {
            return null;
        }

        return route('admin.booking.bukti-bayar', ['id' => $booking->id]);
    }

    private function resolveBookingStatusLabel(string $status): string
    {
        return match ($status) {
            'Menunggu Pembayaran' => 'PENDING PEMBAYARAN',
            'Menunggu Konfirmasi Pembayaran' => 'MENUNGGU KONFIRMASI',
            'Dikonfirmasi' => 'TERKONFIRMASI',
            'Dijadwalkan Ulang' => 'DIJADWALKAN ULANG',
            'Selesai' => 'SELESAI',
            'Dibatalkan' => 'DIBATALKAN',
            default => strtoupper($status),
        };
    }
}
