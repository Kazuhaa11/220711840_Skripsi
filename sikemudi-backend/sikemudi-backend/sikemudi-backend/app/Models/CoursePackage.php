<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CoursePackage extends Model
{
    protected $fillable = [
        'kode_paket',
        'nama_paket',
        'durasi_jam',
        'deskripsi',
        'harga_antar_jemput',
        'harga_tidak_antar_jemput',
        'harga_dengan_sim_antar_jemput',
        'harga_dengan_sim_tidak_antar_jemput',
        'termasuk_sertifikat',
        'fasilitas',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'durasi_jam' => 'integer',
            'harga_antar_jemput' => 'decimal:2',
            'harga_tidak_antar_jemput' => 'decimal:2',
            'harga_dengan_sim_antar_jemput' => 'decimal:2',
            'harga_dengan_sim_tidak_antar_jemput' => 'decimal:2',
            'termasuk_sertifikat' => 'boolean',
            'fasilitas' => 'array',
        ];
    }

    public function participants(): HasMany
    {
        return $this->hasMany(Participant::class, 'paket_aktif_id');
    }

    public function trainingSchedules(): HasMany
    {
        return $this->hasMany(TrainingSchedule::class);
    }


    public function bookingGroups(): HasMany
    {
        return $this->hasMany(BookingGroup::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'paket_id');
    }
}