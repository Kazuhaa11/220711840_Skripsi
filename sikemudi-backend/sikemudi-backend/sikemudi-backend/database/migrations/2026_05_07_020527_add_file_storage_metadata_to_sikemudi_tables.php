<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('booking_payments', function (Blueprint $table) {
            if (!Schema::hasColumn('booking_payments', 'bukti_bayar_path')) {
                $table->string('bukti_bayar_path')->nullable();
            }

            if (!Schema::hasColumn('booking_payments', 'bukti_bayar_original_name')) {
                $table->string('bukti_bayar_original_name')->nullable();
            }

            if (!Schema::hasColumn('booking_payments', 'bukti_bayar_mime')) {
                $table->string('bukti_bayar_mime', 100)->nullable();
            }

            if (!Schema::hasColumn('booking_payments', 'bukti_bayar_size')) {
                $table->unsignedBigInteger('bukti_bayar_size')->nullable();
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'foto_profil_path')) {
                $table->string('foto_profil_path')->nullable();
            }

            if (!Schema::hasColumn('users', 'foto_profil_original_name')) {
                $table->string('foto_profil_original_name')->nullable();
            }

            if (!Schema::hasColumn('users', 'foto_profil_mime')) {
                $table->string('foto_profil_mime', 100)->nullable();
            }

            if (!Schema::hasColumn('users', 'foto_profil_size')) {
                $table->unsignedBigInteger('foto_profil_size')->nullable();
            }
        });

        Schema::table('certificates', function (Blueprint $table) {
            if (!Schema::hasColumn('certificates', 'qr_code_path')) {
                $table->string('qr_code_path')->nullable();
            }

            if (!Schema::hasColumn('certificates', 'qr_code_mime')) {
                $table->string('qr_code_mime', 100)->nullable();
            }

            if (!Schema::hasColumn('certificates', 'qr_code_size')) {
                $table->unsignedBigInteger('qr_code_size')->nullable();
            }

            if (!Schema::hasColumn('certificates', 'pdf_path')) {
                $table->string('pdf_path')->nullable();
            }

            if (!Schema::hasColumn('certificates', 'pdf_original_name')) {
                $table->string('pdf_original_name')->nullable();
            }

            if (!Schema::hasColumn('certificates', 'pdf_mime')) {
                $table->string('pdf_mime', 100)->nullable();
            }

            if (!Schema::hasColumn('certificates', 'pdf_size')) {
                $table->unsignedBigInteger('pdf_size')->nullable();
            }
        });

        Schema::table('certificate_templates', function (Blueprint $table) {
            if (!Schema::hasColumn('certificate_templates', 'ttd_digital_path')) {
                $table->string('ttd_digital_path')->nullable();
            }

            if (!Schema::hasColumn('certificate_templates', 'ttd_digital_original_name')) {
                $table->string('ttd_digital_original_name')->nullable();
            }

            if (!Schema::hasColumn('certificate_templates', 'ttd_digital_mime')) {
                $table->string('ttd_digital_mime', 100)->nullable();
            }

            if (!Schema::hasColumn('certificate_templates', 'ttd_digital_size')) {
                $table->unsignedBigInteger('ttd_digital_size')->nullable();
            }

            if (!Schema::hasColumn('certificate_templates', 'background_image_path')) {
                $table->string('background_image_path')->nullable();
            }

            if (!Schema::hasColumn('certificate_templates', 'background_image_original_name')) {
                $table->string('background_image_original_name')->nullable();
            }

            if (!Schema::hasColumn('certificate_templates', 'background_image_mime')) {
                $table->string('background_image_mime', 100)->nullable();
            }

            if (!Schema::hasColumn('certificate_templates', 'background_image_size')) {
                $table->unsignedBigInteger('background_image_size')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('booking_payments', function (Blueprint $table) {
            $columns = [
                'bukti_bayar_path',
                'bukti_bayar_original_name',
                'bukti_bayar_mime',
                'bukti_bayar_size',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('booking_payments', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('users', function (Blueprint $table) {
            $columns = [
                'foto_profil_path',
                'foto_profil_original_name',
                'foto_profil_mime',
                'foto_profil_size',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('certificates', function (Blueprint $table) {
            $columns = [
                'qr_code_path',
                'qr_code_mime',
                'qr_code_size',
                'pdf_path',
                'pdf_original_name',
                'pdf_mime',
                'pdf_size',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('certificates', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('certificate_templates', function (Blueprint $table) {
            $columns = [
                'ttd_digital_path',
                'ttd_digital_original_name',
                'ttd_digital_mime',
                'ttd_digital_size',
                'background_image_path',
                'background_image_original_name',
                'background_image_mime',
                'background_image_size',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('certificate_templates', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};