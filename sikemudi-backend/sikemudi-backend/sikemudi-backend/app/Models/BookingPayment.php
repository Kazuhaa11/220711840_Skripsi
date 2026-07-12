<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookingPayment extends Model
{
    protected $fillable = [
        'booking_id',
        'booking_group_id',
        'nominal_bayar',
        'metode_pembayaran',
        'bukti_bayar',
        'bukti_bayar_path',
        'bukti_bayar_original_name',
        'bukti_bayar_mime',
        'bukti_bayar_size',
        'nama_pengirim',
        'bank_pengirim',
        'tanggal_upload',
        'tanggal_verifikasi',
        'status',
        'catatan_peserta',
        'catatan_admin',
        'alasan_penolakan',
        'verified_by',
    ];

    public const METODE_TRANSFER = 'Transfer';
    public const METODE_CASH = 'Cash';

    protected function casts(): array
    {
        return [
            'nominal_bayar' => 'decimal:2',
            'tanggal_upload' => 'datetime',
            'tanggal_verifikasi' => 'datetime',
        ];
    }


    public function bookingGroup(): BelongsTo
    {
        return $this->belongsTo(BookingGroup::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(BookingRefund::class);
    }

    public function isTransfer(): bool
    {
        return ($this->metode_pembayaran ?: self::METODE_TRANSFER) === self::METODE_TRANSFER;
    }

    public function isCash(): bool
    {
        return $this->metode_pembayaran === self::METODE_CASH;
    }

    public function paymentMethodLabel(): string
    {
        return $this->isCash() ? 'Cash' : 'Transfer Bank';
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'Terkonfirmasi';
    }

    public function isWaitingConfirmation(): bool
    {
        return $this->status === 'Menunggu Konfirmasi';
    }

    public function isRejected(): bool
    {
        return $this->status === 'Ditolak';
    }
}
