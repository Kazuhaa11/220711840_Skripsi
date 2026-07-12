<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('time_slots', function (Blueprint $table) {
            $table->id();

            $table->string('kode_slot', 40)->unique();
            $table->string('nama_slot', 100);
            $table->string('subtitle', 150)->nullable();

            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->unsignedInteger('durasi_menit');

            $table->enum('status', [
                'Aktif',
                'Nonaktif',
            ])->default('Aktif');

            $table->string('hari_aktif', 150)->nullable();
            $table->text('catatan')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index(['jam_mulai', 'jam_selesai']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_slots');
    }
};