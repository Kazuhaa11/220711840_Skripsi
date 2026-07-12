<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('training_results', function (Blueprint $table) {
            if (! Schema::hasColumn('training_results', 'validated_by')) {
                $table->foreignId('validated_by')
                    ->nullable()
                    ->after('catatan_admin')
                    ->constrained('users')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('training_results', 'validated_at')) {
                $table->timestamp('validated_at')
                    ->nullable()
                    ->after('validated_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('training_results', function (Blueprint $table) {
            if (Schema::hasColumn('training_results', 'validated_by')) {
                $table->dropConstrainedForeignId('validated_by');
            }

            if (Schema::hasColumn('training_results', 'validated_at')) {
                $table->dropColumn('validated_at');
            }
        });
    }
};
