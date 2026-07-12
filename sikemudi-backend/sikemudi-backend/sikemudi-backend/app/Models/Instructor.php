<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Instructor extends Model
{
    protected $fillable = [
        'user_id',
        'kode_instruktur',
        'jabatan',
        'spesialisasi',
        'status',
        'status_jadwal',
        'tanggal_bergabung',
        'rating',
        'total_sesi',
        'tingkat_kelulusan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_bergabung' => 'date',
            'rating' => 'decimal:2',
            'total_sesi' => 'integer',
            'tingkat_kelulusan' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function trainingSchedules(): HasMany
    {
        return $this->hasMany(TrainingSchedule::class);
    }

    public function timeSlotAssignments(): HasMany
    {
        return $this->hasMany(InstructorTimeSlotAssignment::class);
    }


    public function bookingGroups(): HasMany
    {
        return $this->hasMany(BookingGroup::class);
    }

    public function trainingResults(): HasMany
    {
        return $this->hasMany(TrainingResult::class);
    }
}
