<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('booking_payments', function (Blueprint $table) {
            if (! Schema::hasColumn('booking_payments', 'booking_group_id')) {
                $table->foreignId('booking_group_id')
                    ->nullable()
                    ->after('booking_id')
                    ->constrained('booking_groups')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('booking_payments', function (Blueprint $table) {
            if (Schema::hasColumn('booking_payments', 'booking_group_id')) {
                $table->dropConstrainedForeignId('booking_group_id');
            }
        });
    }
};
