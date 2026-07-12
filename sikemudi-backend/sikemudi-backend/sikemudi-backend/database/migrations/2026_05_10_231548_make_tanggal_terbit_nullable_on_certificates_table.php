<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->date('tanggal_terbit')->nullable()->change();
        });

        DB::table('certificates')
            ->where('status', 'Draft')
            ->update([
                'tanggal_terbit' => null,
            ]);
    }

    public function down(): void
    {
        DB::table('certificates')
            ->whereNull('tanggal_terbit')
            ->update([
                'tanggal_terbit' => now()->toDateString(),
            ]);

        Schema::table('certificates', function (Blueprint $table) {
            $table->date('tanggal_terbit')->nullable(false)->change();
        });
    }
};