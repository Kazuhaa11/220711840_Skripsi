<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CertificateTemplate extends Model
{
    protected $fillable = [
        'nama_template',
        'judul_sertifikat',
        'subjudul',
        'recipient_label',
        'program_prefix',
        'kalimat_pembuka',
        'kalimat_penutup',
        'nama_penyelenggara',
        'institution_address',
        'nama_penandatangan',
        'jabatan_penandatangan',
        'ttd_digital',
        'ttd_digital_path',
        'ttd_digital_original_name',
        'ttd_digital_mime',
        'ttd_digital_size',
        'background_type',
        'background_color',
        'background_image',
        'background_image_path',
        'background_image_original_name',
        'background_image_mime',
        'background_image_size',
        'border_color',
        'accent_color',
        'is_default',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'is_default' => 'boolean',
        ];
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'template_id');
    }
}
