<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('training_schedules', function (Blueprint $table) {
            $table->id();

            $table->string('kode_jadwal', 40)->unique();

            $table->date('tanggal_latihan');

            $table->foreignId('time_slot_id')
                ->constrained('time_slots')
                ->restrictOnDelete();

            $table->foreignId('instructor_id')
                ->constrained('instructors')
                ->restrictOnDelete();

            $table->foreignId('vehicle_id')
                ->constrained('vehicles')
                ->restrictOnDelete();

            $table->foreignId('course_package_id')
                ->nullable()
                ->constrained('course_packages')
                ->nullOnDelete();

            $table->unsignedInteger('kapasitas')->default(1);

            $table->unsignedInteger('jumlah_booking')->default(0);

            $table->enum('status', [
                'Tersedia',
                'Penuh',
                'Berlangsung',
                'Selesai',
                'Dibatalkan',
            ])->default('Tersedia');

            $table->text('catatan')->nullable();

            $table->timestamps();

            $table->unique(
                ['tanggal_latihan', 'time_slot_id', 'instructor_id'],
                'unique_instructor_schedule'
            );

            $table->unique(
                ['tanggal_latihan', 'time_slot_id', 'vehicle_id'],
                'unique_vehicle_schedule'
            );

            $table->index('tanggal_latihan');
            $table->index('status');
            $table->index(['tanggal_latihan', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_schedules');
    }
};