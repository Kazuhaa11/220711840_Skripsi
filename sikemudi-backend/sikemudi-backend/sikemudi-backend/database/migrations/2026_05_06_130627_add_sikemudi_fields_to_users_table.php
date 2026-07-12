<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('role_id')
                ->nullable()
                ->after('id')
                ->constrained('roles')
                ->nullOnDelete();

            $table->string('no_telepon', 30)->nullable()->after('email');
            $table->text('alamat')->nullable()->after('no_telepon');

            $table->enum('status_akun', [
                'Aktif',
                'Verifikasi',
                'Nonaktif',
            ])->default('Verifikasi')->after('alamat');

            $table->longText('foto_profil')->nullable()->after('status_akun');
            $table->timestamp('last_login_at')->nullable()->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('role_id');

            $table->dropColumn([
                'no_telepon',
                'alamat',
                'status_akun',
                'foto_profil',
                'last_login_at',
            ]);
        });
    }
};