<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();

            $table->string('kode_kendaraan', 40)->unique();
            $table->string('nama_kendaraan', 100);
            $table->string('model', 120)->nullable();
            $table->string('nomor_plat', 30)->unique();

            $table->enum('transmisi', [
                'Manual',
                'Otomatis',
            ])->default('Manual');

            $table->enum('status', [
                'Aktif',
                'Servis',
                'Nonaktif',
            ])->default('Aktif');

            $table->enum('ketersediaan', [
                'Tersedia',
                'Maintenance',
                'Sedang Latihan',
            ])->default('Tersedia');

            $table->unsignedInteger('digunakan_hari_ini')->default(0);
            $table->unsignedInteger('kilometer_servis_terakhir')->default(0);

            $table->string('status_asuransi', 50)->default('Aktif');
            $table->string('status_stnk', 50)->default('Aktif');

            $table->text('catatan')->nullable();
            $table->longText('foto_kendaraan')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('ketersediaan');
            $table->index('transmisi');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};