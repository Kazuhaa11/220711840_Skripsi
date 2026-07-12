<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\Certificate;
use App\Models\Instructor;
use App\Models\Participant;
use App\Models\TrainingResult;
use App\Models\TrainingSchedule;
use App\Models\Vehicle;
use App\Support\DateFormatter;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $today = now()->toDateString();

        return response()->json([
            'success' => true,
            'message' => 'Data dashboard admin berhasil diambil.',
            'data' => [
                'tanggal_hari_ini' => $today,
                'tanggal_hari_ini_label' => $this->formatIndonesianDate($today),

                'summary_cards' => $this->getSummaryCards($today),

                'jadwal_hari_ini' => $this->getTodaySchedules($today),

                'status_operasional' => $this->getOperationalStatus($today),

                'aktivitas_booking_terbaru' => $this->getRecentBookingActivities(),
            ],
        ]);
    }

    private function getSummaryCards(string $today): array
    {
        $totalActiveParticipants = Participant::query()
            ->whereHas('user', function ($query) {
                $query->where('status_akun', 'Aktif');
            })
            ->count();

        $totalReadyInstructors = Instructor::query()
            ->where('status', 'Aktif')
            ->where('status_jadwal', '!=', 'Libur / Cuti')
            ->whereHas('user', function ($query) {
                $query->where('status_akun', 'Aktif');
            })
            ->count();

        $totalReadyVehicles = Vehicle::query()
            ->where('status', 'Aktif')
            ->where('ketersediaan', 'Tersedia')
            ->count();

        $totalRegisteredSchedules = TrainingSchedule::query()
            ->whereNotIn('status', ['Dibatalkan'])
            ->count();

        $totalWaitingPaymentConfirmation = BookingPayment::query()
            ->where('status', 'Menunggu Konfirmasi')
            ->count();

        $totalPublishedCertificates = Certificate::query()
            ->where('status', 'Terbit')
            ->count();

        return [
            'peserta' => [
                'label' => 'Peserta',
                'value' => $totalActiveParticipants,
                'description' => 'Total Peserta Aktif',
            ],
            'instruktur' => [
                'label' => 'Instruktur',
                'value' => $totalReadyInstructors,
                'description' => 'Ready di Lapangan',
            ],
            'kendaraan' => [
                'label' => 'Kendaraan',
                'value' => $totalReadyVehicles,
                'description' => 'Unit Siap Digunakan',
            ],
            'jadwal' => [
                'label' => 'Jadwal',
                'value' => $totalRegisteredSchedules,
                'description' => 'Sesi Terdaftar',
            ],
            'booking' => [
                'label' => 'Booking',
                'value' => $totalWaitingPaymentConfirmation,
                'description' => 'Menunggu Konfirmasi',
            ],
            'sertifikat_terbit' => [
                'label' => 'Sertifikat Terbit',
                'value' => $totalPublishedCertificates,
                'description' => 'Sertifikat Terbit',
            ],
        ];
    }

    private function getTodaySchedules(string $today): array
    {
        $schedules = TrainingSchedule::query()
            ->with([
                'timeSlot',
                'instructor.user',
                'vehicle',
                'coursePackage',
            ])
            ->withCount([
                'bookings as jumlah_peserta_valid' => function ($query) {
                    $query->whereIn('status', [
                        'Dikonfirmasi',
                        'Dijadwalkan Ulang',
                        'Selesai',
                    ]);
                },
            ])
            ->whereDate('tanggal_latihan', $today)
            ->orderBy('time_slot_id')
            ->limit(10)
            ->get();

        return $schedules
            ->map(function (TrainingSchedule $schedule) {
                return [
                    'id' => $schedule->id,
                    'kode_jadwal' => $schedule->kode_jadwal,
                    'tanggal_latihan' => DateFormatter::date($schedule->tanggal_latihan),

                    'waktu' => $schedule->timeSlot ? [
                        'id' => $schedule->timeSlot->id,
                        'nama_slot' => $schedule->timeSlot->nama_slot,
                        'jam_mulai' => DateFormatter::time($schedule->timeSlot->jam_mulai),
                        'jam_selesai' => DateFormatter::time($schedule->timeSlot->jam_selesai),
                        'label' => DateFormatter::time($schedule->timeSlot->jam_mulai)
                            . ' - '
                            . DateFormatter::time($schedule->timeSlot->jam_selesai),
                    ] : null,

                    'instruktur' => $schedule->instructor ? [
                        'id' => $schedule->instructor->id,
                        'kode_instruktur' => $schedule->instructor->kode_instruktur,
                        'nama_instruktur' => $schedule->instructor->user?->name,
                    ] : null,

                    'kendaraan' => $schedule->vehicle ? [
                        'id' => $schedule->vehicle->id,
                        'kode_kendaraan' => $schedule->vehicle->kode_kendaraan,
                        'nama_kendaraan' => $schedule->vehicle->nama_kendaraan,
                        'nomor_plat' => $schedule->vehicle->nomor_plat,
                        'label' => $schedule->vehicle->nama_kendaraan
                            . ' ('
                            . $schedule->vehicle->nomor_plat
                            . ')',
                    ] : null,

                    'paket' => $schedule->coursePackage ? [
                        'id' => $schedule->coursePackage->id,
                        'nama_paket' => $schedule->coursePackage->nama_paket,
                        'durasi_jam' => (int) $schedule->coursePackage->durasi_jam,
                    ] : null,

                    'peserta' => (int) ($schedule->jumlah_peserta_valid ?? 0),
                    'kapasitas' => (int) $schedule->kapasitas,
                    'sisa_kapasitas' => max(0, (int) $schedule->kapasitas - (int) $schedule->jumlah_booking),

                    'status' => $schedule->status,
                    'status_label' => $this->resolveTodayScheduleStatusLabel($schedule),
                ];
            })
            ->values()
            ->toArray();
    }

    private function getOperationalStatus(string $today): array
    {
        /** @var TrainingSchedule|null $almostFullSchedule */
        $almostFullSchedule = TrainingSchedule::query()
            ->with('timeSlot')
            ->whereDate('tanggal_latihan', '>=', $today)
            ->whereIn('status', ['Tersedia', 'Penuh'])
            ->whereRaw('(kapasitas - jumlah_booking) <= 1')
            ->whereRaw('(kapasitas - jumlah_booking) >= 0')
            ->orderBy('tanggal_latihan')
            ->orderBy('time_slot_id')
            ->first();

        $activeVehiclesCount = Vehicle::query()
            ->where('status', 'Aktif')
            ->count();

        $usedVehiclesCount = Vehicle::query()
            ->where('status', 'Aktif')
            ->where('ketersediaan', 'Sedang Latihan')
            ->count();

        $attentionSchedulesCount = TrainingSchedule::query()
            ->whereDate('tanggal_latihan', $today)
            ->where(function ($query) {
                $query
                    ->whereHas('instructor', function ($instructorQuery) {
                        $instructorQuery->where('status', '!=', 'Aktif');
                    })
                    ->orWhereHas('instructor.user', function ($userQuery) {
                        $userQuery->where('status_akun', '!=', 'Aktif');
                    })
                    ->orWhereHas('vehicle', function ($vehicleQuery) {
                        $vehicleQuery
                            ->where('status', '!=', 'Aktif')
                            ->orWhere('ketersediaan', 'Maintenance');
                    });
            })
            ->count();

        $waitingCertificatesCount = TrainingResult::query()
            ->where('status_kelulusan', 'Lulus')
            ->whereDoesntHave('certificate')
            ->count();

        return [
            'slot_hampir_penuh' => [
                'title' => 'Slot Hampir Penuh',
                'description' => $almostFullSchedule
                    ? $this->formatAlmostFullScheduleDescription($almostFullSchedule)
                    : 'Belum ada slot yang hampir penuh.',
                'count' => $almostFullSchedule ? 1 : 0,
                'data' => $almostFullSchedule ? [
                    'id' => $almostFullSchedule->id,
                    'kode_jadwal' => $almostFullSchedule->kode_jadwal,
                    'tanggal_latihan' => DateFormatter::date($almostFullSchedule->tanggal_latihan),
                    'sisa_slot' => max(0, (int) $almostFullSchedule->kapasitas - (int) $almostFullSchedule->jumlah_booking),
                    'time_slot' => $almostFullSchedule->timeSlot ? [
                        'nama_slot' => $almostFullSchedule->timeSlot->nama_slot,
                        'jam_mulai' => DateFormatter::time($almostFullSchedule->timeSlot->jam_mulai),
                        'jam_selesai' => DateFormatter::time($almostFullSchedule->timeSlot->jam_selesai),
                    ] : null,
                ] : null,
            ],

            'kendaraan_sedang_digunakan' => [
                'title' => 'Kendaraan Sedang Digunakan',
                'description' => "{$usedVehiclesCount} dari {$activeVehiclesCount} unit aktif di lapangan",
                'count' => $usedVehiclesCount,
                'total' => $activeVehiclesCount,
            ],

            'jadwal_perlu_perhatian' => [
                'title' => 'Jadwal Perlu Perhatian',
                'description' => $attentionSchedulesCount > 0
                    ? "{$attentionSchedulesCount} jadwal memiliki instruktur/kendaraan bermasalah hari ini"
                    : 'Tidak ada jadwal bermasalah hari ini.',
                'count' => $attentionSchedulesCount,
            ],

            'sertifikat_menunggu' => [
                'title' => 'Sertifikat Menunggu',
                'description' => "{$waitingCertificatesCount} peserta telah menyelesaikan kursus",
                'count' => $waitingCertificatesCount,
            ],
        ];
    }

    private function getRecentBookingActivities(): array
    {
        $bookings = Booking::query()
            ->with([
                'participant.user',
                'coursePackage',
                'trainingSchedule',
                'payment',
            ])
            ->latest()
            ->limit(5)
            ->get();

        return $bookings
            ->map(function (Booking $booking) {
                return [
                    'id' => $booking->id,
                    'kode_booking' => $booking->kode_booking,
                    'status' => $booking->status,
                    'status_label' => $this->resolveBookingStatusLabel($booking),
                    'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),
                    'updated_at' => DateFormatter::dateTime($booking->updated_at),

                    'peserta' => $booking->participant ? [
                        'id' => $booking->participant->id,
                        'kode_peserta' => $booking->participant->kode_peserta,
                        'nama_peserta' => $booking->participant->user?->name,
                        'email' => $booking->participant->user?->email,
                    ] : null,

                    'paket' => $booking->coursePackage ? [
                        'id' => $booking->coursePackage->id,
                        'nama_paket' => $booking->coursePackage->nama_paket,
                        'durasi_jam' => (int) $booking->coursePackage->durasi_jam,
                    ] : null,

                    'jadwal' => $booking->trainingSchedule ? [
                        'id' => $booking->trainingSchedule->id,
                        'kode_jadwal' => $booking->trainingSchedule->kode_jadwal,
                        'tanggal_latihan' => DateFormatter::date($booking->trainingSchedule->tanggal_latihan),
                    ] : null,

                    'payment' => $booking->payment ? [
                        'id' => $booking->payment->id,
                        'status' => $booking->payment->status,
                    ] : null,
                ];
            })
            ->values()
            ->toArray();
    }

    private function resolveTodayScheduleStatusLabel(TrainingSchedule $schedule): string
    {
        if (in_array($schedule->status, ['Selesai', 'Dibatalkan', 'Penuh'], true)) {
            return $schedule->status;
        }

        if (!$schedule->timeSlot) {
            return $schedule->status;
        }

        $today = now()->toDateString();

        $startTime = Carbon::parse($today . ' ' . $schedule->timeSlot->jam_mulai);
        $endTime = Carbon::parse($today . ' ' . $schedule->timeSlot->jam_selesai);
        $now = now();

        if ($now->between($startTime, $endTime)) {
            return 'Berlangsung';
        }

        if ($now->lt($startTime)) {
            return 'Akan Datang';
        }

        return 'Selesai';
    }

    private function resolveBookingStatusLabel(Booking $booking): string
    {
        return match ($booking->status) {
            'Menunggu Pembayaran' => 'PENDING',
            'Menunggu Konfirmasi Pembayaran' => 'MENUNGGU KONFIRMASI',
            'Dikonfirmasi' => 'DIKONFIRMASI',
            'Dijadwalkan Ulang' => 'DIJADWALKAN ULANG',
            'Selesai' => 'SELESAI',
            'Dibatalkan' => 'DIBATALKAN',
            default => strtoupper($booking->status),
        };
    }

    private function formatAlmostFullScheduleDescription(TrainingSchedule $schedule): string
    {
        $slotName = $schedule->timeSlot?->nama_slot ?? 'Slot';
        $start = $schedule->timeSlot ? DateFormatter::time($schedule->timeSlot->jam_mulai) : '-';
        $end = $schedule->timeSlot ? DateFormatter::time($schedule->timeSlot->jam_selesai) : '-';
        $remaining = max(0, (int) $schedule->kapasitas - (int) $schedule->jumlah_booking);

        return "{$slotName} ({$start} - {$end}) tersisa {$remaining} slot";
    }

    private function formatIndonesianDate(string $date): string
    {
        $carbon = Carbon::parse($date);

        $days = [
            'Sunday' => 'Minggu',
            'Monday' => 'Senin',
            'Tuesday' => 'Selasa',
            'Wednesday' => 'Rabu',
            'Thursday' => 'Kamis',
            'Friday' => 'Jumat',
            'Saturday' => 'Sabtu',
        ];

        $months = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        $dayName = $days[$carbon->format('l')] ?? $carbon->format('l');
        $monthName = $months[(int) $carbon->format('n')] ?? $carbon->format('F');

        return $dayName . ', ' . $carbon->format('d') . ' ' . $monthName . ' ' . $carbon->format('Y');
    }
}
