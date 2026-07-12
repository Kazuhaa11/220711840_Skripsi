<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('booking_payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->unique()
                ->constrained('bookings')
                ->cascadeOnDelete();

            $table->decimal('nominal_bayar', 12, 2)->default(0);

            $table->longText('bukti_bayar')->nullable();

            $table->string('nama_pengirim', 150)->nullable();
            $table->string('bank_pengirim', 100)->nullable();

            $table->timestamp('tanggal_upload')->nullable();
            $table->timestamp('tanggal_verifikasi')->nullable();

            $table->enum('status', [
                'Belum Upload',
                'Menunggu Konfirmasi',
                'Terkonfirmasi',
                'Ditolak',
            ])->default('Belum Upload');

            $table->text('catatan_peserta')->nullable();
            $table->text('catatan_admin')->nullable();
            $table->text('alasan_penolakan')->nullable();

            $table->foreignId('verified_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index('booking_id');
            $table->index('status');
            $table->index('verified_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_payments');
    }
};