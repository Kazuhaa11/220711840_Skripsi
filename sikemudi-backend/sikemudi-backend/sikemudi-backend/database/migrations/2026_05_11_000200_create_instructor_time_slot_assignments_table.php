<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructor_time_slot_assignments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('instructor_id')
                ->constrained('instructors')
                ->cascadeOnDelete();

            $table->foreignId('time_slot_id')
                ->constrained('time_slots')
                ->cascadeOnDelete();

            $table->enum('day_of_week', [
                'Senin',
                'Selasa',
                'Rabu',
                'Kamis',
                'Jumat',
                'Sabtu',
                'Minggu',
            ]);

            $table->enum('status', ['Aktif', 'Nonaktif'])->default('Aktif');
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->unique(
                ['instructor_id', 'time_slot_id', 'day_of_week'],
                'unique_instructor_slot_day_assignment'
            );

            $table->index(['day_of_week', 'time_slot_id', 'status'], 'idx_assignment_day_slot_status');
            $table->index(['instructor_id', 'status'], 'idx_assignment_instructor_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_time_slot_assignments');
    }
};
