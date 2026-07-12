<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingRefund extends Model
{
    protected $fillable = [
        'booking_group_id',
        'booking_payment_id',
        'requested_by',
        'processed_by',
        'nominal_refund',
        'tipe_refund',
        'status_refund',
        'bank_tujuan',
        'nomor_rekening',
        'nama_penerima',
        'alasan_refund',
        'catatan_peserta',
        'catatan_admin',
        'tanggal_pengajuan',
        'tanggal_diproses',
        'tanggal_refund',
        'bukti_refund_path',
        'bukti_refund_original_name',
        'bukti_refund_mime',
        'bukti_refund_size',
    ];

    protected function casts(): array
    {
        return [
            'nominal_refund' => 'decimal:2',
            'tanggal_pengajuan' => 'datetime',
            'tanggal_diproses' => 'datetime',
            'tanggal_refund' => 'datetime',
            'bukti_refund_size' => 'integer',
        ];
    }

    public function bookingGroup(): BelongsTo
    {
        return $this->belongsTo(BookingGroup::class);
    }

    public function bookingPayment(): BelongsTo
    {
        return $this->belongsTo(BookingPayment::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function processor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function isFinished(): bool
    {
        return $this->status_refund === 'Selesai';
    }
}
