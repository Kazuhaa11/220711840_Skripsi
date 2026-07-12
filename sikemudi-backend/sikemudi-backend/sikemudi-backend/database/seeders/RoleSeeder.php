<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'nama_role' => 'Admin',
                'slug' => 'admin',
                'deskripsi' => 'Pengguna yang mengelola data master, jadwal latihan, booking, hasil latihan, sertifikat, dan laporan operasional.',
            ],
            [
                'nama_role' => 'Peserta',
                'slug' => 'peserta',
                'deskripsi' => 'Pengguna yang mengikuti kursus mengemudi, melakukan booking jadwal, melihat riwayat latihan, dan mengakses sertifikat digital.',
            ],
            [
                'nama_role' => 'Instruktur',
                'slug' => 'instruktur',
                'deskripsi' => 'Pengguna yang bertugas melatih peserta, melihat jadwal mengajar, dan mencatat hasil latihan peserta.',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['slug' => $role['slug']],
                $role
            );
        }
    }
}