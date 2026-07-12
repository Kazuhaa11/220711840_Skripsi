<?php

namespace Database\Seeders;

use App\Models\CoursePackage;
use Illuminate\Database\Seeder;

class CoursePackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'kode_paket' => 'PKT-006',
                'nama_paket' => 'Paket 6 Jam',
                'durasi_jam' => 6,
                'deskripsi' => 'Paket kursus mengemudi selama 6 jam latihan.',
                'harga_antar_jemput' => 990000,
                'harga_tidak_antar_jemput' => 810000,
                'harga_dengan_sim_antar_jemput' => 1990000,
                'harga_dengan_sim_tidak_antar_jemput' => 1810000,
            ],
            [
                'kode_paket' => 'PKT-010',
                'nama_paket' => 'Paket 10 Jam',
                'durasi_jam' => 10,
                'deskripsi' => 'Paket kursus mengemudi selama 10 jam latihan.',
                'harga_antar_jemput' => 1650000,
                'harga_tidak_antar_jemput' => 1350000,
                'harga_dengan_sim_antar_jemput' => 2650000,
                'harga_dengan_sim_tidak_antar_jemput' => 2350000,
            ],
            [
                'kode_paket' => 'PKT-013',
                'nama_paket' => 'Paket 13 Jam',
                'durasi_jam' => 13,
                'deskripsi' => 'Paket kursus mengemudi selama 13 jam latihan.',
                'harga_antar_jemput' => 2145000,
                'harga_tidak_antar_jemput' => 1755000,
                'harga_dengan_sim_antar_jemput' => 3145000,
                'harga_dengan_sim_tidak_antar_jemput' => 2755000,
            ],
            [
                'kode_paket' => 'PKT-015',
                'nama_paket' => 'Paket 15 Jam',
                'durasi_jam' => 15,
                'deskripsi' => 'Paket kursus mengemudi selama 15 jam latihan.',
                'harga_antar_jemput' => 2365000,
                'harga_tidak_antar_jemput' => 1950000,
                'harga_dengan_sim_antar_jemput' => 3365000,
                'harga_dengan_sim_tidak_antar_jemput' => 2950000,
            ],
            [
                'kode_paket' => 'PKT-018',
                'nama_paket' => 'Paket 18 Jam',
                'durasi_jam' => 18,
                'deskripsi' => 'Paket kursus mengemudi selama 18 jam latihan.',
                'harga_antar_jemput' => 2835000,
                'harga_tidak_antar_jemput' => 2340000,
                'harga_dengan_sim_antar_jemput' => 3835000,
                'harga_dengan_sim_tidak_antar_jemput' => 3340000,
            ],
            [
                'kode_paket' => 'PKT-020',
                'nama_paket' => 'Paket 20 Jam',
                'durasi_jam' => 20,
                'deskripsi' => 'Paket kursus mengemudi selama 20 jam latihan.',
                'harga_antar_jemput' => 3150000,
                'harga_tidak_antar_jemput' => 2600000,
                'harga_dengan_sim_antar_jemput' => 4150000,
                'harga_dengan_sim_tidak_antar_jemput' => 3600000,
            ],
        ];

        foreach ($packages as $package) {
            CoursePackage::updateOrCreate(
                ['kode_paket' => $package['kode_paket']],
                [
                    ...$package,
                    'termasuk_sertifikat' => true,
                    'fasilitas' => [
                        'Sertifikat kursus mengemudi',
                        'Dilihat oleh trainer berpengalaman',
                        'Trainer bersertifikat',
                        'Jadwal latihan fleksibel',
                    ],
                    'status' => 'Aktif',
                ]
            );
        }
    }
}