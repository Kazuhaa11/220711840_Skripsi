<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingGroup;
use App\Models\BookingHistory;
use App\Models\BookingPayment;
use App\Models\CoursePackage;
use App\Models\Participant;
use App\Models\TrainingSchedule;
use App\Support\BookingCapacityManager;
use App\Support\DateFormatter;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class BookingPackageCreationService
{
    public function __construct(
        private readonly BookingPackagePlannerService $plannerService,
    ) {
    }

    /**
     * Membuat booking paket otomatis berdasarkan preview planner.
     *
     * Patch 3:
     * - Peserta booking paket sekali.
     * - Backend membuat 1 booking_group.
     * - Backend membuat beberapa bookings sesuai total sesi.
     * - Backend membuat/reuse training_schedules sesuai hasil planner.
     * - Instruktur dan kendaraan mengikuti hasil planner dan sama untuk semua sesi.
     * - Payment dibuat sekali dan ditempel ke booking sesi pertama + booking_group.
     */
    public function create(Participant $participant, array $attributes, int $changedByUserId): array
    {
        return DB::transaction(function () use ($participant, $attributes, $changedByUserId) {
            $participant = Participant::query()
                ->lockForUpdate()
                ->with(['user', 'activePackage'])
                ->find($participant->id);

            if (!$participant) {
                return $this->error('Data peserta tidak ditemukan.', 404);
            }

            /** @var CoursePackage|null $package */
            $package = CoursePackage::query()
                ->where('status', 'Aktif')
                ->lockForUpdate()
                ->find($attributes['course_package_id']);

            if (!$package) {
                return $this->error('Paket kursus tidak aktif atau tidak ditemukan.', 422);
            }

            $packageValidation = $this->validateParticipantCanStartPackage($participant, $package);

            if ($packageValidation) {
                return $packageValidation;
            }

            if ((bool) ($attributes['pakai_antar_jemput'] ?? false) && empty($attributes['alamat_jemput'])) {
                return $this->error('Alamat jemput wajib diisi jika memilih layanan antar jemput.', 422);
            }

            $preview = $this->plannerService->preview($attributes);

            if (!($preview['success'] ?? false)) {
                return $this->error(
                    $preview['message'] ?? 'Preview jadwal paket gagal dibuat.',
                    (int) ($preview['status'] ?? 422),
                );
            }

            $previewData = $preview['data'];

            $customSessionsResult = $this->resolveCustomSessionsIfPresent($package, $previewData, $attributes);

            if (($customSessionsResult['error'] ?? false) === true) {
                return $customSessionsResult;
            }

            if (isset($customSessionsResult['sessions'])) {
                $previewData['sessions'] = $customSessionsResult['sessions'];
            }

            $sessions = collect($previewData['sessions'] ?? []);

            if ($sessions->isEmpty()) {
                return $this->error('Rencana jadwal paket tidak memiliki sesi latihan.', 422);
            }

            $totalSessions = (int) ($previewData['total_sesi'] ?? $sessions->count());
            $price = (int) ($previewData['harga_paket'] ?? 0);
            $instructorId = (int) ($previewData['instructor']['id'] ?? 0);
            $vehicleId = (int) ($previewData['vehicle']['id'] ?? 0);
            $paymentMethod = $this->normalizePaymentMethod($attributes['metode_pembayaran'] ?? BookingPayment::METODE_TRANSFER);
            $initialBookingStatus = $paymentMethod === BookingPayment::METODE_CASH
                ? 'Menunggu Konfirmasi Pembayaran'
                : 'Menunggu Pembayaran';
            $initialPaymentStatus = $paymentMethod === BookingPayment::METODE_CASH
                ? 'Menunggu Konfirmasi'
                : 'Belum Upload';

            if (!$instructorId || !$vehicleId) {
                return $this->error('Instruktur atau kendaraan belum dapat dialokasikan untuk paket ini.', 422);
            }

            $bookingGroup = $this->createBookingGroupWithUniqueCode([
                'participant_id' => $participant->id,
                'course_package_id' => $package->id,
                'instructor_id' => $instructorId,
                'vehicle_id' => $vehicleId,
                'total_sesi' => $totalSessions,
                'jumlah_sesi_selesai' => 0,
                'status' => $initialBookingStatus,
                'pakai_antar_jemput' => (bool) ($attributes['pakai_antar_jemput'] ?? false),
                'pakai_sim' => (bool) ($attributes['pakai_sim'] ?? false),
                'alamat_jemput' => $attributes['alamat_jemput'] ?? null,
                'harga_paket' => $price,
                'tanggal_booking' => now(),
                'catatan' => $attributes['catatan'] ?? null,
            ]);

            $bookings = collect();

            foreach ($sessions as $session) {
                $schedule = $this->resolveOrCreateSchedule($package, $session);

                if (!$schedule) {
                    return $this->error('Jadwal latihan untuk salah satu sesi gagal dibuat.', 500);
                }

                if (!$this->canUseSchedule($schedule, $package, $session)) {
                    $sessionNumber = (int) ($session['sesi_ke'] ?? 0);

                    return $this->error(
                        "Jadwal sesi ke-{$sessionNumber} sudah tidak tersedia. Silakan cek ulang ketersediaan jadwal.",
                        409,
                    );
                }

                BookingCapacityManager::reserve($schedule);

                $booking = $this->createBookingWithUniqueCode([
                    'booking_group_id' => $bookingGroup->id,
                    'participant_id' => $participant->id,
                    'training_schedule_id' => $schedule->id,
                    'course_package_id' => $package->id,
                    'sesi_ke' => (int) $session['sesi_ke'],
                    'total_sesi' => $totalSessions,
                    'pakai_antar_jemput' => (bool) ($attributes['pakai_antar_jemput'] ?? false),
                    'pakai_sim' => (bool) ($attributes['pakai_sim'] ?? false),
                    'alamat_jemput' => $attributes['alamat_jemput'] ?? null,
                    'harga_paket' => $price,
                    'status' => $initialBookingStatus,
                    'tanggal_booking' => now(),
                    'catatan' => $attributes['catatan'] ?? null,
                ]);

                BookingHistory::create([
                    'booking_id' => $booking->id,
                    'old_training_schedule_id' => null,
                    'new_training_schedule_id' => $schedule->id,
                    'aksi' => 'Dibuat',
                    'status_sebelum' => null,
                    'status_sesudah' => $initialBookingStatus,
                    'catatan' => "Booking paket otomatis dibuat untuk sesi ke-{$booking->sesi_ke} dari {$totalSessions}.",
                    'changed_by' => $changedByUserId,
                ]);

                $bookings->push($booking);
            }

            /** @var Booking $primaryBooking */
            $primaryBooking = $bookings->sortBy('sesi_ke')->first();

            BookingPayment::create([
                'booking_id' => $primaryBooking->id,
                'booking_group_id' => $bookingGroup->id,
                'nominal_bayar' => $paymentMethod === BookingPayment::METODE_CASH ? $price : 0,
                'metode_pembayaran' => $paymentMethod,
                'bukti_bayar' => null,
                'tanggal_upload' => null,
                'tanggal_verifikasi' => null,
                'status' => $initialPaymentStatus,
            ]);

            $participant->update([
                'paket_aktif_id' => $package->id,
                'jumlah_sesi_selesai' => 0,
                'jumlah_sesi_total' => $totalSessions,
                'status_sertifikat' => 'Dalam Proses',
            ]);

            $bookingGroup = $bookingGroup->fresh([
                'participant.user',
                'coursePackage',
                'instructor.user',
                'vehicle',
                'payment',
                'bookings.trainingSchedule.timeSlot',
                'bookings.trainingSchedule.instructor.user',
                'bookings.trainingSchedule.vehicle',
                'bookings.coursePackage',
            ]);

            return [
                'error' => false,
                'booking_group' => $bookingGroup,
                'metode_pembayaran' => $paymentMethod,
            ];
        });
    }


    private function normalizePaymentMethod(?string $method): string
    {
        return $method === BookingPayment::METODE_CASH
            ? BookingPayment::METODE_CASH
            : BookingPayment::METODE_TRANSFER;
    }

    private function resolveCustomSessionsIfPresent(CoursePackage $package, array $previewData, array $attributes): array
    {
        $customSessions = $attributes['sessions'] ?? null;

        if (!is_array($customSessions) || $customSessions === []) {
            return [
                'error' => false,
            ];
        }

        $totalSessions = (int) ($previewData['total_sesi'] ?? count($customSessions));
        $instructorId = (int) ($previewData['instructor']['id'] ?? 0);
        $vehicleId = (int) ($previewData['vehicle']['id'] ?? 0);

        if (!$instructorId || !$vehicleId) {
            return $this->error('Instruktur atau kendaraan paket belum valid untuk membuat jadwal custom.', 422);
        }

        if (count($customSessions) !== $totalSessions) {
            return $this->error('Jumlah sesi custom tidak sesuai dengan total sesi paket.', 422);
        }

        $resolvedSessions = [];
        $usedSessionNumbers = [];
        $usedDateSlots = [];

        foreach ($customSessions as $session) {
            $sessionNumber = (int) ($session['sesi_ke'] ?? 0);
            $date = (string) ($session['tanggal_latihan'] ?? '');
            $slotId = (int) ($session['time_slot_id'] ?? 0);

            if ($sessionNumber < 1 || $sessionNumber > $totalSessions || !$date || !$slotId) {
                return $this->error('Data salah satu sesi custom tidak lengkap.', 422);
            }

            if (isset($usedSessionNumbers[$sessionNumber])) {
                return $this->error("Sesi ke-{$sessionNumber} dikirim lebih dari satu kali.", 422);
            }

            $dateSlotKey = $date . '#' . $slotId;

            if (isset($usedDateSlots[$dateSlotKey])) {
                return $this->error('Dalam satu paket tidak boleh ada dua sesi pada tanggal dan slot yang sama.', 422);
            }

            $candidate = $this->plannerService->previewFixedResourceSession([
                'course_package_id' => $package->id,
                'tanggal_latihan' => $date,
                'time_slot_id' => $slotId,
                'instructor_id' => $instructorId,
                'vehicle_id' => $vehicleId,
                'sesi_ke' => $sessionNumber,
                'total_sesi' => $totalSessions,
                'target_tanggal_latihan' => $session['target_tanggal_latihan'] ?? $date,
                'target_time_slot_id' => $session['target_time_slot_id'] ?? $slotId,
            ]);

            if (!($candidate['success'] ?? false)) {
                return $this->error(
                    "Jadwal custom sesi ke-{$sessionNumber} tidak tersedia. " . ($candidate['message'] ?? 'Silakan pilih tanggal atau slot lain.'),
                    (int) ($candidate['status'] ?? 422),
                );
            }

            $resolvedSessions[] = $candidate['data'];
            $usedSessionNumbers[$sessionNumber] = true;
            $usedDateSlots[$dateSlotKey] = true;
        }

        usort($resolvedSessions, fn (array $a, array $b) => ((int) $a['sesi_ke']) <=> ((int) $b['sesi_ke']));

        return [
            'error' => false,
            'sessions' => $resolvedSessions,
        ];
    }

    private function validateParticipantCanStartPackage(Participant $participant, CoursePackage $package): ?array
    {
        $hasUnfinishedActivePackage = $participant->paket_aktif_id
            && (int) $participant->jumlah_sesi_total > 0
            && (int) $participant->jumlah_sesi_selesai < (int) $participant->jumlah_sesi_total;

        if ($hasUnfinishedActivePackage) {
            return $this->error(
                'Anda masih memiliki paket aktif yang belum selesai. Paket aktif harus diselesaikan sebelum mengambil paket baru.',
                409,
            );
        }

        $hasActiveBookingGroup = BookingGroup::query()
            ->where('participant_id', $participant->id)
            ->whereNotIn('status', ['Selesai', 'Dibatalkan'])
            ->exists();

        if ($hasActiveBookingGroup) {
            return $this->error(
                'Anda masih memiliki booking paket aktif. Selesaikan atau batalkan booking tersebut sebelum mengambil paket baru.',
                409,
            );
        }

        $hasActiveLegacyBooking = Booking::query()
            ->where('participant_id', $participant->id)
            ->whereNull('booking_group_id')
            ->whereNotIn('status', ['Selesai', 'Dibatalkan'])
            ->exists();

        if ($hasActiveLegacyBooking) {
            return $this->error(
                'Anda masih memiliki booking sesi aktif. Selesaikan atau batalkan booking tersebut sebelum mengambil paket baru.',
                409,
            );
        }

        return null;
    }

    private function resolveOrCreateSchedule(CoursePackage $package, array $session): ?TrainingSchedule
    {
        $scheduleId = $session['existing_schedule_id'] ?? null;

        if ($scheduleId) {
            return TrainingSchedule::query()
                ->lockForUpdate()
                ->find($scheduleId);
        }

        $date = $session['tanggal_latihan'];
        $slotId = (int) $session['time_slot']['id'];
        $instructorId = (int) $session['instructor']['id'];
        $vehicleId = (int) $session['vehicle']['id'];

        $existingSchedule = TrainingSchedule::query()
            ->with('bookings')
            ->whereDate('tanggal_latihan', $date)
            ->where('time_slot_id', $slotId)
            ->where('status', '!=', 'Dibatalkan')
            ->where(function ($query) use ($instructorId, $vehicleId) {
                $query
                    ->where('instructor_id', $instructorId)
                    ->orWhere('vehicle_id', $vehicleId);
            })
            ->lockForUpdate()
            ->first();

        if ($existingSchedule) {
            BookingCapacityManager::syncFromBookings($existingSchedule);

            return $existingSchedule->fresh();
        }

        return $this->createScheduleWithUniqueCode([
            'tanggal_latihan' => $date,
            'time_slot_id' => $slotId,
            'instructor_id' => $instructorId,
            'vehicle_id' => $vehicleId,
            'course_package_id' => $package->id,
            'kapasitas' => 1,
            'jumlah_booking' => 0,
            'status' => 'Tersedia',
            'catatan' => 'Jadwal dibuat otomatis dari booking paket peserta.',
        ]);
    }

    private function canUseSchedule(TrainingSchedule $schedule, CoursePackage $package, array $session): bool
    {
        $expectedInstructorId = (int) $session['instructor']['id'];
        $expectedVehicleId = (int) $session['vehicle']['id'];
        $expectedSlotId = (int) $session['time_slot']['id'];
        $expectedDate = $session['tanggal_latihan'];

        BookingCapacityManager::syncFromBookings($schedule);
        $schedule->refresh();

        $packageMatches = !$schedule->course_package_id
            || (int) $schedule->course_package_id === (int) $package->id;

        return $packageMatches
            && (int) $schedule->instructor_id === $expectedInstructorId
            && (int) $schedule->vehicle_id === $expectedVehicleId
            && (int) $schedule->time_slot_id === $expectedSlotId
            && $schedule->tanggal_latihan?->toDateString() === $expectedDate
            && !in_array($schedule->status, ['Dibatalkan', 'Berlangsung'], true)
            && BookingCapacityManager::hasCapacity($schedule);
    }

    private function createBookingGroupWithUniqueCode(array $attributes): BookingGroup
    {
        $lastException = null;

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            try {
                $attributes['kode_group'] = $this->generateBookingGroupCode($attempt);

                return BookingGroup::create($attributes);
            } catch (QueryException $exception) {
                if (!$this->isDuplicateKeyException($exception)) {
                    throw $exception;
                }

                $lastException = $exception;
            }
        }

        throw new RuntimeException('Kode booking paket gagal dibuat secara unik. Silakan coba kembali.', 0, $lastException);
    }

    private function createBookingWithUniqueCode(array $attributes): Booking
    {
        $lastException = null;

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            try {
                $attributes['kode_booking'] = $this->generateBookingCode($attempt);

                return Booking::create($attributes);
            } catch (QueryException $exception) {
                if (!$this->isDuplicateKeyException($exception)) {
                    throw $exception;
                }

                $lastException = $exception;
            }
        }

        throw new RuntimeException('Kode booking gagal dibuat secara unik. Silakan coba kembali.', 0, $lastException);
    }

    private function createScheduleWithUniqueCode(array $attributes): TrainingSchedule
    {
        $lastException = null;

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            try {
                $attributes['kode_jadwal'] = $this->generateScheduleCode($attempt);

                return TrainingSchedule::create($attributes);
            } catch (QueryException $exception) {
                if (!$this->isDuplicateKeyException($exception)) {
                    throw $exception;
                }

                $lastException = $exception;
            }
        }

        throw new RuntimeException('Kode jadwal latihan gagal dibuat secara unik. Silakan coba kembali.', 0, $lastException);
    }

    private function generateBookingGroupCode(int $attempt = 1): string
    {
        $lastGroup = BookingGroup::query()
            ->lockForUpdate()
            ->orderByDesc('id')
            ->first();

        $nextNumber = ($lastGroup ? $lastGroup->id : 0) + $attempt;

        return 'BGP-' . now()->format('Ymd') . '-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function generateBookingCode(int $attempt = 1): string
    {
        $lastBooking = Booking::query()
            ->lockForUpdate()
            ->orderByDesc('id')
            ->first();

        $nextNumber = ($lastBooking ? $lastBooking->id : 0) + $attempt;

        return 'BKG-' . now()->format('Ymd') . '-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function generateScheduleCode(int $attempt = 1): string
    {
        $lastSchedule = TrainingSchedule::query()
            ->lockForUpdate()
            ->orderByDesc('id')
            ->first();

        $nextNumber = ($lastSchedule ? $lastSchedule->id : 0) + $attempt;

        return 'JDL-' . now()->format('Ymd') . '-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function isDuplicateKeyException(QueryException $exception): bool
    {
        $errorInfo = $exception->errorInfo;

        return ($errorInfo[0] ?? null) === '23000'
            && (int) ($errorInfo[1] ?? 0) === 1062;
    }

    private function error(string $message, int $status): array
    {
        return [
            'error' => true,
            'status' => $status,
            'message' => $message,
        ];
    }

    public function formatBookingGroup(BookingGroup $group): array
    {
        $payment = $group->payment;

        return [
            'id' => $group->id,
            'kode_group' => $group->kode_group,
            'status' => $group->status,
            'total_sesi' => (int) $group->total_sesi,
            'jumlah_sesi_selesai' => (int) $group->jumlah_sesi_selesai,
            'progress_label' => ((int) $group->jumlah_sesi_selesai) . '/' . ((int) $group->total_sesi) . ' sesi',
            'tanggal_booking' => DateFormatter::dateTime($group->tanggal_booking),
            'tanggal_dikonfirmasi' => DateFormatter::dateTime($group->tanggal_dikonfirmasi),
            'tanggal_dibatalkan' => DateFormatter::dateTime($group->tanggal_dibatalkan),
            'alasan_pembatalan' => $group->alasan_pembatalan,
            'catatan' => $group->catatan,
            'pakai_antar_jemput' => (bool) $group->pakai_antar_jemput,
            'pakai_sim' => (bool) $group->pakai_sim,
            'alamat_jemput' => $group->alamat_jemput,
            'harga_paket' => (int) $group->harga_paket,
            'course_package' => $group->coursePackage ? [
                'id' => $group->coursePackage->id,
                'kode_paket' => $group->coursePackage->kode_paket,
                'nama_paket' => $group->coursePackage->nama_paket,
                'durasi_jam' => (int) $group->coursePackage->durasi_jam,
            ] : null,
            'instructor' => $group->instructor ? [
                'id' => $group->instructor->id,
                'kode_instruktur' => $group->instructor->kode_instruktur,
                'nama_instruktur' => $group->instructor->user?->name,
                'spesialisasi' => $group->instructor->spesialisasi,
            ] : null,
            'vehicle' => $group->vehicle ? [
                'id' => $group->vehicle->id,
                'kode_kendaraan' => $group->vehicle->kode_kendaraan,
                'nama_kendaraan' => $group->vehicle->nama_kendaraan,
                'model' => $group->vehicle->model,
                'nomor_plat' => $group->vehicle->nomor_plat,
                'transmisi' => $group->vehicle->transmisi,
            ] : null,
            'payment' => $payment ? [
                'id' => $payment->id,
                'booking_id' => $payment->booking_id,
                'booking_group_id' => $payment->booking_group_id,
                'nominal_bayar' => (int) $payment->nominal_bayar,
                'status' => $payment->status,
                'metode_pembayaran' => $payment->metode_pembayaran ?: BookingPayment::METODE_TRANSFER,
                'metode_pembayaran_label' => $payment->paymentMethodLabel(),
                'ada_bukti_bayar' => !empty($payment->bukti_bayar_path) || !empty($payment->bukti_bayar),
                'tanggal_upload' => DateFormatter::dateTime($payment->tanggal_upload),
                'tanggal_verifikasi' => DateFormatter::dateTime($payment->tanggal_verifikasi),
            ] : null,
            'sessions' => $group->bookings
                ? $group->bookings
                    ->sortBy('sesi_ke')
                    ->map(fn (Booking $booking) => $this->formatBookingSession($booking))
                    ->values()
                    ->all()
                : [],
            'created_at' => DateFormatter::dateTime($group->created_at),
            'updated_at' => DateFormatter::dateTime($group->updated_at),
        ];
    }

    private function formatBookingSession(Booking $booking): array
    {
        $schedule = $booking->trainingSchedule;

        return [
            'id' => $booking->id,
            'kode_booking' => $booking->kode_booking,
            'sesi_ke' => (int) $booking->sesi_ke,
            'total_sesi' => (int) $booking->total_sesi,
            'status' => $booking->status,
            'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),
            'training_schedule' => $schedule ? [
                'id' => $schedule->id,
                'kode_jadwal' => $schedule->kode_jadwal,
                'tanggal_latihan' => DateFormatter::date($schedule->tanggal_latihan),
                'status' => $schedule->status,
                'kapasitas' => (int) $schedule->kapasitas,
                'jumlah_booking' => (int) $schedule->jumlah_booking,
                'time_slot' => $schedule->timeSlot ? [
                    'id' => $schedule->timeSlot->id,
                    'kode_slot' => $schedule->timeSlot->kode_slot,
                    'nama_slot' => $schedule->timeSlot->nama_slot,
                    'jam_mulai' => DateFormatter::time($schedule->timeSlot->jam_mulai),
                    'jam_selesai' => DateFormatter::time($schedule->timeSlot->jam_selesai),
                    'durasi_menit' => (int) $schedule->timeSlot->durasi_menit,
                ] : null,
                'instructor' => $schedule->instructor ? [
                    'id' => $schedule->instructor->id,
                    'kode_instruktur' => $schedule->instructor->kode_instruktur,
                    'nama_instruktur' => $schedule->instructor->user?->name,
                ] : null,
                'vehicle' => $schedule->vehicle ? [
                    'id' => $schedule->vehicle->id,
                    'kode_kendaraan' => $schedule->vehicle->kode_kendaraan,
                    'nama_kendaraan' => $schedule->vehicle->nama_kendaraan,
                    'nomor_plat' => $schedule->vehicle->nomor_plat,
                    'transmisi' => $schedule->vehicle->transmisi,
                ] : null,
            ] : null,
        ];
    }
}
