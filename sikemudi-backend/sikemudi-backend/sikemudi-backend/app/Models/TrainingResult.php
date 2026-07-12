<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class TrainingResult extends Model
{
    protected $fillable = [
        'booking_id',
        'participant_id',
        'training_schedule_id',
        'instructor_id',
        'tanggal_latihan',
        'status_kehadiran',
        'nilai_praktik',
        'nilai_sikap',
        'nilai_pemahaman',
        'nilai_akhir',
        'status_kelulusan',
        'catatan_instruktur',
        'catatan_admin',
        'validated_by',
        'validated_at',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_latihan' => 'date',
            'nilai_praktik' => 'decimal:2',
            'nilai_sikap' => 'decimal:2',
            'nilai_pemahaman' => 'decimal:2',
            'nilai_akhir' => 'decimal:2',
            'validated_at' => 'datetime',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function trainingSchedule(): BelongsTo
    {
        return $this->belongsTo(TrainingSchedule::class);
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function isPassed(): bool
    {
        return $this->status_kelulusan === 'Lulus';
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class, 'hasil_latihan_id');
    }
}