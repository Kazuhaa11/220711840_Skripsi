<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    protected $fillable = [
        'kode_kendaraan',
        'nama_kendaraan',
        'model',
        'nomor_plat',
        'transmisi',
        'status',
        'ketersediaan',
        'digunakan_hari_ini',
        'kilometer_servis_terakhir',
        'status_asuransi',
        'status_stnk',
        'catatan',
        'foto_kendaraan',
    ];

    protected function casts(): array
    {
        return [
            'digunakan_hari_ini' => 'integer',
            'kilometer_servis_terakhir' => 'integer',
        ];
    }


    public function bookingGroups(): HasMany
    {
        return $this->hasMany(BookingGroup::class);
    }

    public function trainingSchedules(): HasMany
    {
        return $this->hasMany(TrainingSchedule::class);
    }
}