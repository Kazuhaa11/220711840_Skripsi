<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingHistory extends Model
{
    protected $fillable = [
        'booking_id',
        'old_training_schedule_id',
        'new_training_schedule_id',
        'aksi',
        'status_sebelum',
        'status_sesudah',
        'catatan',
        'changed_by',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function oldTrainingSchedule(): BelongsTo
    {
        return $this->belongsTo(TrainingSchedule::class, 'old_training_schedule_id');
    }

    public function newTrainingSchedule(): BelongsTo
    {
        return $this->belongsTo(TrainingSchedule::class, 'new_training_schedule_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}