<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('instructors', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->unique()
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('kode_instruktur', 40)->unique();

            $table->string('jabatan', 100)->nullable();
            $table->string('spesialisasi', 150)->nullable();

            $table->enum('status', [
                'Aktif',
                'Nonaktif',
                'Cuti',
            ])->default('Aktif');

            $table->enum('status_jadwal', [
                'Mengajar',
                'Terjadwal',
                'Libur / Cuti',
            ])->default('Terjadwal');

            $table->date('tanggal_bergabung')->nullable();

            $table->decimal('rating', 3, 2)->default(0);
            $table->unsignedInteger('total_sesi')->default(0);
            $table->unsignedTinyInteger('tingkat_kelulusan')->default(0);

            $table->timestamps();

            $table->index('kode_instruktur');
            $table->index('status');
            $table->index('status_jadwal');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructors');
    }
};