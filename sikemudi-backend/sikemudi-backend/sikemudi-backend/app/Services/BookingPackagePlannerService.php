<?php

namespace App\Services;

use App\Models\CoursePackage;
use App\Models\Instructor;
use App\Models\TimeSlot;
use App\Models\TrainingSchedule;
use App\Models\Vehicle;
use App\Support\BookingCapacityManager;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BookingPackagePlannerService
{
    private const MAX_SEARCH_WEEKS = 8;
    private const ACTIVE_DAYS = [
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
        'Sabtu',
        'Minggu',
    ];

    private const ACTIVE_WEEKDAYS = [
        'Senin',
        'Selasa',
        'Rabu',
        'Kamis',
        'Jumat',
    ];

    private const ACTIVE_WEEKEND = [
        'Sabtu',
        'Minggu',
    ];

    /**
     * Membuat preview jadwal paket tanpa menyimpan data apa pun.
     *
     * Rule final Patch 2:
     * - Peserta memilih paket, tanggal mulai, dan slot awal.
     * - Sistem memilih 1 instruktur dan 1 kendaraan yang dapat dipakai untuk seluruh sesi.
     * - Instruktur dan kendaraan wajib sama untuk semua sesi dalam satu paket.
     * - Tanggal dan slot boleh disesuaikan otomatis jika sesi lanjutan bentrok.
     * - training_schedules belum dibuat pada patch ini; patch ini hanya preview.
     */
    public function preview(array $attributes): array
    {
        /** @var CoursePackage|null $package */
        $package = CoursePackage::query()
            ->where('status', 'Aktif')
            ->find($attributes['course_package_id']);

        if (!$package) {
            return $this->error('Paket kursus tidak ditemukan atau sedang tidak aktif.', 422);
        }

        /** @var TimeSlot|null $initialSlot */
        $initialSlot = TimeSlot::query()
            ->where('status', 'Aktif')
            ->find($attributes['time_slot_id']);

        if (!$initialSlot) {
            return $this->error('Slot waktu tidak ditemukan atau sedang tidak aktif.', 422);
        }

        $startDate = Carbon::parse($attributes['tanggal_mulai'])->startOfDay();

        if ($startDate->lt(now()->startOfDay())) {
            return $this->error('Tanggal mulai latihan tidak boleh lebih kecil dari hari ini.', 422);
        }

        if (!$this->isSlotActiveOnDate($initialSlot, $startDate)) {
            return $this->error('Slot waktu tidak aktif pada tanggal mulai yang dipilih.', 422);
        }

        $totalSessions = $this->calculateTotalSessions($package, $initialSlot);
        $instructors = $this->candidateInstructors($initialSlot, $startDate);
        $vehicles = $this->candidateVehicles($attributes['transmisi'] ?? null);

        if ($instructors->isEmpty()) {
            return $this->error('Belum ada instruktur aktif yang tersedia untuk slot awal yang dipilih.', 422);
        }

        if ($vehicles->isEmpty()) {
            return $this->error('Belum ada kendaraan aktif yang tersedia untuk jadwal latihan.', 422);
        }

        $lastFailureMessage = 'Jadwal paket belum tersedia untuk kombinasi tanggal dan slot yang dipilih.';

        foreach ($instructors as $instructor) {
            foreach ($vehicles as $vehicle) {
                $plan = $this->buildPlanForResourcePair(
                    package: $package,
                    initialSlot: $initialSlot,
                    startDate: $startDate,
                    totalSessions: $totalSessions,
                    instructor: $instructor,
                    vehicle: $vehicle,
                );

                if ($plan['available']) {
                    return [
                        'success' => true,
                        'message' => 'Preview jadwal paket berhasil dibuat.',
                        'data' => [
                            'course_package' => $this->formatPackage($package),
                            'total_sesi' => $totalSessions,
                            'durasi_sesi_menit' => (int) $initialSlot->durasi_menit,
                            'harga_paket' => $this->resolvePackagePrice(
                                $package,
                                (bool) ($attributes['pakai_antar_jemput'] ?? false),
                                (bool) ($attributes['pakai_sim'] ?? false),
                            ),
                            'pakai_antar_jemput' => (bool) ($attributes['pakai_antar_jemput'] ?? false),
                            'pakai_sim' => (bool) ($attributes['pakai_sim'] ?? false),
                            'instructor' => $this->formatInstructor($instructor),
                            'vehicle' => $this->formatVehicle($vehicle),
                            'sessions' => $plan['sessions'],
                        ],
                    ];
                }

                $lastFailureMessage = $plan['message'] ?? $lastFailureMessage;
            }
        }

        return $this->error(
            $lastFailureMessage . ' Silakan pilih tanggal mulai atau slot waktu lain.',
            409,
        );
    }


    /**
     * Mengecek satu kandidat sesi dengan resource yang sudah ditetapkan.
     * Dipakai untuk ubah jadwal per sesi dan preview perubahan sesi sebelum booking dikonfirmasi.
     */
    public function previewFixedResourceSession(array $attributes): array
    {
        /** @var CoursePackage|null $package */
        $package = CoursePackage::query()
            ->where('status', 'Aktif')
            ->find($attributes['course_package_id'] ?? null);

        if (!$package) {
            return $this->error('Paket kursus tidak ditemukan atau sedang tidak aktif.', 422);
        }

        /** @var TimeSlot|null $slot */
        $slot = TimeSlot::query()
            ->where('status', 'Aktif')
            ->find($attributes['time_slot_id'] ?? null);

        if (!$slot) {
            return $this->error('Slot waktu tidak ditemukan atau sedang tidak aktif.', 422);
        }

        /** @var Instructor|null $instructor */
        $instructor = Instructor::query()
            ->with('user')
            ->where('status', 'Aktif')
            ->find($attributes['instructor_id'] ?? null);

        if (!$instructor) {
            return $this->error('Instruktur tidak ditemukan atau sedang tidak aktif.', 422);
        }

        /** @var Vehicle|null $vehicle */
        $vehicle = Vehicle::query()
            ->where('status', 'Aktif')
            ->find($attributes['vehicle_id'] ?? null);

        if (!$vehicle) {
            return $this->error('Kendaraan tidak ditemukan atau sedang tidak aktif.', 422);
        }

        $date = Carbon::parse($attributes['tanggal_latihan'])->startOfDay();
        $sessionNumber = max(1, (int) ($attributes['sesi_ke'] ?? 1));
        $totalSessions = max($sessionNumber, (int) ($attributes['total_sesi'] ?? $sessionNumber));
        $targetDate = !empty($attributes['target_tanggal_latihan'])
            ? Carbon::parse($attributes['target_tanggal_latihan'])->startOfDay()
            : $date->copy();

        /** @var TimeSlot $targetSlot */
        $targetSlot = !empty($attributes['target_time_slot_id'])
            ? TimeSlot::query()->find($attributes['target_time_slot_id']) ?? $slot
            : $slot;

        $candidate = $this->resolveCandidateSession(
            package: $package,
            date: $date,
            slot: $slot,
            instructor: $instructor,
            vehicle: $vehicle,
            sessionNumber: $sessionNumber,
            totalSessions: $totalSessions,
            targetDate: $targetDate,
            targetSlot: $targetSlot,
            isFirstSession: false,
        );

        if (!$candidate['available']) {
            return $this->error(
                $candidate['message'] ?? 'Jadwal sesi tidak tersedia untuk instruktur dan kendaraan paket ini.',
                422,
            );
        }

        return [
            'success' => true,
            'message' => 'Jadwal sesi tersedia.',
            'data' => $candidate['session'],
        ];
    }

    private function buildPlanForResourcePair(
        CoursePackage $package,
        TimeSlot $initialSlot,
        Carbon $startDate,
        int $totalSessions,
        Instructor $instructor,
        Vehicle $vehicle,
    ): array {
        $sessions = [];
        $lastPlannedDate = $startDate->copy();
        $failureMessage = null;

        for ($sessionNumber = 1; $sessionNumber <= $totalSessions; $sessionNumber++) {
            if ($sessionNumber === 1) {
                $candidate = $this->resolveCandidateSession(
                    package: $package,
                    date: $startDate,
                    slot: $initialSlot,
                    instructor: $instructor,
                    vehicle: $vehicle,
                    sessionNumber: $sessionNumber,
                    totalSessions: $totalSessions,
                    targetDate: $startDate,
                    targetSlot: $initialSlot,
                    isFirstSession: true,
                );
            } else {
                $targetDate = $lastPlannedDate->copy()->addWeek()->startOfDay();
                $candidate = $this->findNextAvailableSession(
                    package: $package,
                    targetDate: $targetDate,
                    preferredSlot: $initialSlot,
                    instructor: $instructor,
                    vehicle: $vehicle,
                    sessionNumber: $sessionNumber,
                    totalSessions: $totalSessions,
                );
            }

            if (!$candidate['available']) {
                $failureMessage = $candidate['message'] ?? "Jadwal untuk sesi ke-{$sessionNumber} tidak tersedia.";

                return [
                    'available' => false,
                    'message' => $failureMessage,
                    'sessions' => [],
                ];
            }

            $sessions[] = $candidate['session'];
            $lastPlannedDate = Carbon::parse($candidate['session']['tanggal_latihan'])->startOfDay();
        }

        return [
            'available' => true,
            'message' => null,
            'sessions' => $sessions,
        ];
    }

    private function findNextAvailableSession(
        CoursePackage $package,
        Carbon $targetDate,
        TimeSlot $preferredSlot,
        Instructor $instructor,
        Vehicle $vehicle,
        int $sessionNumber,
        int $totalSessions,
    ): array {
        $activeSlots = TimeSlot::query()
            ->where('status', 'Aktif')
            ->orderByRaw('CASE WHEN id = ? THEN 0 ELSE 1 END', [$preferredSlot->id])
            ->orderBy('jam_mulai')
            ->get();

        $lastMessage = "Jadwal untuk sesi ke-{$sessionNumber} tidak tersedia.";

        for ($weekOffset = 0; $weekOffset <= self::MAX_SEARCH_WEEKS; $weekOffset++) {
            $weekBaseDate = $targetDate->copy()->addWeeks($weekOffset)->startOfDay();

            $sameDayCandidate = $this->tryDateSlots(
                package: $package,
                date: $weekBaseDate,
                slots: $activeSlots,
                preferredSlot: $preferredSlot,
                instructor: $instructor,
                vehicle: $vehicle,
                sessionNumber: $sessionNumber,
                totalSessions: $totalSessions,
                targetDate: $targetDate,
            );

            if ($sameDayCandidate['available']) {
                return $sameDayCandidate;
            }

            $lastMessage = $sameDayCandidate['message'] ?? $lastMessage;

            for ($dayOffset = 1; $dayOffset <= 6; $dayOffset++) {
                $candidateDate = $weekBaseDate->copy()->addDays($dayOffset)->startOfDay();

                $nearDayCandidate = $this->tryDateSlots(
                    package: $package,
                    date: $candidateDate,
                    slots: $activeSlots,
                    preferredSlot: $preferredSlot,
                    instructor: $instructor,
                    vehicle: $vehicle,
                    sessionNumber: $sessionNumber,
                    totalSessions: $totalSessions,
                    targetDate: $targetDate,
                );

                if ($nearDayCandidate['available']) {
                    return $nearDayCandidate;
                }

                $lastMessage = $nearDayCandidate['message'] ?? $lastMessage;
            }
        }

        return [
            'available' => false,
            'message' => $lastMessage,
        ];
    }

    private function tryDateSlots(
        CoursePackage $package,
        Carbon $date,
        Collection $slots,
        TimeSlot $preferredSlot,
        Instructor $instructor,
        Vehicle $vehicle,
        int $sessionNumber,
        int $totalSessions,
        Carbon $targetDate,
    ): array {
        $lastMessage = null;

        foreach ($slots as $slot) {
            $candidate = $this->resolveCandidateSession(
                package: $package,
                date: $date,
                slot: $slot,
                instructor: $instructor,
                vehicle: $vehicle,
                sessionNumber: $sessionNumber,
                totalSessions: $totalSessions,
                targetDate: $targetDate,
                targetSlot: $preferredSlot,
                isFirstSession: false,
            );

            if ($candidate['available']) {
                return $candidate;
            }

            $lastMessage = $candidate['message'] ?? $lastMessage;
        }

        return [
            'available' => false,
            'message' => $lastMessage,
        ];
    }

    private function resolveCandidateSession(
        CoursePackage $package,
        Carbon $date,
        TimeSlot $slot,
        Instructor $instructor,
        Vehicle $vehicle,
        int $sessionNumber,
        int $totalSessions,
        Carbon $targetDate,
        TimeSlot $targetSlot,
        bool $isFirstSession,
    ): array {
        $availability = $this->checkAvailability($package, $date, $slot, $instructor, $vehicle);

        if (!$availability['available']) {
            return [
                'available' => false,
                'message' => $availability['message'],
            ];
        }

        $isTargetDate = $date->isSameDay($targetDate);
        $isTargetSlot = (int) $slot->id === (int) $targetSlot->id;
        $isAdjusted = !$isFirstSession && (!$isTargetDate || !$isTargetSlot);

        return [
            'available' => true,
            'session' => [
                'sesi_ke' => $sessionNumber,
                'total_sesi' => $totalSessions,
                'tanggal_latihan' => $date->toDateString(),
                'target_tanggal_latihan' => $targetDate->toDateString(),
                'is_adjusted' => $isAdjusted,
                'adjustment_note' => $this->resolveAdjustmentNote($isFirstSession, $isAdjusted, $isTargetDate, $isTargetSlot),
                'time_slot' => $this->formatSlot($slot),
                'target_time_slot' => $this->formatSlot($targetSlot),
                'instructor' => $this->formatInstructor($instructor),
                'vehicle' => $this->formatVehicle($vehicle),
                'existing_schedule_id' => $availability['schedule']?->id,
                'schedule_mode' => $availability['schedule'] ? 'existing_schedule' : 'new_schedule',
            ],
        ];
    }

    private function checkAvailability(
        CoursePackage $package,
        Carbon $date,
        TimeSlot $slot,
        Instructor $instructor,
        Vehicle $vehicle,
    ): array {
        if ($date->lt(now()->startOfDay())) {
            return $this->availability(false, 'Tanggal latihan yang sudah lewat tidak dapat dipakai.');
        }

        if (!$this->isSlotActiveOnDate($slot, $date)) {
            return $this->availability(false, 'Slot waktu tidak aktif pada tanggal tersebut.');
        }

        if (!$this->isInstructorAssignedToSlot($instructor, $slot, $date)) {
            return $this->availability(false, 'Instruktur belum di-assign pada slot waktu tersebut.');
        }

        $resourceSchedules = TrainingSchedule::query()
            ->with('bookings')
            ->whereDate('tanggal_latihan', $date->toDateString())
            ->where('time_slot_id', $slot->id)
            ->where('status', '!=', 'Dibatalkan')
            ->where(function ($query) use ($instructor, $vehicle) {
                $query
                    ->where('instructor_id', $instructor->id)
                    ->orWhere('vehicle_id', $vehicle->id);
            })
            ->get();

        if ($resourceSchedules->isEmpty()) {
            return $this->availability(true);
        }

        $resourceSchedules->each(function (TrainingSchedule $schedule) {
            BookingCapacityManager::syncFromBookings($schedule);
        });

        $resourceSchedules = $resourceSchedules->map(function (TrainingSchedule $schedule) {
            return $schedule->fresh('bookings');
        })->filter();

        /** @var TrainingSchedule|null $reusableSchedule */
        $reusableSchedule = $resourceSchedules->first(function (TrainingSchedule $schedule) use ($package, $instructor, $vehicle) {
            $packageMatches = !$schedule->course_package_id
                || (int) $schedule->course_package_id === (int) $package->id;

            return (int) $schedule->instructor_id === (int) $instructor->id
                && (int) $schedule->vehicle_id === (int) $vehicle->id
                && $schedule->status === 'Tersedia'
                && (int) $schedule->jumlah_booking < (int) $schedule->kapasitas
                && $packageMatches;
        });

        $blockingSchedules = $resourceSchedules->filter(function (TrainingSchedule $schedule) {
            return $schedule->bookings->contains(function ($booking) {
                return BookingCapacityManager::occupiesCapacity($booking->status);
            });
        })->values();

        if ($blockingSchedules->isEmpty()) {
            return $this->availability(true, null, $reusableSchedule);
        }

        if ($blockingSchedules->count() === 1 && $reusableSchedule && (int) $blockingSchedules->first()->id === (int) $reusableSchedule->id) {
            return $this->availability(true, null, $reusableSchedule);
        }

        return $this->availability(false, 'Instruktur atau kendaraan sudah memiliki jadwal aktif pada slot tersebut.');
    }

    private function candidateInstructors(TimeSlot $initialSlot, Carbon $startDate): Collection
    {
        $query = Instructor::query()
            ->with('user')
            ->where('status', 'Aktif')
            ->where('status_jadwal', '!=', 'Libur / Cuti')
            ->whereHas('user', function ($query) {
                $query->where('status_akun', 'Aktif');
            })
            ->orderBy('id');

        if ($this->hasInstructorAssignmentTable()) {
            $dayOfWeek = $this->indonesianDayName($startDate);
            $assignedInstructorIds = DB::table('instructor_time_slot_assignments')
                ->where('time_slot_id', $initialSlot->id)
                ->where('day_of_week', $dayOfWeek)
                ->where('status', 'Aktif')
                ->pluck('instructor_id')
                ->unique()
                ->values();

            if ($assignedInstructorIds->isEmpty()) {
                return collect();
            }

            $query->whereIn('id', $assignedInstructorIds);
        }

        return $query->get();
    }

    private function candidateVehicles(?string $transmission = null): Collection
    {
        return Vehicle::query()
            ->where('status', 'Aktif')
            ->where('ketersediaan', 'Tersedia')
            ->when($transmission, function ($query) use ($transmission) {
                $query->where('transmisi', $transmission);
            })
            ->orderBy('id')
            ->get();
    }

    private function isInstructorAssignedToSlot(Instructor $instructor, TimeSlot $slot, Carbon $date): bool
    {
        if (!$this->hasInstructorAssignmentTable()) {
            return true;
        }

        return DB::table('instructor_time_slot_assignments')
            ->where('instructor_id', $instructor->id)
            ->where('time_slot_id', $slot->id)
            ->where('day_of_week', $this->indonesianDayName($date))
            ->where('status', 'Aktif')
            ->exists();
    }

    private function hasInstructorAssignmentTable(): bool
    {
        return Schema::hasTable('instructor_time_slot_assignments')
            && Schema::hasColumn('instructor_time_slot_assignments', 'instructor_id')
            && Schema::hasColumn('instructor_time_slot_assignments', 'time_slot_id')
            && Schema::hasColumn('instructor_time_slot_assignments', 'day_of_week')
            && Schema::hasColumn('instructor_time_slot_assignments', 'status');
    }

    private function calculateTotalSessions(CoursePackage $package, TimeSlot $slot): int
    {
        $packageMinutes = max(1, (int) $package->durasi_jam) * 60;
        $slotMinutes = max(1, (int) $slot->durasi_menit);

        return max(1, (int) ceil($packageMinutes / $slotMinutes));
    }

    private function isSlotActiveOnDate(TimeSlot $slot, Carbon $date): bool
    {
        $activeDays = $this->parseActiveDays($slot->hari_aktif)
            ->map(fn(string $day) => mb_strtolower($day))
            ->values();

        if ($activeDays->isEmpty()) {
            return true;
        }

        $dayName = mb_strtolower($this->indonesianDayName($date));

        return $activeDays->contains($dayName);
    }

    private function parseActiveDays(?string $value): Collection
    {
        $normalized = trim((string) $value);

        if ($normalized === '') {
            return collect(self::ACTIVE_DAYS);
        }

        $lowerValue = mb_strtolower($normalized);

        if (str_contains($lowerValue, 'setiap hari') || str_contains($lowerValue, 'senin - minggu')) {
            return collect(self::ACTIVE_DAYS);
        }

        if (str_contains($lowerValue, 'senin - jumat')) {
            return collect(self::ACTIVE_WEEKDAYS);
        }

        if (str_contains($lowerValue, 'sabtu - minggu')) {
            return collect(self::ACTIVE_WEEKEND);
        }

        $daysByLowerName = collect(self::ACTIVE_DAYS)->keyBy(
            fn(string $day) => mb_strtolower($day),
        );

        $days = collect(explode(',', $normalized))
            ->map(fn(string $day) => trim($day))
            ->filter()
            ->map(fn(string $day) => $daysByLowerName->get(mb_strtolower($day)))
            ->filter()
            ->values();

        if ($days->all() === ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']) {
            return collect(self::ACTIVE_DAYS);
        }

        return $days;
    }

    private function indonesianDayName(Carbon $date): string
    {
        return match ((int) $date->isoWeekday()) {
            1 => 'Senin',
            2 => 'Selasa',
            3 => 'Rabu',
            4 => 'Kamis',
            5 => 'Jumat',
            6 => 'Sabtu',
            default => 'Minggu',
        };
    }

    private function resolvePackagePrice(CoursePackage $package, bool $pickup, bool $withSim): int
    {
        if ($pickup && $withSim) {
            return (int) $package->harga_dengan_sim_antar_jemput;
        }

        if (!$pickup && $withSim) {
            return (int) $package->harga_dengan_sim_tidak_antar_jemput;
        }

        if ($pickup && !$withSim) {
            return (int) $package->harga_antar_jemput;
        }

        return (int) $package->harga_tidak_antar_jemput;
    }

    private function resolveAdjustmentNote(bool $isFirstSession, bool $isAdjusted, bool $isTargetDate, bool $isTargetSlot): ?string
    {
        if ($isFirstSession) {
            return 'Sesi pertama sesuai tanggal dan jam yang dipilih peserta.';
        }

        if (!$isAdjusted) {
            return null;
        }

        if (!$isTargetDate && !$isTargetSlot) {
            return 'Tanggal dan jam disesuaikan otomatis karena target mingguan tidak tersedia.';
        }

        if (!$isTargetDate) {
            return 'Tanggal disesuaikan otomatis karena target mingguan tidak tersedia.';
        }

        return 'Jam disesuaikan otomatis karena slot utama tidak tersedia.';
    }

    private function formatPackage(CoursePackage $package): array
    {
        return [
            'id' => $package->id,
            'kode_paket' => $package->kode_paket,
            'nama_paket' => $package->nama_paket,
            'durasi_jam' => (int) $package->durasi_jam,
            'termasuk_sertifikat' => (bool) $package->termasuk_sertifikat,
        ];
    }

    private function formatSlot(TimeSlot $slot): array
    {
        return [
            'id' => $slot->id,
            'kode_slot' => $slot->kode_slot,
            'nama_slot' => $slot->nama_slot,
            'subtitle' => $slot->subtitle,
            'jam_mulai' => substr((string) $slot->jam_mulai, 0, 5),
            'jam_selesai' => substr((string) $slot->jam_selesai, 0, 5),
            'durasi_menit' => (int) $slot->durasi_menit,
        ];
    }

    private function formatInstructor(Instructor $instructor): array
    {
        return [
            'id' => $instructor->id,
            'kode_instruktur' => $instructor->kode_instruktur,
            'nama_instruktur' => $instructor->user?->name,
            'spesialisasi' => $instructor->spesialisasi,
        ];
    }

    private function formatVehicle(Vehicle $vehicle): array
    {
        return [
            'id' => $vehicle->id,
            'kode_kendaraan' => $vehicle->kode_kendaraan,
            'nama_kendaraan' => $vehicle->nama_kendaraan,
            'model' => $vehicle->model,
            'nomor_plat' => $vehicle->nomor_plat,
            'transmisi' => $vehicle->transmisi,
        ];
    }

    private function availability(bool $available, ?string $message = null, ?TrainingSchedule $schedule = null): array
    {
        return [
            'available' => $available,
            'message' => $message,
            'schedule' => $schedule,
        ];
    }

    private function error(string $message, int $status): array
    {
        return [
            'success' => false,
            'status' => $status,
            'message' => $message,
        ];
    }
}
