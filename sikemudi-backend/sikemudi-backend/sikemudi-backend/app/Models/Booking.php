<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;


class Booking extends Model
{
    protected $fillable = [
        'kode_booking',
        'booking_group_id',
        'participant_id',
        'training_schedule_id',
        'course_package_id',
        'sesi_ke',
        'total_sesi',
        'pakai_antar_jemput',
        'pakai_sim',
        'alamat_jemput',
        'harga_paket',
        'status',
        'tanggal_booking',
        'tanggal_dikonfirmasi',
        'tanggal_dibatalkan',
        'alasan_pembatalan',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'pakai_antar_jemput' => 'boolean',
            'pakai_sim' => 'boolean',
            'harga_paket' => 'decimal:2',
            'sesi_ke' => 'integer',
            'total_sesi' => 'integer',
            'tanggal_booking' => 'datetime',
            'tanggal_dikonfirmasi' => 'datetime',
            'tanggal_dibatalkan' => 'datetime',
        ];
    }


    public function bookingGroup(): BelongsTo
    {
        return $this->belongsTo(BookingGroup::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function trainingSchedule(): BelongsTo
    {
        return $this->belongsTo(TrainingSchedule::class);
    }

    public function coursePackage(): BelongsTo
    {
        return $this->belongsTo(CoursePackage::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(BookingPayment::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(BookingHistory::class);
    }

    public function isPaymentConfirmed(): bool
    {
        if ($this->payment?->status === 'Terkonfirmasi') {
            return true;
        }

        if ($this->bookingGroup?->payment?->status === 'Terkonfirmasi') {
            return true;
        }

        return false;
    }

    public function isValidBooking(): bool
    {
        return $this->status === 'Dikonfirmasi' && $this->isPaymentConfirmed();
    }

    public function trainingResult(): HasOne
    {
        return $this->hasOne(TrainingResult::class);
    }
}