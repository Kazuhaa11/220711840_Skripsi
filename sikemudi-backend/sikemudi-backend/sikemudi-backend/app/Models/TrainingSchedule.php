<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingSchedule extends Model
{
    protected $fillable = [
        'kode_jadwal',
        'tanggal_latihan',
        'time_slot_id',
        'instructor_id',
        'vehicle_id',
        'course_package_id',
        'kapasitas',
        'jumlah_booking',
        'status',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_latihan' => 'date',
            'kapasitas' => 'integer',
            'jumlah_booking' => 'integer',
        ];
    }

    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class, 'time_slot_id');
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function coursePackage(): BelongsTo
    {
        return $this->belongsTo(CoursePackage::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function activeBookings(): HasMany
    {
        return $this->hasMany(Booking::class)
            ->whereNotIn('status', ['Dibatalkan']);
    }

    public function isFull(): bool
    {
        return $this->jumlah_booking >= $this->kapasitas;
    }

    public function isAvailable(): bool
    {
        return $this->status === 'Tersedia' && !$this->isFull();
    }

    public function trainingResults(): HasMany
    {
        return $this->hasMany(TrainingResult::class);
    }
}