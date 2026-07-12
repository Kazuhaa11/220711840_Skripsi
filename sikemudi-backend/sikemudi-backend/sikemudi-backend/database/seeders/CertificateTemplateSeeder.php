<?php

namespace Database\Seeders;

use App\Models\CertificateTemplate;
use Illuminate\Database\Seeder;

class CertificateTemplateSeeder extends Seeder
{
    public function run(): void
    {
        CertificateTemplate::updateOrCreate(
            ['nama_template' => 'Template Default SIKEMUDI'],
            [
                'judul_sertifikat' => 'SERTIFIKAT KURSUS MENGEMUDI',
                'subjudul' => 'Diberikan sebagai bukti penyelesaian pelatihan mengemudi',
                'recipient_label' => 'Diberikan kepada',
                'program_prefix' => 'Atas kelulusannya dalam program',
                'kalimat_pembuka' => 'Dengan ini menyatakan bahwa peserta berikut telah menyelesaikan program kursus mengemudi dan dinyatakan lulus berdasarkan hasil pelatihan.',
                'kalimat_penutup' => 'Sertifikat ini diterbitkan sebagai dokumen pendukung internal lembaga kursus mengemudi.',
                'nama_penyelenggara' => 'LKP Yuzza Kutai Barat',
                'institution_address' => 'Kutai Barat, Kalimantan Timur',
                'nama_penandatangan' => 'Pimpinan LKP Yuzza',
                'jabatan_penandatangan' => 'Pimpinan Lembaga',
                'ttd_digital' => null,
                'background_type' => 'Warna',
                'background_color' => '#ffffff',
                'background_image' => null,
                'border_color' => '#1e3a8a',
                'accent_color' => '#2563eb',
                'is_default' => true,
                'status' => 'Aktif',
            ]
        );
    }
}
