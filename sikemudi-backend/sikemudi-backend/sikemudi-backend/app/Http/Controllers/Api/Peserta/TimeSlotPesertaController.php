<?php

namespace App\Http\Controllers\Api\Peserta;

use App\Http\Controllers\Controller;
use App\Models\TimeSlot;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;

class TimeSlotPesertaController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $slots = TimeSlot::query()
            ->where('status', 'Aktif')
            ->orderBy('jam_mulai')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data slot waktu aktif berhasil diambil.',
            'data' => [
                'items' => $slots
                    ->map(fn (TimeSlot $slot) => $this->formatSlot($slot))
                    ->values(),
            ],
        ]);
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
            'hari_aktif' => $slot->hari_aktif,
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
}
