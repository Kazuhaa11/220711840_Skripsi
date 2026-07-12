<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\TimeSlot;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SlotWaktuController extends Controller
{
    private const DAYS = [
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu',
        'Minggu',
    ];

    private const WEEKDAYS = [
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
    ];

    private const WEEKEND = [
        'Sabtu',
        'Minggu',
    ];

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $slots = TimeSlot::query()
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_slot', 'like', "%{$keyword}%")
                        ->orWhere('nama_slot', 'like', "%{$keyword}%")
                        ->orWhere('subtitle', 'like', "%{$keyword}%")
                        ->orWhere('hari_aktif', 'like', "%{$keyword}%");
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->orderBy('jam_mulai')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data slot waktu berhasil diambil.',
            'data' => [
                'items' => collect($slots->items())
                    ->map(fn(TimeSlot $slot) => $this->formatSlot($slot))
                    ->values(),
                'pagination' => [
                    'current_page' => $slots->currentPage(),
                    'last_page' => $slots->lastPage(),
                    'per_page' => $slots->perPage(),
                    'total' => $slots->total(),
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'kode_slot' => ['nullable', 'string', 'max:40', 'unique:time_slots,kode_slot'],
            'nama_slot' => ['required', 'string', 'max:100'],
            'subtitle' => ['nullable', 'string', 'max:150'],
            'jam_mulai' => ['required', 'date_format:H:i'],
            'jam_selesai' => ['required', 'date_format:H:i', 'after:jam_mulai'],
            'durasi_menit' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'status' => ['required', Rule::in(['Aktif', 'Nonaktif'])],
            'hari_aktif' => ['nullable', 'string', 'max:150'],
            'catatan' => ['nullable', 'string'],
        ], [
            'nama_slot.required' => 'Nama slot waktu wajib diisi.',
            'jam_mulai.required' => 'Jam mulai wajib diisi.',
            'jam_mulai.date_format' => 'Format jam mulai harus HH:mm, contoh 08:00.',
            'jam_selesai.required' => 'Jam selesai wajib diisi.',
            'jam_selesai.date_format' => 'Format jam selesai harus HH:mm, contoh 10:00.',
            'jam_selesai.after' => 'Jam selesai harus lebih besar dari jam mulai.',
            'status.required' => 'Status slot waktu wajib diisi.',
            'status.in' => 'Status slot waktu tidak valid.',
        ]);

        $duration = $validated['durasi_menit']
            ?? $this->calculateDurationMinutes($validated['jam_mulai'], $validated['jam_selesai']);

        $slot = TimeSlot::create([
            'kode_slot' => $validated['kode_slot'] ?? $this->generateSlotCode(),
            'nama_slot' => $validated['nama_slot'],
            'subtitle' => $validated['subtitle'] ?? null,
            'jam_mulai' => $validated['jam_mulai'],
            'jam_selesai' => $validated['jam_selesai'],
            'durasi_menit' => $duration,
            'status' => $validated['status'],
            'hari_aktif' => $this->normalizeActiveDays($validated['hari_aktif'] ?? null),
            'catatan' => $validated['catatan'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Slot waktu berhasil ditambahkan.',
            'data' => [
                'item' => $this->formatSlot($slot),
            ],
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $slot = TimeSlot::find($id);

        if (!$slot) {
            return response()->json([
                'success' => false,
                'message' => 'Slot waktu tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail slot waktu berhasil diambil.',
            'data' => [
                'item' => $this->formatSlot($slot),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $slot = TimeSlot::find($id);

        if (!$slot) {
            return response()->json([
                'success' => false,
                'message' => 'Slot waktu tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'kode_slot' => [
                'nullable',
                'string',
                'max:40',
                Rule::unique('time_slots', 'kode_slot')->ignore($slot->id),
            ],
            'nama_slot' => ['required', 'string', 'max:100'],
            'subtitle' => ['nullable', 'string', 'max:150'],
            'jam_mulai' => ['required', 'date_format:H:i'],
            'jam_selesai' => ['required', 'date_format:H:i', 'after:jam_mulai'],
            'durasi_menit' => ['nullable', 'integer', 'min:1', 'max:1440'],
            'status' => ['required', Rule::in(['Aktif', 'Nonaktif'])],
            'hari_aktif' => ['nullable', 'string', 'max:150'],
            'catatan' => ['nullable', 'string'],
        ], [
            'nama_slot.required' => 'Nama slot waktu wajib diisi.',
            'jam_mulai.required' => 'Jam mulai wajib diisi.',
            'jam_mulai.date_format' => 'Format jam mulai harus HH:mm, contoh 08:00.',
            'jam_selesai.required' => 'Jam selesai wajib diisi.',
            'jam_selesai.date_format' => 'Format jam selesai harus HH:mm, contoh 10:00.',
            'jam_selesai.after' => 'Jam selesai harus lebih besar dari jam mulai.',
            'status.required' => 'Status slot waktu wajib diisi.',
            'status.in' => 'Status slot waktu tidak valid.',
        ]);

        $duration = $validated['durasi_menit']
            ?? $this->calculateDurationMinutes($validated['jam_mulai'], $validated['jam_selesai']);

        $slot->update([
            'kode_slot' => filled($validated['kode_slot'] ?? null)
                ? $validated['kode_slot']
                : $slot->kode_slot,
            'nama_slot' => $validated['nama_slot'],
            'subtitle' => $validated['subtitle'] ?? null,
            'jam_mulai' => $validated['jam_mulai'],
            'jam_selesai' => $validated['jam_selesai'],
            'durasi_menit' => $duration,
            'status' => $validated['status'],
            'hari_aktif' => $this->normalizeActiveDays($validated['hari_aktif'] ?? null),
            'catatan' => $validated['catatan'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Slot waktu berhasil diperbarui.',
            'data' => [
                'item' => $this->formatSlot($slot->fresh()),
            ],
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $slot = TimeSlot::withCount(['trainingSchedules', 'instructorAssignments'])->find($id);

        if (!$slot) {
            return response()->json([
                'success' => false,
                'message' => 'Slot waktu tidak ditemukan.',
            ], 404);
        }

        if ($slot->status === 'Nonaktif') {
            return response()->json([
                'success' => true,
                'message' => 'Slot waktu sudah dalam status nonaktif.',
                'data' => [
                    'item' => $this->formatSlot($slot),
                ],
            ]);
        }

        $slot->update([
            'status' => 'Nonaktif',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Slot waktu berhasil dinonaktifkan. Data jadwal latihan dan assignment lama tetap tersimpan.',
            'data' => [
                'item' => $this->formatSlot($slot->fresh()),
            ],
        ]);
    }

    public function activate(string $id): JsonResponse
    {
        $slot = TimeSlot::find($id);

        if (!$slot) {
            return response()->json([
                'success' => false,
                'message' => 'Slot waktu tidak ditemukan.',
            ], 404);
        }

        if ($slot->status === 'Aktif') {
            return response()->json([
                'success' => true,
                'message' => 'Slot waktu sudah dalam status aktif.',
                'data' => [
                    'item' => $this->formatSlot($slot),
                ],
            ]);
        }

        $slot->update([
            'status' => 'Aktif',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Slot waktu berhasil diaktifkan kembali.',
            'data' => [
                'item' => $this->formatSlot($slot->fresh()),
            ],
        ]);
    }

    private function generateSlotCode(): string
    {
        $lastSlot = TimeSlot::query()
            ->orderByDesc('id')
            ->first();

        $nextNumber = $lastSlot ? $lastSlot->id + 1 : 1;

        return 'SLT-' . str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);
    }

    private function calculateDurationMinutes(string $start, string $end): int
    {
        $startTime = strtotime($start);
        $endTime = strtotime($end);

        return (int) (($endTime - $startTime) / 60);
    }

    private function formatSlot(TimeSlot $slot): array
    {
        return [
            'id' => $slot->id,
            'kode_slot' => $slot->kode_slot,
            'nama_slot' => $slot->nama_slot,
            'subtitle' => $slot->subtitle,
            'jam_mulai' => substr((string) $slot->jam_mulai, 0, 5),
            'jam_selesai' => substr((string) $slot->jam_selesai, 0, 5),
            'durasi_menit' => (int) $slot->durasi_menit,
            'durasi_label' => $this->formatDurationLabel((int) $slot->durasi_menit),
            'status' => $slot->status,
            'hari_aktif' => $this->formatActiveDays($slot->hari_aktif),
            'catatan' => $slot->catatan,
            'created_at' => DateFormatter::dateTime($slot->created_at),
            'updated_at' => DateFormatter::dateTime($slot->updated_at),
        ];
    }

    private function formatDurationLabel(int $minutes): string
    {
        $hours = intdiv($minutes, 60);
        $remainingMinutes = $minutes % 60;

        if ($hours > 0 && $remainingMinutes > 0) {
            return "{$hours} jam {$remainingMinutes} menit";
        }

        if ($hours > 0) {
            return "{$hours} jam";
        }

        return "{$remainingMinutes} menit";
    }

    private function normalizeActiveDays(?string $value): ?string
    {
        $days = $this->parseActiveDays($value);

        if (empty($days)) {
            return null;
        }

        return implode(', ', $days);
    }

    private function formatActiveDays(?string $value): string
    {
        $days = $this->parseActiveDays($value);

        if ($days === self::DAYS) {
            return 'Setiap Hari (Senin - Minggu)';
        }

        if ($days === self::WEEKDAYS) {
            return 'Senin - Jumat';
        }

        if ($days === self::WEEKEND) {
            return 'Sabtu - Minggu';
        }

        return empty($days) ? 'Setiap Hari (Senin - Minggu)' : implode(', ', $days);
    }

    private function parseActiveDays(?string $value): array
    {
        $normalized = trim((string) $value);

        if ($normalized === '') {
            return self::DAYS;
        }

        $lowerValue = strtolower($normalized);

        if (str_contains($lowerValue, 'setiap hari') || str_contains($lowerValue, 'senin - minggu')) {
            return self::DAYS;
        }

        if (str_contains($lowerValue, 'senin - jumat')) {
            return self::WEEKDAYS;
        }

        if (str_contains($lowerValue, 'sabtu - minggu')) {
            return self::WEEKEND;
        }

        $daysByLowerName = collect(self::DAYS)->keyBy(fn(string $day) => strtolower($day));

        $days = collect(explode(',', $normalized))
            ->map(fn(string $day) => trim($day))
            ->filter()
            ->map(fn(string $day) => $daysByLowerName->get(strtolower($day)))
            ->filter()
            ->values()
            ->all();

        if ($days === ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']) {
            return self::DAYS;
        }

        return $days;
    }
}
