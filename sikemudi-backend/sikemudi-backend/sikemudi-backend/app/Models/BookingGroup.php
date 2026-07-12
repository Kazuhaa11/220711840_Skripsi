<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class BookingGroup extends Model
{
    protected $fillable = [
        'kode_group',
        'participant_id',
        'course_package_id',
        'instructor_id',
        'vehicle_id',
        'total_sesi',
        'jumlah_sesi_selesai',
        'status',
        'pakai_antar_jemput',
        'pakai_sim',
        'alamat_jemput',
        'harga_paket',
        'tanggal_booking',
        'tanggal_dikonfirmasi',
        'tanggal_dibatalkan',
        'alasan_pembatalan',
        'catatan',
    ];

    protected function casts(): array
    {
        return [
            'total_sesi' => 'integer',
            'jumlah_sesi_selesai' => 'integer',
            'pakai_antar_jemput' => 'boolean',
            'pakai_sim' => 'boolean',
            'harga_paket' => 'decimal:2',
            'tanggal_booking' => 'datetime',
            'tanggal_dikonfirmasi' => 'datetime',
            'tanggal_dibatalkan' => 'datetime',
        ];
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class);
    }

    public function coursePackage(): BelongsTo
    {
        return $this->belongsTo(CoursePackage::class);
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class);
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(BookingPayment::class);
    }

    public function refund(): HasOne
    {
        return $this->hasOne(BookingRefund::class);
    }

    public function isFinished(): bool
    {
        return $this->total_sesi > 0 && $this->jumlah_sesi_selesai >= $this->total_sesi;
    }
}
