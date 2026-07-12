<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use App\Models\InstructorTimeSlotAssignment;
use App\Models\TimeSlot;
use App\Support\DateFormatter;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InstructorSlotAssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $assignments = InstructorTimeSlotAssignment::query()
            ->with(['instructor.user', 'timeSlot'])
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('day_of_week', 'like', "%{$keyword}%")
                        ->orWhere('catatan', 'like', "%{$keyword}%")
                        ->orWhereHas('instructor.user', function ($userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('instructor', function ($instructorQuery) use ($keyword) {
                            $instructorQuery->where('kode_instruktur', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('timeSlot', function ($slotQuery) use ($keyword) {
                            $slotQuery
                                ->where('nama_slot', 'like', "%{$keyword}%")
                                ->orWhere('kode_slot', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('day_of_week'), function ($query) use ($request) {
                $query->where('day_of_week', $request->query('day_of_week'));
            })
            ->when($request->filled('time_slot_id'), function ($query) use ($request) {
                $query->where('time_slot_id', $request->query('time_slot_id'));
            })
            ->when($request->filled('instructor_id'), function ($query) use ($request) {
                $query->where('instructor_id', $request->query('instructor_id'));
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->orderByRaw("FIELD(day_of_week, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')")
            ->orderBy(TimeSlot::select('jam_mulai')->whereColumn('time_slots.id', 'instructor_time_slot_assignments.time_slot_id'))
            ->orderBy('instructor_id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data assignment slot instruktur berhasil diambil.',
            'data' => [
                'items' => collect($assignments->items())
                    ->map(fn(InstructorTimeSlotAssignment $assignment) => $this->formatAssignment($assignment))
                    ->values(),
                'pagination' => [
                    'current_page' => $assignments->currentPage(),
                    'last_page' => $assignments->lastPage(),
                    'per_page' => $assignments->perPage(),
                    'total' => $assignments->total(),
                ],
            ],
        ]);
    }

    public function matrix(): JsonResponse
    {
        $days = InstructorTimeSlotAssignment::DAYS;
        $timeSlots = TimeSlot::query()
            ->where('status', 'Aktif')
            ->orderBy('jam_mulai')
            ->get();

        $assignments = InstructorTimeSlotAssignment::query()
            ->with(['instructor.user', 'timeSlot'])
            ->where('status', 'Aktif')
            ->whereHas('instructor', function ($query) {
                $query->where('status', 'Aktif');
            })
            ->whereHas('instructor.user', function ($query) {
                $query->where('status_akun', 'Aktif');
            })
            ->whereHas('timeSlot', function ($query) {
                $query->where('status', 'Aktif');
            })
            ->get()
            ->groupBy(fn(InstructorTimeSlotAssignment $assignment) => $assignment->day_of_week . '-' . $assignment->time_slot_id);

        $matrix = collect($days)
            ->map(function (string $day) use ($timeSlots, $assignments) {
                return [
                    'day_of_week' => $day,
                    'slots' => $timeSlots
                        ->map(function (TimeSlot $slot) use ($day, $assignments) {
                            $key = $day . '-' . $slot->id;
                            $slotAssignments = $assignments->get($key, collect());

                            return [
                                'time_slot' => $this->formatTimeSlot($slot),
                                'instructors' => collect($slotAssignments)
                                    ->map(fn(InstructorTimeSlotAssignment $assignment) => $this->formatInstructor($assignment->instructor))
                                    ->values(),
                                'assignment_count' => collect($slotAssignments)->count(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Matriks assignment slot instruktur berhasil diambil.',
            'data' => [
                'days' => $days,
                'time_slots' => $timeSlots->map(fn(TimeSlot $slot) => $this->formatTimeSlot($slot))->values(),
                'items' => $matrix,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'day_of_week' => ['required', Rule::in(InstructorTimeSlotAssignment::DAYS)],
            'time_slot_id' => ['required', 'exists:time_slots,id'],
            'instructor_id' => ['nullable', 'exists:instructors,id'],
            'instructor_ids' => ['nullable', 'array'],
            'instructor_ids.*' => ['integer', 'exists:instructors,id'],
            'status' => ['nullable', Rule::in(['Aktif', 'Nonaktif'])],
            'catatan' => ['nullable', 'string'],
        ], [
            'day_of_week.required' => 'Hari wajib dipilih.',
            'day_of_week.in' => 'Hari tidak valid.',
            'time_slot_id.required' => 'Slot waktu wajib dipilih.',
            'time_slot_id.exists' => 'Slot waktu tidak ditemukan.',
            'instructor_id.exists' => 'Instruktur tidak ditemukan.',
            'instructor_ids.*.exists' => 'Salah satu instruktur tidak ditemukan.',
        ]);

        $instructorIds = collect($validated['instructor_ids'] ?? [])
            ->push($validated['instructor_id'] ?? null)
            ->filter()
            ->map(fn($id) => (int) $id)
            ->unique()
            ->values();

        if ($instructorIds->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Pilih minimal satu instruktur untuk assignment slot waktu.',
            ], 422);
        }

        $validation = $this->validateAssignmentResources((int) $validated['time_slot_id'], $instructorIds->all());

        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $validation['message'],
            ], 422);
        }

        try {
            $items = DB::transaction(function () use ($validated, $instructorIds) {
                return $instructorIds
                    ->map(function (int $instructorId) use ($validated) {
                        return InstructorTimeSlotAssignment::updateOrCreate(
                            [
                                'instructor_id' => $instructorId,
                                'time_slot_id' => $validated['time_slot_id'],
                                'day_of_week' => $validated['day_of_week'],
                            ],
                            [
                                'status' => $validated['status'] ?? 'Aktif',
                                'catatan' => $validated['catatan'] ?? null,
                            ]
                        )->fresh(['instructor.user', 'timeSlot']);
                    })
                    ->values();
            });

            return response()->json([
                'success' => true,
                'message' => 'Assignment slot instruktur berhasil disimpan.',
                'data' => [
                    'items' => $items
                        ->map(fn(InstructorTimeSlotAssignment $assignment) => $this->formatAssignment($assignment))
                        ->values(),
                ],
            ], 201);
        } catch (QueryException) {
            return response()->json([
                'success' => false,
                'message' => 'Assignment slot instruktur sudah terdaftar. Periksa kembali hari, slot, dan instruktur.',
            ], 409);
        }
    }

    public function show(string $id): JsonResponse
    {
        $assignment = InstructorTimeSlotAssignment::with(['instructor.user', 'timeSlot'])->find($id);

        if (!$assignment) {
            return response()->json([
                'success' => false,
                'message' => 'Assignment slot instruktur tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail assignment slot instruktur berhasil diambil.',
            'data' => [
                'item' => $this->formatAssignment($assignment),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $assignment = InstructorTimeSlotAssignment::find($id);

        if (!$assignment) {
            return response()->json([
                'success' => false,
                'message' => 'Assignment slot instruktur tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'day_of_week' => ['required', Rule::in(InstructorTimeSlotAssignment::DAYS)],
            'time_slot_id' => ['required', 'exists:time_slots,id'],
            'instructor_id' => ['required', 'exists:instructors,id'],
            'status' => ['required', Rule::in(['Aktif', 'Nonaktif'])],
            'catatan' => ['nullable', 'string'],
        ], [
            'day_of_week.required' => 'Hari wajib dipilih.',
            'day_of_week.in' => 'Hari tidak valid.',
            'time_slot_id.required' => 'Slot waktu wajib dipilih.',
            'time_slot_id.exists' => 'Slot waktu tidak ditemukan.',
            'instructor_id.required' => 'Instruktur wajib dipilih.',
            'instructor_id.exists' => 'Instruktur tidak ditemukan.',
            'status.required' => 'Status assignment wajib diisi.',
            'status.in' => 'Status assignment tidak valid.',
        ]);

        $validation = $this->validateAssignmentResources((int) $validated['time_slot_id'], [(int) $validated['instructor_id']]);

        if (!$validation['valid']) {
            return response()->json([
                'success' => false,
                'message' => $validation['message'],
            ], 422);
        }

        try {
            $assignment->update([
                'day_of_week' => $validated['day_of_week'],
                'time_slot_id' => $validated['time_slot_id'],
                'instructor_id' => $validated['instructor_id'],
                'status' => $validated['status'],
                'catatan' => $validated['catatan'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Assignment slot instruktur berhasil diperbarui.',
                'data' => [
                    'item' => $this->formatAssignment($assignment->fresh(['instructor.user', 'timeSlot'])),
                ],
            ]);
        } catch (QueryException) {
            return response()->json([
                'success' => false,
                'message' => 'Assignment slot instruktur sudah terdaftar. Periksa kembali hari, slot, dan instruktur.',
            ], 409);
        }
    }

    public function destroy(string $id): JsonResponse
    {
        $assignment = InstructorTimeSlotAssignment::find($id);

        if (!$assignment) {
            return response()->json([
                'success' => false,
                'message' => 'Assignment slot instruktur tidak ditemukan.',
            ], 404);
        }

        $assignment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Assignment slot instruktur berhasil dihapus.',
        ]);
    }

    private function validateAssignmentResources(int $timeSlotId, array $instructorIds): array
    {
        $timeSlot = TimeSlot::find($timeSlotId);

        if (!$timeSlot || $timeSlot->status !== 'Aktif') {
            return [
                'valid' => false,
                'message' => 'Slot waktu tidak aktif atau tidak ditemukan.',
            ];
        }

        $activeInstructorCount = Instructor::query()
            ->whereIn('id', $instructorIds)
            ->where('status', 'Aktif')
            ->whereHas('user', function ($query) {
                $query->where('status_akun', 'Aktif');
            })
            ->count();

        if ($activeInstructorCount !== count($instructorIds)) {
            return [
                'valid' => false,
                'message' => 'Semua instruktur yang dipilih harus aktif dan memiliki akun aktif.',
            ];
        }

        return [
            'valid' => true,
            'message' => null,
        ];
    }

    private function formatAssignment(InstructorTimeSlotAssignment $assignment): array
    {
        return [
            'id' => $assignment->id,
            'day_of_week' => $assignment->day_of_week,
            'status' => $assignment->status,
            'catatan' => $assignment->catatan,
            'instructor' => $assignment->instructor ? $this->formatInstructor($assignment->instructor) : null,
            'time_slot' => $assignment->timeSlot ? $this->formatTimeSlot($assignment->timeSlot) : null,
            'created_at' => DateFormatter::dateTime($assignment->created_at),
            'updated_at' => DateFormatter::dateTime($assignment->updated_at),
        ];
    }

    private function formatInstructor(Instructor $instructor): array
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

    private function formatTimeSlot(TimeSlot $slot): array
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
}
