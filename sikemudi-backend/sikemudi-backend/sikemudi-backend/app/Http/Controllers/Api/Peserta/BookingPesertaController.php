<?php

namespace App\Http\Controllers\Api\Peserta;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingHistory;
use App\Models\BookingGroup;
use App\Models\BookingPayment;
use App\Models\CoursePackage;
use App\Models\Participant;
use App\Models\TrainingSchedule;
use App\Models\TimeSlot;
use App\Support\BookingCapacityManager;
use App\Support\BookingPaymentProofResponder;
use App\Support\DateFormatter;
use App\Services\BookingPackagePlannerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Validation\Rule;
use RuntimeException;

class BookingPesertaController extends Controller
{
    public function jadwalTersedia(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $validated = $request->validate([
            'course_package_id' => [
                'required',
                Rule::exists('course_packages', 'id')->where('status', 'Aktif'),
            ],
        ], [
            'course_package_id.required' => 'Paket kursus wajib dipilih sebelum melihat jadwal tersedia.',
            'course_package_id.exists' => 'Paket kursus tidak ditemukan atau sedang tidak aktif.',
        ]);

        $schedules = TrainingSchedule::query()
            ->with([
                'timeSlot',
                'instructor.user',
                'vehicle',
                'coursePackage',
            ])
            ->where('status', 'Tersedia')
            ->where('course_package_id', $validated['course_package_id'])
            ->whereDate('tanggal_latihan', '>=', now()->toDateString())
            ->whereColumn('jumlah_booking', '<', 'kapasitas')
            ->when($request->filled('tanggal'), function ($query) use ($request) {
                $query->whereDate('tanggal_latihan', $request->query('tanggal'));
            })
            ->when($request->filled('tanggal_mulai'), function ($query) use ($request) {
                $query->whereDate('tanggal_latihan', '>=', $request->query('tanggal_mulai'));
            })
            ->when($request->filled('tanggal_selesai'), function ($query) use ($request) {
                $query->whereDate('tanggal_latihan', '<=', $request->query('tanggal_selesai'));
            })
            ->when($request->filled('transmisi'), function ($query) use ($request) {
                $query->whereHas('vehicle', function ($vehicleQuery) use ($request) {
                    $vehicleQuery->where('transmisi', $request->query('transmisi'));
                });
            })
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_jadwal', 'like', "%{$keyword}%")
                        ->orWhereHas('timeSlot', function ($slotQuery) use ($keyword) {
                            $slotQuery
                                ->where('nama_slot', 'like', "%{$keyword}%")
                                ->orWhere('subtitle', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('instructor.user', function ($userQuery) use ($keyword) {
                            $userQuery->where('name', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('vehicle', function ($vehicleQuery) use ($keyword) {
                            $vehicleQuery
                                ->where('nama_kendaraan', 'like', "%{$keyword}%")
                                ->orWhere('nomor_plat', 'like', "%{$keyword}%")
                                ->orWhere('transmisi', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('coursePackage', function ($packageQuery) use ($keyword) {
                            $packageQuery
                                ->where('nama_paket', 'like', "%{$keyword}%")
                                ->orWhere('kode_paket', 'like', "%{$keyword}%");
                        });
                });
            })
            ->orderBy('tanggal_latihan')
            ->orderBy('time_slot_id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data jadwal tersedia berhasil diambil.',
            'data' => [
                'items' => collect($schedules->items())
                    ->map(fn(TrainingSchedule $schedule) => $this->formatSchedule($schedule))
                    ->values(),
                'pagination' => [
                    'current_page' => $schedules->currentPage(),
                    'last_page' => $schedules->lastPage(),
                    'per_page' => $schedules->perPage(),
                    'total' => $schedules->total(),
                ],
            ],
        ]);
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

        $bookings = Booking::query()
            ->with([
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment',
            ])
            ->where('participant_id', $participant->id)
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data booking peserta berhasil diambil.',
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
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'training_schedule_id' => ['required', 'exists:training_schedules,id'],
            'course_package_id' => ['required', 'exists:course_packages,id'],
            'pakai_antar_jemput' => ['required', 'boolean'],
            'pakai_sim' => ['required', 'boolean'],
            'alamat_jemput' => ['nullable', 'string'],
            'catatan' => ['nullable', 'string'],
        ], [
            'training_schedule_id.required' => 'Jadwal latihan wajib dipilih.',
            'training_schedule_id.exists' => 'Jadwal latihan tidak ditemukan.',
            'course_package_id.required' => 'Paket kursus wajib dipilih.',
            'course_package_id.exists' => 'Paket kursus tidak ditemukan.',
            'pakai_antar_jemput.required' => 'Pilihan antar jemput wajib diisi.',
            'pakai_sim.required' => 'Pilihan layanan SIM wajib diisi.',
        ]);

        $result = DB::transaction(function () use ($request, $participant, $validated) {
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
                    'message' => 'Anda sudah memiliki booking pada jadwal ini.',
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
                    'message' => 'Anda sudah memiliki booking pada tanggal dan slot waktu yang sama.',
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

            BookingHistory::create([
                'booking_id' => $booking->id,
                'old_training_schedule_id' => null,
                'new_training_schedule_id' => $schedule->id,
                'aksi' => 'Dibuat',
                'status_sebelum' => null,
                'status_sesudah' => 'Menunggu Pembayaran',
                'catatan' => 'Booking dibuat oleh peserta dan menunggu upload bukti pembayaran.',
                'changed_by' => $request->user()->id,
            ]);

            $booking->load([
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
            'message' => 'Booking berhasil dibuat. Silakan upload bukti pembayaran agar booking dapat dikonfirmasi admin.',
            'data' => [
                'item' => $this->formatBooking($result['booking']),
            ],
        ], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $booking = Booking::query()
            ->with([
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment.verifier',
                'histories.changedBy',
            ])
            ->where('participant_id', $participant->id)
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

    public function uploadBuktiBayar(Request $request, string $id): JsonResponse
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'nominal_bayar' => ['required', 'numeric', 'min:1'],
            'bukti_bayar' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:2048'],
            'nama_pengirim' => ['nullable', 'string', 'max:150'],
            'bank_pengirim' => ['nullable', 'string', 'max:100'],
            'catatan_peserta' => ['nullable', 'string'],
        ], [
            'nominal_bayar.required' => 'Nominal bayar wajib diisi.',
            'nominal_bayar.numeric' => 'Nominal bayar harus berupa angka.',
            'bukti_bayar.required' => 'Bukti bayar wajib diunggah.',
            'bukti_bayar.file' => 'Bukti bayar harus berupa file.',
            'bukti_bayar.mimes' => 'Bukti bayar harus berupa file JPG, JPEG, PNG, WebP, atau PDF.',
            'bukti_bayar.max' => 'Ukuran bukti bayar maksimal 2 MB.',
        ]);

        $result = DB::transaction(function () use ($request, $participant, $id, $validated) {
            /** @var Booking|null $booking */
            $booking = Booking::query()
                ->with(['payment', 'coursePackage', 'trainingSchedule.timeSlot', 'trainingSchedule.instructor.user', 'trainingSchedule.vehicle'])
                ->where('participant_id', $participant->id)
                ->lockForUpdate()
                ->find($id);

            if (!$booking) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Booking tidak ditemukan.',
                ];
            }

            if ($booking->booking_group_id) {
                return $this->uploadBuktiBayarForBookingGroup($request, $participant, $booking, $validated);
            }

            if (in_array($booking->status, ['Dikonfirmasi', 'Selesai', 'Dibatalkan'], true)) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Bukti bayar tidak dapat diunggah untuk booking dengan status saat ini.',
                ];
            }

            /** @var BookingPayment|null $payment */
            $payment = $booking->payment()->first();

            if (!$payment) {
                $payment = BookingPayment::create([
                    'booking_id' => $booking->id,
                    'status' => 'Belum Upload',
                ]);
            }

            if ($payment->isCash()) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Booking dengan metode pembayaran cash tidak memerlukan upload bukti bayar. Silakan lakukan pembayaran langsung ke admin.',
                ];
            }

