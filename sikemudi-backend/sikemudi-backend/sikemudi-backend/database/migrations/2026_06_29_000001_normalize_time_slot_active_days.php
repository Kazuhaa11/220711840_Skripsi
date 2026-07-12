<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const LEGACY_EVERY_DAY = 'Senin, Selasa, Rabu, Kamis, Jumat, Sabtu';
    private const EVERY_DAY = 'Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu';

    public function up(): void
    {
        DB::table('time_slots')
            ->where('hari_aktif', self::LEGACY_EVERY_DAY)
            ->update(['hari_aktif' => self::EVERY_DAY]);
    }

    public function down(): void
    {
        DB::table('time_slots')
            ->where('hari_aktif', self::EVERY_DAY)
            ->update(['hari_aktif' => self::LEGACY_EVERY_DAY]);
    }
};
