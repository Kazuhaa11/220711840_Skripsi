<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Participant extends Model
{
    protected $fillable = [
        'user_id',
        'kode_peserta',
        'paket_aktif_id',
        'tanggal_lahir',
        'gender',
        'tanggal_bergabung',
        'jumlah_sesi_selesai',
        'jumlah_sesi_total',
        'jumlah_absen',
        'rating_rata_rata',
        'status_sertifikat',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'tanggal_bergabung' => 'date',
            'jumlah_sesi_selesai' => 'integer',
            'jumlah_sesi_total' => 'integer',
            'jumlah_absen' => 'integer',
            'rating_rata_rata' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activePackage(): BelongsTo
    {
        return $this->belongsTo(CoursePackage::class, 'paket_aktif_id');
    }

    public function bookingGroups(): HasMany
    {
        return $this->hasMany(BookingGroup::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function trainingResults(): HasMany
    {
        return $this->hasMany(TrainingResult::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'peserta_id');
    }
}