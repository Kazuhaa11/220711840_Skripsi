<?php

namespace Database\Seeders;

use App\Models\TimeSlot;
use Illuminate\Database\Seeder;

class TimeSlotSeeder extends Seeder
{
    private const EVERY_DAY = 'Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu';

    public function run(): void
    {
        $timeSlots = [
            [
                'kode_slot' => 'SLT-001',
                'nama_slot' => 'Pagi 1',
                'subtitle' => 'Sesi latihan pagi pertama',
                'jam_mulai' => '08:00:00',
                'jam_selesai' => '10:00:00',
                'durasi_menit' => 120,
                'hari_aktif' => self::EVERY_DAY,
                'catatan' => 'Cocok untuk peserta yang ingin latihan pagi.',
            ],
            [
                'kode_slot' => 'SLT-002',
                'nama_slot' => 'Pagi 2',
                'subtitle' => 'Sesi latihan menjelang siang',
                'jam_mulai' => '10:00:00',
                'jam_selesai' => '12:00:00',
                'durasi_menit' => 120,
                'hari_aktif' => self::EVERY_DAY,
                'catatan' => 'Cocok untuk peserta yang memiliki waktu luang sebelum siang.',
            ],
            [
                'kode_slot' => 'SLT-003',
                'nama_slot' => 'Siang',
                'subtitle' => 'Sesi latihan siang',
                'jam_mulai' => '13:00:00',
                'jam_selesai' => '15:00:00',
                'durasi_menit' => 120,
                'hari_aktif' => self::EVERY_DAY,
                'catatan' => 'Sesi latihan setelah jam istirahat.',
            ],
            [
                'kode_slot' => 'SLT-004',
                'nama_slot' => 'Sore',
                'subtitle' => 'Sesi latihan sore',
                'jam_mulai' => '15:00:00',
                'jam_selesai' => '17:00:00',
                'durasi_menit' => 120,
                'hari_aktif' => self::EVERY_DAY,
                'catatan' => 'Cocok untuk peserta yang tersedia pada sore hari.',
            ],
        ];

        foreach ($timeSlots as $slot) {
            TimeSlot::updateOrCreate(
                ['kode_slot' => $slot['kode_slot']],
                [
                    ...$slot,
                    'status' => 'Aktif',
                ]
            );
        }
    }
}
