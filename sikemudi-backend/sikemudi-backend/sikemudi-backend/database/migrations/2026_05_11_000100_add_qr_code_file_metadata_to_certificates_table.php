<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            if (!Schema::hasColumn('certificates', 'qr_code_path')) {
                $table->string('qr_code_path')->nullable()->after('qr_code');
            }

            if (!Schema::hasColumn('certificates', 'qr_code_mime')) {
                $table->string('qr_code_mime', 100)->nullable()->after('qr_code_path');
            }

            if (!Schema::hasColumn('certificates', 'qr_code_size')) {
                $table->unsignedBigInteger('qr_code_size')->nullable()->after('qr_code_mime');
            }
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            if (Schema::hasColumn('certificates', 'qr_code_size')) {
                $table->dropColumn('qr_code_size');
            }

            if (Schema::hasColumn('certificates', 'qr_code_mime')) {
                $table->dropColumn('qr_code_mime');
            }

            if (Schema::hasColumn('certificates', 'qr_code_path')) {
                $table->dropColumn('qr_code_path');
            }
        });
    }
};