            if ($payment->status === 'Terkonfirmasi') {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Pembayaran sudah terkonfirmasi.',
                ];
            }

            /** @var TrainingSchedule|null $schedule */
            $schedule = TrainingSchedule::query()
                ->lockForUpdate()
                ->find($booking->training_schedule_id);

            if (!$schedule) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Jadwal latihan tidak ditemukan.',
                ];
            }

            if (in_array($schedule->status, ['Dibatalkan', 'Selesai'], true)) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Jadwal latihan sudah tidak dapat menerima pembayaran.',
                ];
            }

            $bookingAlreadyHoldsCapacity = BookingCapacityManager::occupiesCapacity($booking->status);

            if (!$bookingAlreadyHoldsCapacity && !BookingCapacityManager::hasCapacity($schedule)) {
                return [
                    'error' => true,
                    'status' => 409,
                    'message' => 'Kapasitas jadwal sudah penuh. Silakan pilih jadwal lain sebelum mengunggah bukti pembayaran.',
                ];
            }

            $oldBookingStatus = $booking->status;
            $oldProofPath = $payment->bukti_bayar_path;
            $proofFile = $request->file('bukti_bayar');
            $proofPath = $proofFile->store('sikemudi/bukti-bayar', 'local');

            if (!$proofPath) {
                return [
                    'error' => true,
                    'status' => 500,
                    'message' => 'Bukti bayar gagal disimpan. Silakan coba lagi.',
                ];
            }

            $payment->update([
                'nominal_bayar' => $validated['nominal_bayar'],
                'bukti_bayar' => null,
                'bukti_bayar_path' => $proofPath,
                'bukti_bayar_original_name' => $proofFile->getClientOriginalName(),
                'bukti_bayar_mime' => $proofFile->getMimeType(),
                'bukti_bayar_size' => $proofFile->getSize(),
                'nama_pengirim' => $validated['nama_pengirim'] ?? null,
                'bank_pengirim' => $validated['bank_pengirim'] ?? null,
                'tanggal_upload' => now(),
                'tanggal_verifikasi' => null,
                'status' => 'Menunggu Konfirmasi',
                'catatan_peserta' => $validated['catatan_peserta'] ?? null,
                'catatan_admin' => null,
                'alasan_penolakan' => null,
                'verified_by' => null,
            ]);

            if ($oldProofPath && $oldProofPath !== $proofPath && Storage::disk('local')->exists($oldProofPath)) {
                Storage::disk('local')->delete($oldProofPath);
            }

            $booking->update([
                'status' => 'Menunggu Konfirmasi Pembayaran',
            ]);

            if (!$bookingAlreadyHoldsCapacity) {
                BookingCapacityManager::reserve($schedule);
            } else {
                BookingCapacityManager::syncStatus($schedule);
            }

            BookingHistory::create([
                'booking_id' => $booking->id,
                'old_training_schedule_id' => $booking->training_schedule_id,
                'new_training_schedule_id' => $booking->training_schedule_id,
                'aksi' => 'Upload Bukti Bayar',
                'status_sebelum' => $oldBookingStatus,
                'status_sesudah' => 'Menunggu Konfirmasi Pembayaran',
                'catatan' => 'Peserta mengunggah bukti pembayaran.',
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
            'message' => 'Bukti pembayaran berhasil diunggah. Menunggu konfirmasi admin.',
            'data' => [
                'item' => $this->formatBooking($result['booking']),
            ],
        ]);
    }

    private function uploadBuktiBayarForBookingGroup(Request $request, Participant $participant, Booking $booking, array $validated): array
    {
        /** @var BookingGroup|null $bookingGroup */
        $bookingGroup = BookingGroup::query()
            ->with(['payment', 'bookings.trainingSchedule'])
            ->where('participant_id', $participant->id)
            ->lockForUpdate()
            ->find($booking->booking_group_id);

        if (!$bookingGroup) {
            return [
                'error' => true,
                'status' => 404,
                'message' => 'Booking paket tidak ditemukan.',
            ];
        }

        if (in_array($bookingGroup->status, ['Dikonfirmasi', 'Selesai', 'Dibatalkan'], true)) {
            return [
                'error' => true,
                'status' => 422,
                'message' => 'Bukti bayar tidak dapat diunggah untuk booking paket dengan status saat ini.',
            ];
        }

        /** @var BookingPayment|null $payment */
        $payment = BookingPayment::query()
            ->where('booking_group_id', $bookingGroup->id)
            ->lockForUpdate()
            ->first();

        if (!$payment) {
            $primaryBooking = $bookingGroup->bookings->sortBy('sesi_ke')->first();

            if (!$primaryBooking) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Booking sesi untuk paket ini tidak ditemukan.',
                ];
            }

            $payment = BookingPayment::create([
                'booking_id' => $primaryBooking->id,
                'booking_group_id' => $bookingGroup->id,
                'status' => 'Belum Upload',
                'nominal_bayar' => 0,
            ]);
        }

        if ($payment->isCash()) {
            return [
                'error' => true,
                'status' => 422,
                'message' => 'Booking paket dengan metode pembayaran cash tidak memerlukan upload bukti bayar. Silakan lakukan pembayaran langsung ke admin.',
            ];
        }

        if ($payment->status === 'Terkonfirmasi') {
            return [
                'error' => true,
                'status' => 422,
                'message' => 'Pembayaran paket sudah terkonfirmasi.',
            ];
        }

        $oldProofPath = $payment->bukti_bayar_path;
        $proofFile = $request->file('bukti_bayar');
        $proofPath = $proofFile->store('sikemudi/bukti-bayar', 'local');

        if (!$proofPath) {
            return [
                'error' => true,
                'status' => 500,
                'message' => 'Bukti bayar gagal disimpan. Silakan coba lagi.',
            ];
        }

        $payment->update([
            'nominal_bayar' => $validated['nominal_bayar'],
            'bukti_bayar' => null,
            'bukti_bayar_path' => $proofPath,
            'bukti_bayar_original_name' => $proofFile->getClientOriginalName(),
            'bukti_bayar_mime' => $proofFile->getMimeType(),
            'bukti_bayar_size' => $proofFile->getSize(),
            'nama_pengirim' => $validated['nama_pengirim'] ?? null,
            'bank_pengirim' => $validated['bank_pengirim'] ?? null,
            'tanggal_upload' => now(),
            'tanggal_verifikasi' => null,
            'status' => 'Menunggu Konfirmasi',
            'catatan_peserta' => $validated['catatan_peserta'] ?? null,
            'catatan_admin' => null,
            'alasan_penolakan' => null,
            'verified_by' => null,
        ]);

        if ($oldProofPath && $oldProofPath !== $proofPath && Storage::disk('local')->exists($oldProofPath)) {
            Storage::disk('local')->delete($oldProofPath);
        }

        $oldGroupStatus = $bookingGroup->status;
        $bookingGroup->update([
            'status' => 'Menunggu Konfirmasi Pembayaran',
        ]);

        $bookingGroup->bookings->each(function (Booking $sessionBooking) use ($request) {
            if (in_array($sessionBooking->status, ['Selesai', 'Dibatalkan'], true)) {
                return;
            }

            $oldStatus = $sessionBooking->status;

            $sessionBooking->update([
                'status' => 'Menunggu Konfirmasi Pembayaran',
            ]);

            BookingHistory::create([
                'booking_id' => $sessionBooking->id,
                'old_training_schedule_id' => $sessionBooking->training_schedule_id,
                'new_training_schedule_id' => $sessionBooking->training_schedule_id,
                'aksi' => 'Upload Bukti Bayar',
                'status_sebelum' => $oldStatus,
                'status_sesudah' => 'Menunggu Konfirmasi Pembayaran',
                'catatan' => 'Peserta mengunggah bukti pembayaran untuk booking paket.',
                'changed_by' => $request->user()->id,
            ]);
        });

        /** @var Booking $booking */
        $booking = Booking::query()
            ->with([
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment',
            ])
            ->find($payment->booking_id ?: $booking->id);

        return [
            'error' => false,
            'booking' => $booking,
            'booking_group_status_before' => $oldGroupStatus,
        ];
    }

    public function buktiBayar(Request $request, string $id): mixed
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $booking = Booking::query()
            ->with('payment')
            ->where('participant_id', $participant->id)
            ->find($id);

        if (!$booking || !$booking->payment) {
            return response()->json([
                'success' => false,
                'message' => 'Bukti bayar tidak ditemukan.',
            ], 404);
        }

        return BookingPaymentProofResponder::response($booking->payment);
    }

    public function previewSesiPaket(Request $request, BookingPackagePlannerService $planner): JsonResponse
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'course_package_id' => ['required', 'exists:course_packages,id'],
            'tanggal_latihan' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'time_slot_id' => ['required', 'exists:time_slots,id'],
            'instructor_id' => ['required', 'exists:instructors,id'],
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'sesi_ke' => ['required', 'integer', 'min:1'],
            'total_sesi' => ['required', 'integer', 'min:1'],
        ], [
            'tanggal_latihan.required' => 'Tanggal latihan wajib dipilih.',
            'tanggal_latihan.date_format' => 'Format tanggal latihan harus YYYY-MM-DD.',
            'tanggal_latihan.after_or_equal' => 'Tanggal latihan tidak boleh lebih kecil dari hari ini.',
            'time_slot_id.required' => 'Slot waktu wajib dipilih.',
        ]);

        $result = $planner->previewFixedResourceSession($validated);

        if (!($result['success'] ?? false)) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Jadwal sesi tidak tersedia.',
            ], (int) ($result['status'] ?? 422));
        }

        return response()->json([
            'success' => true,
            'message' => 'Preview perubahan sesi berhasil dibuat.',
            'data' => [
                'item' => $result['data'],
            ],
        ]);
    }

    public function rekomendasiJadwal(Request $request, string $id, BookingPackagePlannerService $planner): JsonResponse
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'tanggal_latihan' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
            'time_slot_id' => ['nullable', 'exists:time_slots,id'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:10'],
        ], [
            'tanggal_latihan.required' => 'Tanggal latihan awal untuk rekomendasi wajib dipilih.',
            'tanggal_latihan.date_format' => 'Format tanggal latihan harus YYYY-MM-DD.',
            'tanggal_latihan.after_or_equal' => 'Tanggal latihan tidak boleh lebih kecil dari hari ini.',
            'time_slot_id.exists' => 'Slot waktu tidak ditemukan.',
        ]);

        /** @var Booking|null $booking */
        $booking = Booking::query()
            ->with([
                'bookingGroup',
                'coursePackage',
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
            ])
            ->where('participant_id', $participant->id)
            ->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Booking tidak ditemukan.',
            ], 404);
        }

        $statusValidation = $this->validateBookingCanBeRescheduled($booking);

        if ($statusValidation) {
            return response()->json([
                'success' => false,
                'message' => $statusValidation['message'],
            ], $statusValidation['status']);
        }

        $windowValidation = $this->validateChangeOrCancelWindow($booking->trainingSchedule?->tanggal_latihan);

        if (!$windowValidation['allowed']) {
            return response()->json([
                'success' => false,
                'message' => $windowValidation['message'],
                'data' => [
                    'deadline_date' => $windowValidation['deadline_date'] ?? null,
                    'training_date' => $windowValidation['training_date'] ?? null,
                ],
            ], 422);
        }

        $items = $this->buildRescheduleRecommendations(
            booking: $booking,
            startDate: $validated['tanggal_latihan'],
            preferredSlotId: isset($validated['time_slot_id']) ? (int) $validated['time_slot_id'] : null,
            limit: (int) ($validated['limit'] ?? 6),
            planner: $planner,
        );

        return response()->json([
            'success' => true,
            'message' => $items === []
                ? 'Belum ada rekomendasi jadwal yang sesuai dengan instruktur dan kendaraan paket ini.'
                : 'Rekomendasi jadwal berhasil diambil.',
            'data' => [
                'items' => $items,
                'fixed_resource' => [
                    'instructor_id' => $this->resolveFixedResourceIds($booking)['instructor_id'],
                    'vehicle_id' => $this->resolveFixedResourceIds($booking)['vehicle_id'],
                ],
            ],
        ]);
    }

    public function ubahJadwal(Request $request, string $id, BookingPackagePlannerService $planner): JsonResponse
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'training_schedule_id' => ['nullable', 'exists:training_schedules,id'],
            'tanggal_latihan' => ['nullable', 'required_without:training_schedule_id', 'date_format:Y-m-d', 'after_or_equal:today'],
            'time_slot_id' => ['nullable', 'required_without:training_schedule_id', 'exists:time_slots,id'],
            'catatan' => ['nullable', 'string'],
        ], [
            'training_schedule_id.exists' => 'Jadwal latihan baru tidak ditemukan.',
            'tanggal_latihan.required_without' => 'Tanggal latihan wajib dipilih jika jadwal baru belum tersedia.',
            'tanggal_latihan.date_format' => 'Format tanggal latihan harus YYYY-MM-DD.',
            'tanggal_latihan.after_or_equal' => 'Tanggal latihan tidak boleh lebih kecil dari hari ini.',
            'time_slot_id.required_without' => 'Slot waktu wajib dipilih jika jadwal baru belum tersedia.',
            'time_slot_id.exists' => 'Slot waktu tidak ditemukan.',
        ]);

        $result = DB::transaction(function () use ($request, $participant, $id, $validated, $planner) {
            /** @var Booking|null $booking */
            $booking = Booking::query()
                ->with(['payment', 'bookingGroup', 'coursePackage', 'trainingSchedule.timeSlot'])
                ->where('participant_id', $participant->id)
                ->lockForUpdate()
                ->find($id);

            if (!$booking) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Booking tidak ditemukan.',
                ];
            }

            $statusValidation = $this->validateBookingCanBeRescheduled($booking);

            if ($statusValidation) {
                return [
                    'error' => true,
                    'status' => $statusValidation['status'],
                    'message' => $statusValidation['message'],
                ];
            }

            /** @var TrainingSchedule|null $oldSchedule */
            $oldSchedule = TrainingSchedule::query()
                ->with(['timeSlot', 'instructor.user', 'vehicle'])
                ->lockForUpdate()
                ->find($booking->training_schedule_id);

            $windowValidation = $this->validateChangeOrCancelWindow($oldSchedule?->tanggal_latihan);

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

            $newSchedule = null;

            if (!empty($validated['training_schedule_id'])) {
                /** @var TrainingSchedule|null $newSchedule */
                $newSchedule = TrainingSchedule::query()
                    ->with(['timeSlot', 'instructor.user', 'vehicle', 'coursePackage', 'bookings'])
                    ->lockForUpdate()
                    ->find($validated['training_schedule_id']);

                if (!$newSchedule) {
                    return [
                        'error' => true,
                        'status' => 404,
                        'message' => 'Jadwal latihan baru tidak ditemukan.',
                    ];
                }
            } else {
                $resourceIds = $this->resolveFixedResourceIds($booking);

                if (!$resourceIds['instructor_id'] || !$resourceIds['vehicle_id']) {
                    return [
                        'error' => true,
                        'status' => 422,
                        'message' => 'Instruktur atau kendaraan tetap pada paket ini tidak ditemukan.',
                    ];
                }

                $candidate = $planner->previewFixedResourceSession([
                    'course_package_id' => $booking->course_package_id,
                    'tanggal_latihan' => $validated['tanggal_latihan'],
                    'time_slot_id' => $validated['time_slot_id'],
                    'instructor_id' => $resourceIds['instructor_id'],
                    'vehicle_id' => $resourceIds['vehicle_id'],
                    'sesi_ke' => (int) $booking->sesi_ke,
                    'total_sesi' => (int) $booking->total_sesi,
                ]);

                if (!($candidate['success'] ?? false)) {
                    return [
                        'error' => true,
                        'status' => (int) ($candidate['status'] ?? 422),
                        'message' => $candidate['message'] ?? 'Jadwal latihan baru tidak tersedia.',
                    ];
                }

                $newSchedule = $this->resolveOrCreateRescheduleSchedule($booking->coursePackage, $candidate['data']);
            }

            if (!$newSchedule) {
                return [
                    'error' => true,
                    'status' => 500,
                    'message' => 'Jadwal latihan baru gagal disiapkan.',
                ];
            }

            if ((int) $booking->training_schedule_id === (int) $newSchedule->id) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Jadwal baru tidak boleh sama dengan jadwal lama.',
                ];
            }

            $availabilityValidation = $this->validateRescheduleTarget($booking, $newSchedule);

            if ($availabilityValidation) {
                return [
                    'error' => true,
                    'status' => $availabilityValidation['status'],
                    'message' => $availabilityValidation['message'],
                ];
            }

            if ($this->participantHasActiveBookingAtSameTime($booking, $newSchedule)) {
                return [
                    'error' => true,
                    'status' => 409,
                    'message' => 'Anda sudah memiliki booking lain pada tanggal dan slot waktu yang sama.',
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

            $nextStatus = in_array($booking->status, ['Dikonfirmasi', 'Dijadwalkan Ulang'], true)
                ? 'Dijadwalkan Ulang'
                : $booking->status;

            $booking->update([
                'training_schedule_id' => $newSchedule->id,
                'status' => $nextStatus,
                'catatan' => $validated['catatan'] ?? $booking->catatan,
            ]);

            if ($booking->booking_group_id && in_array($booking->bookingGroup?->status, ['Dikonfirmasi', 'Dijadwalkan Ulang'], true)) {
                $booking->bookingGroup->update([
                    'status' => 'Dijadwalkan Ulang',
                ]);
            }

            BookingHistory::create([
                'booking_id' => $booking->id,
                'old_training_schedule_id' => $oldScheduleId,
                'new_training_schedule_id' => $newSchedule->id,
                'aksi' => 'Diubah',
                'status_sebelum' => $oldStatus,
                'status_sesudah' => $nextStatus,
                'catatan' => $validated['catatan'] ?? 'Peserta mengubah jadwal latihan per sesi.',
                'changed_by' => $request->user()->id,
            ]);

            /** @var Booking $booking */
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
                'data' => $result['data'] ?? null,
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Jadwal sesi berhasil diubah.',
            'data' => [
                'item' => $this->formatBooking($result['booking']),
            ],
        ]);
    }

    public function batal(Request $request, string $id): JsonResponse
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
        ]);

        $result = DB::transaction(function () use ($request, $participant, $id, $validated) {
            /** @var Booking|null $booking */
            $booking = Booking::query()
                ->with(['payment', 'trainingSchedule'])
                ->where('participant_id', $participant->id)
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

            /** @var TrainingSchedule|null $scheduleForValidation */
            $scheduleForValidation = $booking->trainingSchedule()->first();

            $windowValidation = $this->validateChangeOrCancelWindow($scheduleForValidation?->tanggal_latihan);

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
                    'alasan_penolakan' => 'Booking dibatalkan oleh peserta sebelum pembayaran dikonfirmasi.',
                    'catatan_admin' => null,
                    'verified_by' => null,
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
                'catatan' => $validated['alasan_pembatalan'] ?? 'Booking dibatalkan oleh peserta.',
                'changed_by' => $request->user()->id,
            ]);

            $this->syncBookingGroupAfterSessionCancel($booking);

            /** @var Booking $booking */
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
                'data' => $result['data'] ?? null,
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Booking berhasil dibatalkan.',
            'data' => [
                'item' => $this->formatBooking($result['booking']),
            ],
        ]);
    }



    private function validateBookingCanBeRescheduled(Booking $booking): ?array
    {
        $allowedRescheduleStatuses = [
            'Menunggu Pembayaran',
            'Menunggu Konfirmasi Pembayaran',
            'Dikonfirmasi',
            'Dijadwalkan Ulang',
        ];

        if (!in_array($booking->status, $allowedRescheduleStatuses, true)) {
            return [
                'status' => 422,
                'message' => 'Booking dengan status ini tidak dapat diubah jadwalnya.',
            ];
        }

        if ($booking->trainingResult()->exists()) {
            return [
                'status' => 422,
                'message' => 'Jadwal tidak dapat diubah karena hasil latihan sesi ini sudah diinput.',
            ];
        }

        return null;
    }

    private function resolveFixedResourceIds(Booking $booking): array
    {
        $group = $booking->bookingGroup;
        $schedule = $booking->trainingSchedule;

        return [
            'instructor_id' => $group?->instructor_id ?: $schedule?->instructor_id,
            'vehicle_id' => $group?->vehicle_id ?: $schedule?->vehicle_id,
        ];
    }

    private function buildRescheduleRecommendations(
        Booking $booking,
        string $startDate,
        ?int $preferredSlotId,
        int $limit,
        BookingPackagePlannerService $planner,
    ): array {
        $resourceIds = $this->resolveFixedResourceIds($booking);

        if (!$resourceIds['instructor_id'] || !$resourceIds['vehicle_id'] || !$booking->course_package_id) {
            return [];
        }

        $slots = TimeSlot::query()
            ->where('status', 'Aktif')
            ->when($preferredSlotId, function ($query) use ($preferredSlotId) {
                $query->orderByRaw('CASE WHEN id = ? THEN 0 ELSE 1 END', [$preferredSlotId]);
            })
            ->orderBy('jam_mulai')
            ->get();

        if ($slots->isEmpty()) {
            return [];
        }

        $items = [];
        $seen = [];
        $baseDate = Carbon::parse($startDate)->startOfDay();

        for ($dayOffset = 0; $dayOffset <= 14 && count($items) < $limit; $dayOffset++) {
            $date = $baseDate->copy()->addDays($dayOffset);

            foreach ($slots as $slot) {
                if (count($items) >= $limit) {
                    break;
                }

                $key = $date->toDateString() . '#' . $slot->id;

                if (isset($seen[$key])) {
                    continue;
                }

                $seen[$key] = true;

                $currentSchedule = $booking->trainingSchedule;
                $isCurrentScheduleSlot = $currentSchedule
                    && $currentSchedule->tanggal_latihan?->toDateString() === $date->toDateString()
                    && (int) $currentSchedule->time_slot_id === (int) $slot->id;

                if ($isCurrentScheduleSlot) {
                    continue;
                }

                $candidate = $planner->previewFixedResourceSession([
                    'course_package_id' => $booking->course_package_id,
                    'tanggal_latihan' => $date->toDateString(),
                    'time_slot_id' => $slot->id,
                    'instructor_id' => $resourceIds['instructor_id'],
                    'vehicle_id' => $resourceIds['vehicle_id'],
                    'sesi_ke' => (int) $booking->sesi_ke,
                    'total_sesi' => (int) $booking->total_sesi,
                ]);

                if (!($candidate['success'] ?? false)) {
                    continue;
                }

                $candidateSchedule = $this->resolveRecommendationScheduleForConflictCheck($candidate['data']);

                if ($candidateSchedule && $this->participantHasActiveBookingAtSameTime($booking, $candidateSchedule)) {
                    continue;
                }

                $items[] = $this->formatRescheduleRecommendation($candidate['data'], $dayOffset === 0 && (!$preferredSlotId || (int) $preferredSlotId === (int) $slot->id));
            }
        }

        return $items;
    }

    private function resolveRecommendationScheduleForConflictCheck(array $session): ?TrainingSchedule
    {
        if (!empty($session['existing_schedule_id'])) {
            return TrainingSchedule::query()
                ->with('timeSlot')
                ->find($session['existing_schedule_id']);
        }

        return new TrainingSchedule([
            'tanggal_latihan' => $session['tanggal_latihan'],
            'time_slot_id' => (int) ($session['time_slot']['id'] ?? 0),
            'instructor_id' => (int) ($session['instructor']['id'] ?? 0),
            'vehicle_id' => (int) ($session['vehicle']['id'] ?? 0),
            'course_package_id' => null,
            'kapasitas' => 1,
            'jumlah_booking' => 0,
            'status' => 'Tersedia',
        ]);
    }

    private function formatRescheduleRecommendation(array $session, bool $isPreferred): array
    {
        return [
            'tanggal_latihan' => $session['tanggal_latihan'],
            'sesi_ke' => (int) $session['sesi_ke'],
            'total_sesi' => (int) $session['total_sesi'],
            'recommended_label' => $isPreferred ? 'Pilihan utama tersedia' : 'Alternatif tersedia',
            'existing_schedule_id' => $session['existing_schedule_id'] ?? null,
            'schedule_mode' => $session['schedule_mode'] ?? 'new_schedule',
            'time_slot' => $session['time_slot'],
            'instructor' => $session['instructor'],
            'vehicle' => $session['vehicle'],
        ];
    }

    private function validateRescheduleTarget(Booking $booking, TrainingSchedule $schedule): ?array
    {
        $resourceIds = $this->resolveFixedResourceIds($booking);

        if ($resourceIds['instructor_id'] && (int) $schedule->instructor_id !== (int) $resourceIds['instructor_id']) {
            return [
                'status' => 422,
                'message' => 'Jadwal baru harus memakai instruktur yang sama dengan paket booking.',
            ];
        }

        if ($resourceIds['vehicle_id'] && (int) $schedule->vehicle_id !== (int) $resourceIds['vehicle_id']) {
            return [
                'status' => 422,
                'message' => 'Jadwal baru harus memakai kendaraan yang sama dengan paket booking.',
            ];
        }

        if ($schedule->course_package_id && (int) $schedule->course_package_id !== (int) $booking->course_package_id) {
            return [
                'status' => 422,
                'message' => 'Jadwal baru harus sesuai dengan paket kursus booking.',
            ];
        }

        if ($schedule->tanggal_latihan?->lt(now()->startOfDay())) {
            return [
                'status' => 422,
                'message' => 'Jadwal latihan yang sudah lewat tidak dapat dipilih.',
            ];
        }

        BookingCapacityManager::syncFromBookings($schedule);
        $schedule->refresh();

        if (in_array($schedule->status, ['Dibatalkan', 'Berlangsung'], true) || !BookingCapacityManager::hasCapacity($schedule)) {
            return [
                'status' => 422,
                'message' => 'Jadwal latihan baru sudah tidak tersedia.',
            ];
        }

        return null;
    }

    private function participantHasActiveBookingAtSameTime(Booking $booking, TrainingSchedule $schedule): bool
    {
        if (!$schedule->tanggal_latihan || !$schedule->time_slot_id) {
            return false;
        }

        return Booking::query()
            ->where('participant_id', $booking->participant_id)
            ->where('id', '!=', $booking->id)
            ->whereNotIn('status', ['Dibatalkan', 'Selesai'])
            ->whereHas('trainingSchedule', function ($query) use ($schedule) {
                $query
                    ->whereDate('tanggal_latihan', $schedule->tanggal_latihan)
                    ->where('time_slot_id', $schedule->time_slot_id);
            })
            ->exists();
    }

    private function resolveOrCreateRescheduleSchedule(?CoursePackage $package, array $session): ?TrainingSchedule
    {
        if (!$package) {
            return null;
        }

        $scheduleId = $session['existing_schedule_id'] ?? null;

        if ($scheduleId) {
            $schedule = TrainingSchedule::query()
                ->with('bookings')
                ->lockForUpdate()
                ->find($scheduleId);

            if ($schedule) {
                BookingCapacityManager::syncFromBookings($schedule);

                return $schedule->fresh();
            }
        }

        $date = $session['tanggal_latihan'];
        $slotId = (int) $session['time_slot']['id'];
        $instructorId = (int) $session['instructor']['id'];
        $vehicleId = (int) $session['vehicle']['id'];

        $existingSchedule = TrainingSchedule::query()
            ->with('bookings')
            ->whereDate('tanggal_latihan', $date)
            ->where('time_slot_id', $slotId)
            ->where('status', '!=', 'Dibatalkan')
            ->where(function ($query) use ($instructorId, $vehicleId) {
                $query
                    ->where('instructor_id', $instructorId)
                    ->orWhere('vehicle_id', $vehicleId);
            })
            ->lockForUpdate()
            ->first();

        if ($existingSchedule) {
            BookingCapacityManager::syncFromBookings($existingSchedule);

            return $existingSchedule->fresh();
        }

        return $this->createScheduleWithUniqueCode([
            'tanggal_latihan' => $date,
            'time_slot_id' => $slotId,
            'instructor_id' => $instructorId,
            'vehicle_id' => $vehicleId,
            'course_package_id' => $package->id,
            'kapasitas' => 1,
            'jumlah_booking' => 0,
            'status' => 'Tersedia',
            'catatan' => 'Jadwal dibuat otomatis dari perubahan sesi peserta.',
        ]);
    }

    private function syncBookingGroupAfterSessionCancel(Booking $booking): void
    {
        if (!$booking->booking_group_id) {
            return;
        }

        /** @var BookingGroup|null $group */
        $group = BookingGroup::query()
            ->with(['bookings', 'payment'])
            ->lockForUpdate()
            ->find($booking->booking_group_id);

        if (!$group) {
            return;
        }

        $activeSessionsCount = $group->bookings
            ->filter(fn (Booking $sessionBooking) => !in_array($sessionBooking->status, ['Dibatalkan'], true))
            ->count();

        if ($activeSessionsCount > 0) {
            return;
        }

        $group->update([
            'status' => 'Dibatalkan',
            'tanggal_dibatalkan' => now(),
            'alasan_pembatalan' => $booking->alasan_pembatalan ?: 'Seluruh sesi dalam paket dibatalkan oleh peserta.',
        ]);

        if ($group->payment && $group->payment->status !== 'Terkonfirmasi') {
            $group->payment->update([
                'status' => 'Ditolak',
                'tanggal_verifikasi' => now(),
                'alasan_penolakan' => 'Booking paket dibatalkan oleh peserta sebelum pembayaran terkonfirmasi.',
                'catatan_admin' => null,
                'verified_by' => null,
            ]);
        }
    }

    private function createScheduleWithUniqueCode(array $attributes): TrainingSchedule
    {
        $lastException = null;

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            try {
                $attributes['kode_jadwal'] = $this->generateScheduleCode($attempt);

                return TrainingSchedule::create($attributes);
            } catch (QueryException $exception) {
                if (!$this->isDuplicateKeyException($exception)) {
                    throw $exception;
                }

                $lastException = $exception;
            }
        }

        throw new RuntimeException('Kode jadwal latihan gagal dibuat secara unik. Silakan coba kembali.', 0, $lastException);
    }

    private function generateScheduleCode(int $attempt = 1): string
    {
        $lastSchedule = TrainingSchedule::query()
            ->lockForUpdate()
            ->orderByDesc('id')
            ->first();

        $nextNumber = ($lastSchedule ? $lastSchedule->id : 0) + $attempt;

        return 'JDL-' . now()->format('Ymd') . '-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    public function riwayatBooking(Request $request): JsonResponse
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

        $bookings = Booking::query()
            ->with([
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment',
                'trainingResult',
            ])
            ->where('participant_id', $participant->id)
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_booking', 'like', "%{$keyword}%")
                        ->orWhere('status', 'like', "%{$keyword}%")
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
            'message' => 'Data riwayat booking peserta berhasil diambil.',
            'data' => [
                'items' => collect($bookings->items())
                    ->map(fn(Booking $booking) => $this->formatRiwayatBooking($booking))
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

    public function detailRiwayatBooking(Request $request, string $id): JsonResponse
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

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
            ->where('participant_id', $participant->id)
            ->find($id);

        if (!$booking) {
            return response()->json([
                'success' => false,
                'message' => 'Riwayat booking tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail riwayat booking berhasil diambil.',
            'data' => [
                'item' => $this->formatRiwayatBookingDetail($booking),
            ],
        ]);
    }

    private function formatRiwayatBooking(Booking $booking): array
    {
        $schedule = $booking->trainingSchedule;

        return [
            'id' => $booking->id,
            'kode_booking' => $booking->kode_booking,
            'status' => $booking->status,
            'status_label' => $this->resolveBookingStatusLabel($booking->status),

            'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),
            'tanggal_dikonfirmasi' => DateFormatter::dateTime($booking->tanggal_dikonfirmasi),
            'tanggal_dibatalkan' => DateFormatter::dateTime($booking->tanggal_dibatalkan),

            'tanggal_latihan' => $schedule ? DateFormatter::date($schedule->tanggal_latihan) : null,

            'time_slot' => $schedule?->timeSlot ? [
                'id' => $schedule->timeSlot->id,
                'nama_slot' => $schedule->timeSlot->nama_slot,
                'jam_mulai' => DateFormatter::time($schedule->timeSlot->jam_mulai),
                'jam_selesai' => DateFormatter::time($schedule->timeSlot->jam_selesai),
                'jam_label' => DateFormatter::time($schedule->timeSlot->jam_mulai)
                    . ' - '
                    . DateFormatter::time($schedule->timeSlot->jam_selesai),
            ] : null,

            'instructor' => $schedule?->instructor ? [
                'id' => $schedule->instructor->id,
                'kode_instruktur' => $schedule->instructor->kode_instruktur,
                'nama_instruktur' => $schedule->instructor->user?->name,
            ] : null,

            'vehicle' => $schedule?->vehicle ? [
                'id' => $schedule->vehicle->id,
                'kode_kendaraan' => $schedule->vehicle->kode_kendaraan,
                'nama_kendaraan' => $schedule->vehicle->nama_kendaraan,
                'nomor_plat' => $schedule->vehicle->nomor_plat,
                'transmisi' => $schedule->vehicle->transmisi,
            ] : null,

            'course_package' => $booking->coursePackage ? [
                'id' => $booking->coursePackage->id,
                'kode_paket' => $booking->coursePackage->kode_paket,
                'nama_paket' => $booking->coursePackage->nama_paket,
                'durasi_jam' => (int) $booking->coursePackage->durasi_jam,
            ] : null,

            'harga_paket' => (int) $booking->harga_paket,
            'pakai_antar_jemput' => (bool) $booking->pakai_antar_jemput,
            'pakai_sim' => (bool) $booking->pakai_sim,

            'payment' => $booking->payment ? [
                'id' => $booking->payment->id,
                'status' => $booking->payment->status,
                'nominal_bayar' => (int) $booking->payment->nominal_bayar,
                'bukti_bayar_url' => $this->resolvePaymentProofUrl($booking),
                'tanggal_upload' => DateFormatter::dateTime($booking->payment->tanggal_upload),
                'tanggal_verifikasi' => DateFormatter::dateTime($booking->payment->tanggal_verifikasi),
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
    }

    private function formatRiwayatBookingDetail(Booking $booking): array
    {
        $data = $this->formatBooking($booking, true);

        $data['status_label'] = $this->resolveBookingStatusLabel($booking->status);

        $data['training_result'] = $booking->trainingResult ? [
            'id' => $booking->trainingResult->id,
            'tanggal_latihan' => DateFormatter::date($booking->trainingResult->tanggal_latihan),
            'status_kehadiran' => $booking->trainingResult->status_kehadiran,
            'nilai_praktik' => $booking->trainingResult->nilai_praktik !== null
                ? (float) $booking->trainingResult->nilai_praktik
                : null,
            'nilai_sikap' => $booking->trainingResult->nilai_sikap !== null
                ? (float) $booking->trainingResult->nilai_sikap
                : null,
            'nilai_pemahaman' => $booking->trainingResult->nilai_pemahaman !== null
                ? (float) $booking->trainingResult->nilai_pemahaman
                : null,
            'nilai_akhir' => $booking->trainingResult->nilai_akhir !== null
                ? (float) $booking->trainingResult->nilai_akhir
                : null,
            'status_kelulusan' => $booking->trainingResult->status_kelulusan,
            'catatan_instruktur' => $booking->trainingResult->catatan_instruktur,
            'catatan_admin' => $booking->trainingResult->catatan_admin,
            'instructor' => $booking->trainingResult->instructor ? [
                'id' => $booking->trainingResult->instructor->id,
                'kode_instruktur' => $booking->trainingResult->instructor->kode_instruktur,
                'nama_instruktur' => $booking->trainingResult->instructor->user?->name,
            ] : null,
        ] : null;

        return $data;
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

    private function getAuthenticatedParticipant(Request $request): ?Participant
    {
        return Participant::query()
            ->with(['user.role', 'activePackage'])
            ->where('user_id', $request->user()->id)
            ->first();
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

        $hasUnfinishedActivePackage = $participant->paket_aktif_id
            && (int) $participant->paket_aktif_id !== (int) $package->id
            && (int) $participant->jumlah_sesi_total > 0
            && (int) $participant->jumlah_sesi_selesai < (int) $participant->jumlah_sesi_total;

        if ($hasUnfinishedActivePackage) {
            return [
                'error' => true,
                'status' => 409,
                'message' => 'Anda masih memiliki paket aktif yang belum selesai. Paket aktif harus diselesaikan sebelum mengambil paket berbeda.',
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
                'message' => 'Anda masih memiliki booking aktif pada paket berbeda. Selesaikan atau batalkan booking tersebut sebelum memilih paket lain.',
            ];
        }

        return null;
    }

    private function formatSchedule(TrainingSchedule $schedule): array
    {
        $remainingCapacity = max(0, (int) $schedule->kapasitas - (int) $schedule->jumlah_booking);

        return [
            'id' => $schedule->id,
            'kode_jadwal' => $schedule->kode_jadwal,
            'tanggal_latihan' => DateFormatter::date($schedule->tanggal_latihan),

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

            'kapasitas' => (int) $schedule->kapasitas,
            'jumlah_booking' => (int) $schedule->jumlah_booking,
            'sisa_kapasitas' => $remainingCapacity,
            'status' => $schedule->status,
            'catatan' => $schedule->catatan,
        ];
    }

    private function formatBooking(Booking $booking, bool $withHistories = false): array
    {
        $data = [
            'id' => $booking->id,
            'kode_booking' => $booking->kode_booking,
            'status' => $booking->status,
            'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),
            'tanggal_dikonfirmasi' => DateFormatter::dateTime($booking->tanggal_dikonfirmasi),
            'tanggal_dibatalkan' => DateFormatter::dateTime($booking->tanggal_dibatalkan),
            'alasan_pembatalan' => $booking->alasan_pembatalan,
            'catatan' => $booking->catatan,

            'pakai_antar_jemput' => (bool) $booking->pakai_antar_jemput,
            'pakai_sim' => (bool) $booking->pakai_sim,
            'alamat_jemput' => $booking->alamat_jemput,
            'harga_paket' => (int) $booking->harga_paket,

            'course_package' => $booking->coursePackage ? [
                'id' => $booking->coursePackage->id,
                'kode_paket' => $booking->coursePackage->kode_paket,
                'nama_paket' => $booking->coursePackage->nama_paket,
                'durasi_jam' => (int) $booking->coursePackage->durasi_jam,
            ] : null,

            'training_schedule' => $booking->trainingSchedule
                ? $this->formatSchedule($booking->trainingSchedule)
                : null,

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

        return route('peserta.booking.bukti-bayar', ['id' => $booking->id]);
    }

    private function validateChangeOrCancelWindow($scheduleDate): array
    {
        if (!$scheduleDate) {
            return [
                'allowed' => false,
                'message' => 'Tanggal latihan tidak ditemukan.',
            ];
        }

        $today = now()->startOfDay();
        $trainingDate = Carbon::parse($scheduleDate)->startOfDay();
        $deadlineDate = $trainingDate->copy()->subDays(3);

        if ($today->gte($deadlineDate)) {
            return [
                'allowed' => false,
                'message' => 'Booking tidak dapat diubah atau dibatalkan karena sudah memasuki batas H-3 sebelum jadwal latihan.',
                'deadline_date' => $deadlineDate->toDateString(),
                'training_date' => $trainingDate->toDateString(),
            ];
        }

        return [
            'allowed' => true,
            'message' => null,
            'deadline_date' => $deadlineDate->toDateString(),
            'training_date' => $trainingDate->toDateString(),
        ];
    }
}
