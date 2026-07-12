<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'role_id',
        'name',
        'email',
        'password',
        'no_telepon',
        'alamat',
        'status_akun',
        'foto_profil',
        'foto_profil_path',
        'foto_profil_original_name',
        'foto_profil_mime',
        'foto_profil_size',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login_at' => 'datetime',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function participant(): HasOne
    {
        return $this->hasOne(Participant::class);
    }

    public function instructor(): HasOne
    {
        return $this->hasOne(Instructor::class);
    }

    public function isAdmin(): bool
    {
        return $this->role?->slug === 'admin';
    }

    public function isParticipant(): bool
    {
        return $this->role?->slug === 'peserta';
    }

    public function isInstructor(): bool
    {
        return $this->role?->slug === 'instruktur';
    }

    public function verifiedBookingPayments(): HasMany
    {
        return $this->hasMany(BookingPayment::class, 'verified_by');
    }

    public function bookingHistories(): HasMany
    {
        return $this->hasMany(BookingHistory::class, 'changed_by');
    }

    public function createdTrainingResults(): HasMany
    {
        return $this->hasMany(TrainingResult::class, 'created_by');
    }

    public function updatedTrainingResults(): HasMany
    {
        return $this->hasMany(TrainingResult::class, 'updated_by');
    }

    public function createdCertificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'created_by');
    }

    public function updatedCertificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'updated_by');
    }
}
