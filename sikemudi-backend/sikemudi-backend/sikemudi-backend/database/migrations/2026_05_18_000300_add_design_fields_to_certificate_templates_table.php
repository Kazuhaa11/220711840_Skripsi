<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificate_templates', function (Blueprint $table) {
            if (! Schema::hasColumn('certificate_templates', 'recipient_label')) {
                $table->string('recipient_label', 120)->nullable()->after('subjudul');
            }

            if (! Schema::hasColumn('certificate_templates', 'program_prefix')) {
                $table->string('program_prefix', 200)->nullable()->after('recipient_label');
            }

            if (! Schema::hasColumn('certificate_templates', 'institution_address')) {
                $table->string('institution_address')->nullable()->after('nama_penyelenggara');
            }

            if (! Schema::hasColumn('certificate_templates', 'accent_color')) {
                $table->string('accent_color', 30)->default('#2563eb')->after('border_color');
            }
        });
    }

    public function down(): void
    {
        Schema::table('certificate_templates', function (Blueprint $table) {
            foreach (['accent_color', 'institution_address', 'program_prefix', 'recipient_label'] as $column) {
                if (Schema::hasColumn('certificate_templates', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
