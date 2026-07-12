<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class WhatsAppNotificationLog extends Model
{
    protected $table = 'whatsapp_notification_logs';
    protected $fillable = [
        'notification_key',
        'event_type',
        'notifiable_type',
        'notifiable_id',
        'target',
        'message',
        'status',
        'fonnte_response',
        'error_message',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'fonnte_response' => 'array',
            'sent_at' => 'datetime',
        ];
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }
}
