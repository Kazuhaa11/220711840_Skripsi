<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TimeSlot extends Model
{
    protected $fillable = [
        'kode_slot',
        'nama_slot',
        'subtitle',
        'jam_mulai',
        'jam_selesai',
        'durasi_menit',
        'status',
        'hari_aktif',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'durasi_menit' => 'integer',
        ];
    }

    public function trainingSchedules(): HasMany
    {
        return $this->hasMany(TrainingSchedule::class);
    }

    public function instructorAssignments(): HasMany
    {
        return $this->hasMany(InstructorTimeSlotAssignment::class);
    }
}