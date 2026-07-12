<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    protected $fillable = [
        'nomor_sertifikat',
        'kode_verifikasi',
        'hasil_latihan_id',
        'peserta_id',
        'paket_id',
        'template_id',
        'tanggal_terbit',
        'status',
        'qr_code',
        'qr_code_path',
        'qr_code_mime',
        'qr_code_size',
        'verification_url',
        'pdf_url',
        'pdf_path',
        'pdf_original_name',
        'pdf_mime',
        'pdf_size',
        'catatan',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_terbit' => 'date',
        ];
    }

    public function trainingResult(): BelongsTo
    {
        return $this->belongsTo(TrainingResult::class, 'hasil_latihan_id');
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(Participant::class, 'peserta_id');
    }

    public function coursePackage(): BelongsTo
    {
        return $this->belongsTo(CoursePackage::class, 'paket_id');
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(CertificateTemplate::class, 'template_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function isPublished(): bool
    {
        return $this->status === 'Terbit';
    }
}
