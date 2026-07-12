<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CoursePackage;
use App\Models\Instructor;
use App\Models\TimeSlot;
use App\Models\TrainingSchedule;
use App\Models\Vehicle;
use App\Support\DateFormatter;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JadwalLatihanController extends Controller
{
    public function instrukturTersedia(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tanggal_latihan' => ['required', 'date'],
            'time_slot_id' => ['required', 'exists:time_slots,id'],
            'exclude_schedule_id' => ['nullable', 'integer', 'exists:training_schedules,id'],
        ], [
            'tanggal_latihan.required' => 'Tanggal latihan wajib diisi.',
            'tanggal_latihan.date' => 'Tanggal latihan tidak valid.',
            'time_slot_id.required' => 'Slot waktu wajib dipilih.',
            'time_slot_id.exists' => 'Slot waktu tidak ditemukan.',
            'exclude_schedule_id.exists' => 'Jadwal yang diabaikan tidak ditemukan.',
        ]);

        $date = Carbon::parse($validated['tanggal_latihan'])->startOfDay();
        $dayOfWeek = $this->indonesianDayName($date);
        $timeSlot = TimeSlot::query()
            ->where('status', 'Aktif')
            ->find($validated['time_slot_id']);

        if (!$timeSlot) {
            return response()->json([
                'success' => false,
                'message' => 'Slot waktu tidak aktif atau tidak ditemukan.',
            ], 422);
        }

        $busyInstructorIds = TrainingSchedule::query()
            ->whereDate('tanggal_latihan', $date->toDateString())
            ->where('time_slot_id', $timeSlot->id)
            ->whereNotIn('status', ['Dibatalkan', 'Selesai'])
            ->when($validated['exclude_schedule_id'] ?? null, function ($query, $scheduleId) {
                $query->where('id', '!=', $scheduleId);
            })
            ->pluck('instructor_id')
            ->filter()
            ->unique()
            ->values();

        $instructors = Instructor::query()
            ->with('user')
            ->where('status', 'Aktif')
            ->where('status_jadwal', '!=', 'Libur / Cuti')
            ->whereHas('user', function ($query) {
                $query->where('status_akun', 'Aktif');
            })
            ->whereHas('timeSlotAssignments', function ($query) use ($timeSlot, $dayOfWeek) {
                $query
                    ->where('time_slot_id', $timeSlot->id)
                    ->where('day_of_week', $dayOfWeek)
                    ->where('status', 'Aktif');
            })
            ->when($busyInstructorIds->isNotEmpty(), function ($query) use ($busyInstructorIds) {
                $query->whereNotIn('id', $busyInstructorIds);
            })
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data instruktur tersedia berhasil diambil.',
            'data' => [
                'day_of_week' => $dayOfWeek,
                'time_slot' => $this->formatAvailableTimeSlot($timeSlot),
                'items' => $instructors
                    ->map(fn(Instructor $instructor) => $this->formatAvailableInstructor($instructor))
                    ->values(),
                'auto_select' => $instructors->count() === 1,
                'selected_instructor_id' => $instructors->count() === 1 ? $instructors->first()->id : null,
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $schedules = TrainingSchedule::query()
            ->with([
                'timeSlot',
                'instructor.user',
                'vehicle',
                'coursePackage',
            ])
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_jadwal', 'like', "%{$keyword}%")
                        ->orWhere('catatan', 'like', "%{$keyword}%")
                        ->orWhereHas('timeSlot', function ($slotQuery) use ($keyword) {
                            $slotQuery
                                ->where('nama_slot', 'like', "%{$keyword}%")
                                ->orWhere('kode_slot', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('instructor.user', function ($userQuery) use ($keyword) {
                            $userQuery->where('name', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('vehicle', function ($vehicleQuery) use ($keyword) {
                            $vehicleQuery
                                ->where('nama_kendaraan', 'like', "%{$keyword}%")
                                ->orWhere('nomor_plat', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('coursePackage', function ($packageQuery) use ($keyword) {
                            $packageQuery
                                ->where('nama_paket', 'like', "%{$keyword}%")
                                ->orWhere('kode_paket', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('tanggal'), function ($query) use ($request) {
                $query->whereDate('tanggal_latihan', $request->query('tanggal'));
            })
            ->when($request->filled('tanggal_mulai'), function ($query) use ($request) {
                $query->whereDate('tanggal_latihan', '>=', $request->query('tanggal_mulai'));
            })
            ->when($request->filled('tanggal_selesai'), function ($query) use ($request) {
                $query->whereDate('tanggal_latihan', '<=', $request->query('tanggal_selesai'));
            })
            ->when($request->filled('time_slot_id'), function ($query) use ($request) {
                $query->where('time_slot_id', $request->query('time_slot_id'));
            })
            ->when($request->filled('instructor_id'), function ($query) use ($request) {
                $query->where('instructor_id', $request->query('instructor_id'));
            })
            ->when($request->filled('vehicle_id'), function ($query) use ($request) {
                $query->where('vehicle_id', $request->query('vehicle_id'));
            })
            ->when($request->filled('course_package_id'), function ($query) use ($request) {
                $query->where('course_package_id', $request->query('course_package_id'));
            })
            ->orderByDesc('tanggal_latihan')
            ->orderBy('time_slot_id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data jadwal latihan berhasil diambil.',
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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_jadwal' => ['nullable', 'string', 'max:40', 'unique:training_schedules,kode_jadwal'],
            'tanggal_latihan' => ['required', 'date'],
            'time_slot_id' => ['required', 'exists:time_slots,id'],
            'instructor_id' => ['required', 'exists:instructors,id'],
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'course_package_id' => ['nullable', 'exists:course_packages,id'],
            'kapasitas' => ['required', 'integer', 'min:1', 'max:50'],
            'status' => [
                'nullable',
                Rule::in([
                    'Tersedia',
                    'Penuh',
                    'Berlangsung',
                    'Selesai',
                    'Dibatalkan',
                ])
            ],
            'catatan' => ['nullable', 'string'],
        ], [
            'tanggal_latihan.required' => 'Tanggal latihan wajib diisi.',
            'time_slot_id.required' => 'Slot waktu wajib dipilih.',
            'time_slot_id.exists' => 'Slot waktu tidak ditemukan.',
            'instructor_id.required' => 'Instruktur wajib dipilih.',
            'instructor_id.exists' => 'Instruktur tidak ditemukan.',
            'vehicle_id.required' => 'Kendaraan wajib dipilih.',
            'vehicle_id.exists' => 'Kendaraan tidak ditemukan.',
            'course_package_id.exists' => 'Paket kursus tidak ditemukan.',
            'kapasitas.required' => 'Kapasitas wajib diisi.',
            'kapasitas.integer' => 'Kapasitas harus berupa angka.',
            'kapasitas.min' => 'Kapasitas minimal 1 peserta.',
            'status.in' => 'Status jadwal tidak valid.',
        ]);

        $resourceValidation = $this->validateScheduleResources(
            (int) $validated['time_slot_id'],
            (int) $validated['instructor_id'],
            (int) $validated['vehicle_id'],
            $validated['course_package_id'] ?? null
        );

        if (!$resourceValidation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $resourceValidation['message'],
            ], 422);
        }

        $conflict = $this->checkScheduleConflict(
            $validated['tanggal_latihan'],
            (int) $validated['time_slot_id'],
            (int) $validated['instructor_id'],
            (int) $validated['vehicle_id']
        );

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => $conflict,
            ], 409);
        }

        try {
            $schedule = TrainingSchedule::create([
                'kode_jadwal' => $validated['kode_jadwal'] ?? $this->generateScheduleCode(),
                'tanggal_latihan' => $validated['tanggal_latihan'],
                'time_slot_id' => $validated['time_slot_id'],
                'instructor_id' => $validated['instructor_id'],
                'vehicle_id' => $validated['vehicle_id'],
                'course_package_id' => $validated['course_package_id'] ?? null,
                'kapasitas' => $validated['kapasitas'],
                'jumlah_booking' => 0,
                'status' => $validated['status'] ?? 'Tersedia',
                'catatan' => $validated['catatan'] ?? null,
            ]);

            $schedule->load([
                'timeSlot',
                'instructor.user',
                'vehicle',
                'coursePackage',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Jadwal latihan berhasil ditambahkan.',
                'data' => [
                    'item' => $this->formatSchedule($schedule),
                ],
            ], 201);
        } catch (QueryException) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal latihan bentrok dengan jadwal lain. Periksa kembali instruktur, kendaraan, tanggal, dan slot waktu.',
            ], 409);
        }
    }

    public function show(string $id): JsonResponse
    {
        $schedule = TrainingSchedule::with([
            'timeSlot',
            'instructor.user',
            'vehicle',
            'coursePackage',
        ])->find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal latihan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail jadwal latihan berhasil diambil.',
            'data' => [
                'item' => $this->formatSchedule($schedule),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $schedule = TrainingSchedule::with([
            'timeSlot',
            'instructor.user',
            'vehicle',
            'coursePackage',
            'bookings',
        ])->find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal latihan tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'kode_jadwal' => [
                'nullable',
                'string',
                'max:40',
                Rule::unique('training_schedules', 'kode_jadwal')->ignore($schedule->id),
            ],
            'tanggal_latihan' => ['required', 'date'],
            'time_slot_id' => ['required', 'exists:time_slots,id'],
            'instructor_id' => ['required', 'exists:instructors,id'],
            'vehicle_id' => ['required', 'exists:vehicles,id'],
            'course_package_id' => ['nullable', 'exists:course_packages,id'],
            'kapasitas' => ['required', 'integer', 'min:1', 'max:50'],
            'status' => [
                'required',
                Rule::in([
                    'Tersedia',
                    'Penuh',
                    'Berlangsung',
                    'Selesai',
                    'Dibatalkan',
                ])
            ],
            'catatan' => ['nullable', 'string'],
        ], [
            'tanggal_latihan.required' => 'Tanggal latihan wajib diisi.',
            'time_slot_id.required' => 'Slot waktu wajib dipilih.',
            'time_slot_id.exists' => 'Slot waktu tidak ditemukan.',
            'instructor_id.required' => 'Instruktur wajib dipilih.',
            'instructor_id.exists' => 'Instruktur tidak ditemukan.',
            'vehicle_id.required' => 'Kendaraan wajib dipilih.',
            'vehicle_id.exists' => 'Kendaraan tidak ditemukan.',
            'course_package_id.exists' => 'Paket kursus tidak ditemukan.',
            'kapasitas.required' => 'Kapasitas wajib diisi.',
            'kapasitas.integer' => 'Kapasitas harus berupa angka.',
            'kapasitas.min' => 'Kapasitas minimal 1 peserta.',
            'status.required' => 'Status jadwal wajib diisi.',
            'status.in' => 'Status jadwal tidak valid.',
        ]);

        $activeBookingStatuses = [
            'Menunggu Pembayaran',
            'Menunggu Konfirmasi Pembayaran',
            'Dikonfirmasi',
            'Dijadwalkan Ulang',
        ];

        $hasActiveBookings = $schedule->bookings()
            ->whereIn('status', $activeBookingStatuses)
            ->exists();

        if ($hasActiveBookings) {
            $blockedChanges = [];

            foreach (['tanggal_latihan', 'time_slot_id', 'instructor_id', 'vehicle_id', 'course_package_id'] as $field) {
                $oldValue = $field === 'tanggal_latihan'
                    ? optional($schedule->tanggal_latihan)->format('Y-m-d')
                    : (string) ($schedule->{$field} ?? '');
                $newValue = $field === 'tanggal_latihan'
                    ? Carbon::parse($validated[$field])->format('Y-m-d')
                    : (string) ($validated[$field] ?? '');

                if ($oldValue !== $newValue) {
                    $blockedChanges[] = $field;
                }
            }

            if ($blockedChanges !== []) {
                return response()->json([
                    'success' => false,
                    'message' => 'Jadwal latihan sudah memiliki booking aktif. Perubahan tanggal, slot, instruktur, kendaraan, atau paket harus dilakukan melalui flow ubah jadwal booking.',
                    'data' => [
                        'blocked_fields' => $blockedChanges,
                    ],
                ], 422);
            }
        }

        if ((int) $validated['kapasitas'] < (int) $schedule->jumlah_booking) {
            return response()->json([
                'success' => false,
                'message' => 'Kapasitas tidak boleh lebih kecil dari jumlah booking yang sudah terkonfirmasi atau ter-reserve.',
            ], 422);
        }

        $resourceValidation = $this->validateScheduleResources(
            (int) $validated['time_slot_id'],
            (int) $validated['instructor_id'],
            (int) $validated['vehicle_id'],
            $validated['course_package_id'] ?? null
        );

        if (!$resourceValidation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $resourceValidation['message'],
            ], 422);
        }

        $conflict = $this->checkScheduleConflict(
            $validated['tanggal_latihan'],
            (int) $validated['time_slot_id'],
            (int) $validated['instructor_id'],
            (int) $validated['vehicle_id'],
            (int) $schedule->id
        );

        if ($conflict) {
            return response()->json([
                'success' => false,
                'message' => $conflict,
            ], 409);
        }

        try {
            $schedule->update([
                'kode_jadwal' => $validated['kode_jadwal'] ?: $schedule->kode_jadwal,
                'tanggal_latihan' => $validated['tanggal_latihan'],
                'time_slot_id' => $validated['time_slot_id'],
                'instructor_id' => $validated['instructor_id'],
                'vehicle_id' => $validated['vehicle_id'],
                'course_package_id' => $validated['course_package_id'] ?? null,
                'kapasitas' => $validated['kapasitas'],
                'status' => $this->normalizeScheduleStatus(
                    $validated['status'],
                    (int) $validated['kapasitas'],
                    (int) $schedule->jumlah_booking
                ),
                'catatan' => $validated['catatan'] ?? null,
            ]);

            $schedule = $schedule->fresh([
                'timeSlot',
                'instructor.user',
                'vehicle',
                'coursePackage',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Jadwal latihan berhasil diperbarui.',
                'data' => [
                    'item' => $this->formatSchedule($schedule),
                ],
            ]);
        } catch (QueryException) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal latihan bentrok dengan jadwal lain. Periksa kembali instruktur, kendaraan, tanggal, dan slot waktu.',
            ], 409);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $schedule = TrainingSchedule::withCount('bookings')->find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal latihan tidak ditemukan.',
            ], 404);
        }

        if ($schedule->bookings_count > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal latihan tidak dapat dihapus karena sudah memiliki data booking.',
            ], 409);
        }

        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal latihan berhasil dihapus.',
        ]);
    }

    private function validateScheduleResources(
        int $timeSlotId,
        int $instructorId,
        int $vehicleId,
        int|string|null $coursePackageId
    ): array {
        $timeSlot = TimeSlot::find($timeSlotId);

        if (!$timeSlot || $timeSlot->status !== 'Aktif') {
            return [
                'valid' => false,
                'message' => 'Slot waktu tidak aktif atau tidak ditemukan.',
            ];
        }

        $instructor = Instructor::with('user')->find($instructorId);

        if (!$instructor || $instructor->status !== 'Aktif') {
            return [
                'valid' => false,
                'message' => 'Instruktur tidak aktif atau tidak ditemukan.',
            ];
        }

        if ($instructor->user?->status_akun !== 'Aktif') {
            return [
                'valid' => false,
                'message' => 'Akun instruktur tidak aktif.',
            ];
        }

        $vehicle = Vehicle::find($vehicleId);

        if (!$vehicle || $vehicle->status !== 'Aktif') {
            return [
                'valid' => false,
                'message' => 'Kendaraan tidak aktif atau tidak ditemukan.',
            ];
        }

        if ($vehicle->ketersediaan === 'Maintenance') {
            return [
                'valid' => false,
                'message' => 'Kendaraan sedang dalam maintenance dan tidak dapat dijadwalkan.',
            ];
        }

        if ($coursePackageId) {
            $package = CoursePackage::find($coursePackageId);

            if (!$package || $package->status !== 'Aktif') {
                return [
                    'valid' => false,
                    'message' => 'Paket kursus tidak aktif atau tidak ditemukan.',
                ];
            }
        }

        return [
            'valid' => true,
            'message' => null,
        ];
    }

    private function checkScheduleConflict(
        string $date,
        int $timeSlotId,
        int $instructorId,
        int $vehicleId,
        ?int $ignoreScheduleId = null
    ): ?string {
        $instructorConflict = TrainingSchedule::query()
            ->whereDate('tanggal_latihan', $date)
            ->where('time_slot_id', $timeSlotId)
            ->where('instructor_id', $instructorId)
            ->when($ignoreScheduleId, function ($query) use ($ignoreScheduleId) {
                $query->where('id', '!=', $ignoreScheduleId);
            })
            ->exists();

        if ($instructorConflict) {
            return 'Instruktur sudah memiliki jadwal pada tanggal dan slot waktu yang sama.';
        }

        $vehicleConflict = TrainingSchedule::query()
            ->whereDate('tanggal_latihan', $date)
            ->where('time_slot_id', $timeSlotId)
            ->where('vehicle_id', $vehicleId)
            ->when($ignoreScheduleId, function ($query) use ($ignoreScheduleId) {
                $query->where('id', '!=', $ignoreScheduleId);
            })
            ->exists();

        if ($vehicleConflict) {
            return 'Kendaraan sudah digunakan pada tanggal dan slot waktu yang sama.';
        }

        return null;
    }

    private function generateScheduleCode(): string
    {
        $lastSchedule = TrainingSchedule::query()
            ->orderByDesc('id')
            ->first();

        $nextNumber = $lastSchedule ? $lastSchedule->id + 1 : 1;

        return 'JDL-' . now()->format('Ymd') . '-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function normalizeScheduleStatus(string $status, int $capacity, int $bookingCount): string
    {
        if ($status === 'Dibatalkan' || $status === 'Berlangsung' || $status === 'Selesai') {
            return $status;
        }

        if ($bookingCount >= $capacity) {
            return 'Penuh';
        }

        return $status === 'Penuh' ? 'Tersedia' : $status;
    }

    private function indonesianDayName(Carbon $date): string
    {
        return match ((int) $date->isoWeekday()) {
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            default => 'Minggu',
        };
    }

    private function formatAvailableInstructor(Instructor $instructor): array
    {
        return [
            'id' => $instructor->id,
            'kode_instruktur' => $instructor->kode_instruktur,
            'nama_instruktur' => $instructor->user?->name,
            'email' => $instructor->user?->email,
            'no_telepon' => $instructor->user?->no_telepon,
            'status' => $instructor->status,
            'status_jadwal' => $instructor->status_jadwal,
        ];
    }

    private function formatAvailableTimeSlot(TimeSlot $slot): array
    {
        return [
            'id' => $slot->id,
            'kode_slot' => $slot->kode_slot,
            'nama_slot' => $slot->nama_slot,
            'subtitle' => $slot->subtitle,
            'jam_mulai' => DateFormatter::time($slot->jam_mulai),
            'jam_selesai' => DateFormatter::time($slot->jam_selesai),
            'durasi_menit' => (int) $slot->durasi_menit,
            'status' => $slot->status,
            'hari_aktif' => $slot->hari_aktif,
        ];
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
                'jam_mulai' => DateFormatter::time($schedule->timeSlot->jam_mulai),
                'jam_selesai' => DateFormatter::time($schedule->timeSlot->jam_selesai),
                'durasi_menit' => (int) $schedule->timeSlot->durasi_menit,
            ] : null,

            'instructor' => $schedule->instructor ? [
                'id' => $schedule->instructor->id,
                'kode_instruktur' => $schedule->instructor->kode_instruktur,
                'nama_instruktur' => $schedule->instructor->user?->name,
                'email' => $schedule->instructor->user?->email,
                'no_telepon' => $schedule->instructor->user?->no_telepon,
                'status' => $schedule->instructor->status,
            ] : null,

            'vehicle' => $schedule->vehicle ? [
                'id' => $schedule->vehicle->id,
                'kode_kendaraan' => $schedule->vehicle->kode_kendaraan,
                'nama_kendaraan' => $schedule->vehicle->nama_kendaraan,
                'model' => $schedule->vehicle->model,
                'nomor_plat' => $schedule->vehicle->nomor_plat,
                'transmisi' => $schedule->vehicle->transmisi,
                'status' => $schedule->vehicle->status,
                'ketersediaan' => $schedule->vehicle->ketersediaan,
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

            'created_at' => DateFormatter::dateTime($schedule->created_at),
            'updated_at' => DateFormatter::dateTime($schedule->updated_at),
        ];
    }
}
