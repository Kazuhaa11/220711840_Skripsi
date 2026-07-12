<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('booking_refunds')) {
            return;
        }

        Schema::create('booking_refunds', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_group_id')
                ->unique()
                ->constrained('booking_groups')
                ->cascadeOnDelete();

            $table->foreignId('booking_payment_id')
                ->nullable()
                ->constrained('booking_payments')
                ->nullOnDelete();

            $table->foreignId('requested_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('processed_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->decimal('nominal_refund', 12, 2)->default(0);
            $table->enum('tipe_refund', ['Penuh', 'Sebagian'])->default('Penuh');
            $table->enum('status_refund', ['Diajukan', 'Diproses', 'Ditolak', 'Selesai'])->default('Diajukan');

            $table->string('bank_tujuan', 100);
            $table->string('nomor_rekening', 50);
            $table->string('nama_penerima', 150);

            $table->text('alasan_refund')->nullable();
            $table->text('catatan_peserta')->nullable();
            $table->text('catatan_admin')->nullable();

            $table->timestamp('tanggal_pengajuan')->nullable();
            $table->timestamp('tanggal_diproses')->nullable();
            $table->timestamp('tanggal_refund')->nullable();

            $table->string('bukti_refund_path')->nullable();
            $table->string('bukti_refund_original_name')->nullable();
            $table->string('bukti_refund_mime', 100)->nullable();
            $table->unsignedBigInteger('bukti_refund_size')->nullable();

            $table->timestamps();

            $table->index('booking_payment_id');
            $table->index('requested_by');
            $table->index('processed_by');
            $table->index('status_refund');
            $table->index('tanggal_pengajuan');
            $table->index('tanggal_refund');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_refunds');
    }
};
