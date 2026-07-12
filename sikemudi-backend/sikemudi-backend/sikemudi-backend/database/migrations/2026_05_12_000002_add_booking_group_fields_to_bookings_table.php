<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('bookings', 'booking_group_id')) {
                $table->foreignId('booking_group_id')
                    ->nullable()
                    ->after('kode_booking')
                    ->constrained('booking_groups')
                    ->nullOnDelete();
            }

            if (! Schema::hasColumn('bookings', 'sesi_ke')) {
                $table->unsignedSmallInteger('sesi_ke')
                    ->nullable()
                    ->after('course_package_id');
            }

            if (! Schema::hasColumn('bookings', 'total_sesi')) {
                $table->unsignedSmallInteger('total_sesi')
                    ->nullable()
                    ->after('sesi_ke');
            }
        });

        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'booking_group_id') && Schema::hasColumn('bookings', 'sesi_ke')) {
                $table->unique(['booking_group_id', 'sesi_ke'], 'bookings_group_sesi_unique');
            }
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            if (Schema::hasColumn('bookings', 'booking_group_id')) {
                $table->dropUnique('bookings_group_sesi_unique');
                $table->dropConstrainedForeignId('booking_group_id');
            }

            if (Schema::hasColumn('bookings', 'sesi_ke')) {
                $table->dropColumn('sesi_ke');
            }

            if (Schema::hasColumn('bookings', 'total_sesi')) {
                $table->dropColumn('total_sesi');
            }
        });
    }
};
