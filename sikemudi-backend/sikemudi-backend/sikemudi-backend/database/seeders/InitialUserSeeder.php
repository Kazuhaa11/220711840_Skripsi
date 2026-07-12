<?php

namespace Database\Seeders;

use App\Models\CoursePackage;
use App\Models\Instructor;
use App\Models\Participant;
use App\Models\Role;
use App\Models\User;
use App\Support\CourseProgressManager;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class InitialUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('slug', 'admin')->firstOrFail();
        $participantRole = Role::where('slug', 'peserta')->firstOrFail();
        $instructorRole = Role::where('slug', 'instruktur')->firstOrFail();

        $package = CoursePackage::where('kode_paket', 'PKT-010')->first()
            ?? CoursePackage::query()->first();

        $admin = User::updateOrCreate(
            ['email' => 'admin@sikemudi.test'],
            [
                'role_id' => $adminRole->id,
                'name' => 'Admin SIKEMUDI',
                'password' => Hash::make('password123'),
                'no_telepon' => '081234567890',
                'alamat' => 'LKP Yuzza Kutai Barat',
                'status_akun' => 'Aktif',
            ]
        );

        $participantUser = User::updateOrCreate(
            ['email' => 'peserta@sikemudi.test'],
            [
                'role_id' => $participantRole->id,
                'name' => 'Peserta Demo',
                'password' => Hash::make('password123'),
                'no_telepon' => '081234567891',
                'alamat' => 'Barong Tongkok, Kutai Barat',
                'status_akun' => 'Aktif',
            ]
        );

        Participant::updateOrCreate(
            ['user_id' => $participantUser->id],
            [
                'kode_peserta' => 'PST-0001',
                'paket_aktif_id' => $package?->id,
                'tanggal_lahir' => '2003-08-15',
                'gender' => 'Perempuan',
                'tanggal_bergabung' => now()->toDateString(),
                'jumlah_sesi_selesai' => 0,
                'jumlah_sesi_total' => $package ? CourseProgressManager::totalSessionsFor($package) : 5,
                'jumlah_absen' => 0,
                'rating_rata_rata' => 0,
                'status_sertifikat' => 'Belum Ada',
            ]
        );

        $instructorUser = User::updateOrCreate(
            ['email' => 'instruktur@sikemudi.test'],
            [
                'role_id' => $instructorRole->id,
                'name' => 'Instruktur Demo',
                'password' => Hash::make('password123'),
                'no_telepon' => '081234567892',
                'alamat' => 'Kutai Barat, Kalimantan Timur',
                'status_akun' => 'Aktif',
            ]
        );

        Instructor::updateOrCreate(
            ['user_id' => $instructorUser->id],
            [
                'kode_instruktur' => 'INS-0001',
                'jabatan' => 'Instruktur Mengemudi',
                'spesialisasi' => 'Manual dan Otomatis',
                'status' => 'Aktif',
                'status_jadwal' => 'Terjadwal',
                'tanggal_bergabung' => now()->toDateString(),
                'rating' => 4.80,
                'total_sesi' => 0,
                'tingkat_kelulusan' => 95,
            ]
        );

        $this->command->info('Akun demo berhasil dibuat:');
        $this->command->line('Admin      : admin@sikemudi.test / password123');
        $this->command->line('Peserta    : peserta@sikemudi.test / password123');
        $this->command->line('Instruktur : instruktur@sikemudi.test / password123');
    }
}