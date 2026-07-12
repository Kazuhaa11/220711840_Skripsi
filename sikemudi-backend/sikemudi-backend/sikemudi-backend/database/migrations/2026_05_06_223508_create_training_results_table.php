<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('training_results', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->unique()
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->foreignId('participant_id')
                ->constrained('participants')
                ->cascadeOnDelete();

            $table->foreignId('training_schedule_id')
                ->constrained('training_schedules')
                ->restrictOnDelete();

            $table->foreignId('instructor_id')
                ->constrained('instructors')
                ->restrictOnDelete();

            $table->date('tanggal_latihan');

            $table->enum('status_kehadiran', [
                'Hadir',
                'Tidak Hadir',
                'Izin',
            ])->default('Hadir');

            $table->decimal('nilai_praktik', 5, 2)->nullable();
            $table->decimal('nilai_sikap', 5, 2)->nullable();
            $table->decimal('nilai_pemahaman', 5, 2)->nullable();
            $table->decimal('nilai_akhir', 5, 2)->nullable();

            $table->enum('status_kelulusan', [
                'Belum Dinilai',
                'Lulus',
                'Tidak Lulus',
            ])->default('Belum Dinilai');

            $table->text('catatan_instruktur')->nullable();
            $table->text('catatan_admin')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index('participant_id');
            $table->index('training_schedule_id');
            $table->index('instructor_id');
            $table->index('tanggal_latihan');
            $table->index('status_kehadiran');
            $table->index('status_kelulusan');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_results');
    }
};