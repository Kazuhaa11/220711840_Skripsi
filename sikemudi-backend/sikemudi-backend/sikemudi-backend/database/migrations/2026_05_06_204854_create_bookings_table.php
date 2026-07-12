<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            $table->string('kode_booking', 40)->unique();

            $table->foreignId('participant_id')
                ->constrained('participants')
                ->cascadeOnDelete();

            $table->foreignId('training_schedule_id')
                ->constrained('training_schedules')
                ->restrictOnDelete();

            $table->foreignId('course_package_id')
                ->nullable()
                ->constrained('course_packages')
                ->nullOnDelete();

            $table->boolean('pakai_antar_jemput')->default(false);
            $table->boolean('pakai_sim')->default(false);

            $table->text('alamat_jemput')->nullable();

            $table->decimal('harga_paket', 12, 2)->default(0);

            $table->enum('status', [
                'Menunggu Pembayaran',
                'Menunggu Konfirmasi Pembayaran',
                'Dikonfirmasi',
                'Dijadwalkan Ulang',
                'Selesai',
                'Dibatalkan',
            ])->default('Menunggu Pembayaran');

            $table->timestamp('tanggal_booking')->nullable();
            $table->timestamp('tanggal_dikonfirmasi')->nullable();
            $table->timestamp('tanggal_dibatalkan')->nullable();

            $table->text('alasan_pembatalan')->nullable();
            $table->text('catatan')->nullable();

            $table->timestamps();

            $table->index('participant_id');
            $table->index('training_schedule_id');
            $table->index('course_package_id');
            $table->index('status');
            $table->index('tanggal_booking');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};