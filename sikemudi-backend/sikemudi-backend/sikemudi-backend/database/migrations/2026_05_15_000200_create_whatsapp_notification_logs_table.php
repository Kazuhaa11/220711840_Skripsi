<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('whatsapp_notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('notification_key', 191)->unique();
            $table->string('event_type', 80)->index();
            $table->nullableMorphs('notifiable');
            $table->string('target', 40)->nullable();
            $table->text('message')->nullable();
            $table->enum('status', ['Pending', 'Terkirim', 'Dilewati', 'Gagal'])->default('Pending')->index();
            $table->json('fonnte_response')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('whatsapp_notification_logs');
    }
};
