<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('course_packages', function (Blueprint $table) {
            $table->id();

            $table->string('kode_paket', 30)->unique();
            $table->string('nama_paket', 150);
            $table->unsignedInteger('durasi_jam');

            $table->text('deskripsi')->nullable();

            $table->decimal('harga_antar_jemput', 12, 2);
            $table->decimal('harga_tidak_antar_jemput', 12, 2);

            $table->decimal('harga_dengan_sim_antar_jemput', 12, 2);
            $table->decimal('harga_dengan_sim_tidak_antar_jemput', 12, 2);

            $table->boolean('termasuk_sertifikat')->default(true);

            $table->json('fasilitas')->nullable();

            $table->enum('status', [
                'Aktif',
                'Nonaktif',
            ])->default('Aktif');

            $table->timestamps();

            $table->index('durasi_jam');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_packages');
    }
};