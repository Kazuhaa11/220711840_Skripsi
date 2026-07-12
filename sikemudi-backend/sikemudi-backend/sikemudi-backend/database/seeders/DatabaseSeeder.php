<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            CoursePackageSeeder::class,
            TimeSlotSeeder::class,
            VehicleSeeder::class,
            InitialUserSeeder::class,
            CertificateTemplateSeeder::class,
        ]);
    }
}