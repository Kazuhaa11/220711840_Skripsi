<?php

namespace App\Http\Controllers\Api\Instruktur;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use App\Models\InstructorTimeSlotAssignment;
use App\Models\TimeSlot;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SlotAssignmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $instructor = $this->getAuthenticatedInstructor($request);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Data instruktur tidak ditemukan.',
            ], 404);
        }

        $timeSlots = TimeSlot::query()
            ->where('status', 'Aktif')
            ->orderBy('jam_mulai')
            ->orderBy('id')
            ->get();

        $assignments = InstructorTimeSlotAssignment::query()
            ->with('timeSlot')
            ->where('instructor_id', $instructor->id)
            ->where('status', 'Aktif')
            ->whereHas('timeSlot', function ($query) {
                $query->where('status', 'Aktif');
            })
            ->orderByRaw("FIELD(day_of_week, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu')")
            ->orderBy('time_slot_id')
            ->get();

        $assignmentsByCell = $assignments->keyBy(function (InstructorTimeSlotAssignment $assignment) {
            return $assignment->day_of_week . '-' . $assignment->time_slot_id;
        });

        $items = collect(InstructorTimeSlotAssignment::DAYS)
            ->map(function (string $day) use ($timeSlots, $assignmentsByCell) {
                return [
                    'day_of_week' => $day,
                    'slots' => $timeSlots
                        ->map(function (TimeSlot $slot) use ($day, $assignmentsByCell) {
                            $assignment = $assignmentsByCell->get($day . '-' . $slot->id);

                            return [
                                'time_slot' => $this->formatTimeSlot($slot),
                                'is_assigned' => (bool) $assignment,
                                'assignment' => $assignment ? $this->formatAssignment($assignment) : null,
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Data assignment slot instruktur berhasil diambil.',
            'data' => [
                'instructor' => $this->formatInstructor($instructor),
                'days' => InstructorTimeSlotAssignment::DAYS,
                'time_slots' => $timeSlots->map(fn(TimeSlot $slot) => $this->formatTimeSlot($slot))->values(),
                'assignments' => $assignments
                    ->map(fn(InstructorTimeSlotAssignment $assignment) => $this->formatAssignment($assignment))
                    ->values(),
                'items' => $items,
                'summary' => [
                    'active_assignment_count' => $assignments->count(),
                    'active_slot_count' => $timeSlots->count(),
                ],
            ],
        ]);
    }

    private function getAuthenticatedInstructor(Request $request): ?Instructor
    {
        return Instructor::query()
            ->with('user.role')
            ->where('user_id', $request->user()->id)
            ->first();
    }

    private function formatInstructor(Instructor $instructor): array
    {
        return [
            'id' => $instructor->id,
            'kode_instruktur' => $instructor->kode_instruktur,
            'nama_instruktur' => $instructor->user?->name,
            'email' => $instructor->user?->email,
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

    private function formatAssignment(InstructorTimeSlotAssignment $assignment): array
    {
        return [
            'id' => $assignment->id,
            'day_of_week' => $assignment->day_of_week,
            'status' => $assignment->status,
            'catatan' => $assignment->catatan,
            'time_slot' => $assignment->timeSlot ? $this->formatTimeSlot($assignment->timeSlot) : null,
            'created_at' => DateFormatter::dateTime($assignment->created_at),
            'updated_at' => DateFormatter::dateTime($assignment->updated_at),
        ];
    }
}
