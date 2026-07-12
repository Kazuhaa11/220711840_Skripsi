<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('participants', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('kode_peserta', 40)->unique();

            $table->foreignId('paket_aktif_id')
                ->nullable()
                ->constrained('course_packages')
                ->nullOnDelete();

            $table->date('tanggal_lahir')->nullable();

            $table->enum('gender', [
                'Laki-laki',
                'Perempuan',
            ])->nullable();

            $table->date('tanggal_bergabung')->nullable();

            $table->unsignedInteger('jumlah_sesi_selesai')->default(0);
            $table->unsignedInteger('jumlah_sesi_total')->default(0);
            $table->unsignedInteger('jumlah_absen')->default(0);

            $table->decimal('rating_rata_rata', 3, 2)->default(0);

            $table->enum('status_sertifikat', [
                'Terbit',
                'Dalam Proses',
                'Belum Ada',
            ])->default('Belum Ada');

            $table->timestamps();

            $table->index('kode_peserta');
            $table->index('status_sertifikat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('participants');
    }
};