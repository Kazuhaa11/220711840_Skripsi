<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('booking_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->foreignId('old_training_schedule_id')
                ->nullable()
                ->constrained('training_schedules')
                ->nullOnDelete();

            $table->foreignId('new_training_schedule_id')
                ->nullable()
                ->constrained('training_schedules')
                ->nullOnDelete();

            $table->enum('aksi', [
                'Dibuat',
                'Upload Bukti Bayar',
                'Pembayaran Dikonfirmasi',
                'Pembayaran Ditolak',
                'Diubah',
                'Dibatalkan',
                'Diselesaikan',
            ]);

            $table->string('status_sebelum', 80)->nullable();
            $table->string('status_sesudah', 80)->nullable();

            $table->text('catatan')->nullable();

            $table->foreignId('changed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index('booking_id');
            $table->index('aksi');
            $table->index('changed_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_histories');
    }
};