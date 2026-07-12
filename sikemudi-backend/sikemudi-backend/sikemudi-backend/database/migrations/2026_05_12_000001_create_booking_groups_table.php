<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('booking_groups')) {
            return;
        }

        Schema::create('booking_groups', function (Blueprint $table) {
            $table->id();

            $table->string('kode_group', 40)->unique();

            $table->foreignId('participant_id')
                ->constrained('participants')
                ->cascadeOnDelete();

            $table->foreignId('course_package_id')
                ->nullable()
                ->constrained('course_packages')
                ->nullOnDelete();

            $table->foreignId('instructor_id')
                ->nullable()
                ->constrained('instructors')
                ->nullOnDelete();

            $table->foreignId('vehicle_id')
                ->nullable()
                ->constrained('vehicles')
                ->nullOnDelete();

            $table->unsignedSmallInteger('total_sesi')->default(1);
            $table->unsignedSmallInteger('jumlah_sesi_selesai')->default(0);

            $table->enum('status', [
                'Menunggu Pembayaran',
                'Menunggu Konfirmasi Pembayaran',
                'Dikonfirmasi',
                'Dijadwalkan Ulang',
                'Berlangsung',
                'Selesai',
                'Dibatalkan',
            ])->default('Menunggu Pembayaran');

            $table->boolean('pakai_antar_jemput')->default(false);
            $table->boolean('pakai_sim')->default(false);
            $table->text('alamat_jemput')->nullable();
            $table->decimal('harga_paket', 12, 2)->default(0);

            $table->timestamp('tanggal_booking')->nullable();
            $table->timestamp('tanggal_dikonfirmasi')->nullable();
            $table->timestamp('tanggal_dibatalkan')->nullable();

            $table->text('alasan_pembatalan')->nullable();
            $table->text('catatan')->nullable();

            $table->timestamps();

            $table->index('participant_id');
            $table->index('course_package_id');
            $table->index('instructor_id');
            $table->index('vehicle_id');
            $table->index('status');
            $table->index('tanggal_booking');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_groups');
    }
};
