<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->id();

            $table->string('nomor_sertifikat', 80)->unique();
            $table->string('kode_verifikasi', 120)->unique();

            $table->foreignId('hasil_latihan_id')
                ->unique()
                ->constrained('training_results')
                ->restrictOnDelete();

            $table->foreignId('peserta_id')
                ->constrained('participants')
                ->restrictOnDelete();

            $table->foreignId('paket_id')
                ->nullable()
                ->constrained('course_packages')
                ->nullOnDelete();

            $table->foreignId('template_id')
                ->nullable()
                ->constrained('certificate_templates')
                ->nullOnDelete();

            $table->date('tanggal_terbit');

            $table->enum('status', [
                'Draft',
                'Terbit',
                'Dicabut',
            ])->default('Terbit');

            $table->longText('qr_code')->nullable();
            $table->string('verification_url')->nullable();
            $table->string('pdf_url')->nullable();

            $table->text('catatan')->nullable();

            $table->foreignId('created_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('updated_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index('hasil_latihan_id');
            $table->index('peserta_id');
            $table->index('paket_id');
            $table->index('template_id');
            $table->index('status');
            $table->index('tanggal_terbit');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};