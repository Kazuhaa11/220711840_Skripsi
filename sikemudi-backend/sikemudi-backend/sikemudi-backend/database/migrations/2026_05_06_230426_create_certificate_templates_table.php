<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->id();

            $table->string('nama_template', 150);
            $table->string('judul_sertifikat', 150);
            $table->string('subjudul', 200)->nullable();

            $table->text('kalimat_pembuka')->nullable();
            $table->text('kalimat_penutup')->nullable();

            $table->string('nama_penyelenggara', 150)->nullable();
            $table->string('nama_penandatangan', 150)->nullable();
            $table->string('jabatan_penandatangan', 150)->nullable();

            $table->longText('ttd_digital')->nullable();

            $table->enum('background_type', [
                'Warna',
                'Gambar',
            ])->default('Warna');

            $table->string('background_color', 30)->default('#ffffff');
            $table->longText('background_image')->nullable();
            $table->string('border_color', 30)->default('#1e3a8a');

            $table->boolean('is_default')->default(false);
            $table->enum('status', [
                'Aktif',
                'Nonaktif',
            ])->default('Aktif');

            $table->timestamps();

            $table->index('is_default');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_templates');
    }
};