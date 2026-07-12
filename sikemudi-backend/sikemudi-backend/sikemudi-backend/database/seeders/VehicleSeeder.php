<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = [
            [
                'kode_kendaraan' => 'KDR-001',
                'nama_kendaraan' => 'Toyota Avanza',
                'model' => 'Avanza 1.3 Manual',
                'nomor_plat' => 'KT 1001 RJM',
                'transmisi' => 'Manual',
                'status' => 'Aktif',
                'ketersediaan' => 'Tersedia',
                'digunakan_hari_ini' => 0,
                'kilometer_servis_terakhir' => 15000,
                'status_asuransi' => 'Aktif',
                'status_stnk' => 'Aktif',
                'catatan' => 'Kendaraan latihan utama untuk transmisi manual.',
            ],
            [
                'kode_kendaraan' => 'KDR-002',
                'nama_kendaraan' => 'Daihatsu Xenia',
                'model' => 'Xenia Manual',
                'nomor_plat' => 'KT 1002 RJM',
                'transmisi' => 'Manual',
                'status' => 'Aktif',
                'ketersediaan' => 'Tersedia',
                'digunakan_hari_ini' => 0,
                'kilometer_servis_terakhir' => 12000,
                'status_asuransi' => 'Aktif',
                'status_stnk' => 'Aktif',
                'catatan' => 'Kendaraan latihan cadangan untuk transmisi manual.',
            ],
            [
                'kode_kendaraan' => 'KDR-003',
                'nama_kendaraan' => 'Honda Brio',
                'model' => 'Brio CVT',
                'nomor_plat' => 'KT 1003 RJM',
                'transmisi' => 'Otomatis',
                'status' => 'Aktif',
                'ketersediaan' => 'Tersedia',
                'digunakan_hari_ini' => 0,
                'kilometer_servis_terakhir' => 9000,
                'status_asuransi' => 'Aktif',
                'status_stnk' => 'Aktif',
                'catatan' => 'Kendaraan latihan untuk transmisi otomatis.',
            ],
        ];

        foreach ($vehicles as $vehicle) {
            Vehicle::updateOrCreate(
                ['kode_kendaraan' => $vehicle['kode_kendaraan']],
                $vehicle
            );
        }
    }
}