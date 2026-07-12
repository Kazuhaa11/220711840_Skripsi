<?php

namespace App\Http\Controllers\Api\Peserta;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Certificate;
use App\Models\Participant;
use App\Models\TrainingResult;
use App\Models\TrainingSchedule;
use App\Support\DateFormatter;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardPesertaController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $today = now()->toDateString();
        $activePackageId = $this->resolveActivePackageId($participant);

        return response()->json([
            'success' => true,
            'message' => 'Data dashboard peserta berhasil diambil.',
            'data' => [
                'tanggal_hari_ini' => $today,
                'tanggal_hari_ini_label' => $this->formatIndonesianDate($today),

                'profile' => $this->formatProfile($participant),

                'summary_cards' => $this->getSummaryCards($participant),

                'jadwal_aktif_terdekat' => $this->getNearestActiveBooking($participant),

                'sertifikat_digital' => $this->getCertificateCard($participant),

                'jadwal_tersedia' => [
                    'course_package_id' => $activePackageId,
                    'items' => $activePackageId
                        ? $this->getAvailableSchedules($activePackageId)
                        : [],
                ],

                'riwayat_booking_terbaru' => $this->getRecentBookingHistory($participant),

                'informasi_akun' => $this->getAccountInfo($participant),
            ],
        ]);
    }

    private function getAuthenticatedParticipant(Request $request): ?Participant
    {
        return Participant::query()
            ->with(['user.role', 'activePackage'])
            ->where('user_id', $request->user()->id)
            ->first();
    }

    private function formatProfile(Participant $participant): array
    {
        return [
            'id' => $participant->id,
            'kode_peserta' => $participant->kode_peserta,
            'nama_peserta' => $participant->user?->name,
            'email' => $participant->user?->email,
            'no_telepon' => $participant->user?->no_telepon,
            'alamat' => $participant->user?->alamat,
            'foto_profil' => $participant->user?->foto_profil,
            'status_akun' => $participant->user?->status_akun,
            'status_sertifikat' => $participant->status_sertifikat,
            'tanggal_bergabung' => DateFormatter::date($participant->tanggal_bergabung),
            'role' => 'peserta',
        ];
    }

    private function getSummaryCards(Participant $participant): array
    {
        $activeBookingCount = Booking::query()
            ->where('participant_id', $participant->id)
            ->whereIn('status', [
                'Menunggu Pembayaran',
                'Menunggu Konfirmasi Pembayaran',
                'Dikonfirmasi',
                'Dijadwalkan Ulang',
            ])
            ->count();

        $totalBookingCount = Booking::query()
            ->where('participant_id', $participant->id)
            ->count();

        $completedTrainingCount = TrainingResult::query()
            ->where('participant_id', $participant->id)
            ->count();

        return [
            'jadwal_aktif' => [
                'label' => 'Jadwal Aktif',
                'value' => $activeBookingCount,
                'unit' => 'Sesi',
            ],
            'total_booking' => [
                'label' => 'Total Booking',
                'value' => $totalBookingCount,
                'unit' => 'Total',
            ],
            'riwayat_latihan' => [
                'label' => 'Riwayat Latihan',
                'value' => $completedTrainingCount,
                'unit' => 'Selesai',
            ],
            'status_sertifikat' => [
                'label' => 'Status Sertifikat',
                'value' => $this->resolveCertificateStatusLabel($participant),
                'raw_value' => $participant->status_sertifikat,
            ],
        ];
    }

    private function getNearestActiveBooking(Participant $participant): ?array
    {
        /** @var Booking|null $booking */
        $booking = Booking::query()
            ->with([
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment',
            ])
            ->join('training_schedules', 'bookings.training_schedule_id', '=', 'training_schedules.id')
            ->where('bookings.participant_id', $participant->id)
            ->whereIn('bookings.status', [
                'Dikonfirmasi',
                'Dijadwalkan Ulang',
            ])
            ->whereDate('training_schedules.tanggal_latihan', '>=', now()->toDateString())
            ->orderBy('training_schedules.tanggal_latihan')
            ->orderBy('training_schedules.time_slot_id')
            ->select('bookings.*')
            ->first();

        if (!$booking) {
            return null;
        }

        return $this->formatBookingCard($booking);
    }

    private function getCertificateCard(Participant $participant): array
    {
        $certificate = Certificate::query()
            ->with(['coursePackage', 'trainingResult'])
            ->where('peserta_id', $participant->id)
            ->where('status', 'Terbit')
            ->latest()
            ->first();

        $totalTarget = max((int) $participant->jumlah_sesi_total, 1);
        $completed = (int) $participant->jumlah_sesi_selesai;
        $progress = min(100, (int) round(($completed / $totalTarget) * 100));

        return [
            'is_verified' => (bool) $certificate,
            'title' => $certificate
                ? 'Sertifikat Digital Terverifikasi'
                : 'Sertifikat Digital Belum Terbit',
            'status' => $certificate ? 'Terverifikasi' : $participant->status_sertifikat,
            'progress' => [
                'percentage' => $progress,
                'label' => "{$progress}% Selesai",
                'step_label' => "Tahap {$completed}/{$totalTarget}",
                'completed' => $completed,
                'total' => $totalTarget,
            ],
            'certificate' => $certificate ? [
                'id' => $certificate->id,
                'nomor_sertifikat' => $certificate->nomor_sertifikat,
                'kode_verifikasi' => $certificate->kode_verifikasi,
                'tanggal_terbit' => DateFormatter::date($certificate->tanggal_terbit),
                'verification_url' => $certificate->verification_url,
                'pdf_url' => $certificate->pdf_url,
            ] : null,
        ];
    }

    private function getAvailableSchedules(int $coursePackageId): array
    {
        $schedules = TrainingSchedule::query()
            ->with([
                'timeSlot',
                'instructor.user',
                'vehicle',
                'coursePackage',
            ])
            ->where('status', 'Tersedia')
            ->where('course_package_id', $coursePackageId)
            ->whereDate('tanggal_latihan', '>=', now()->toDateString())
            ->whereColumn('jumlah_booking', '<', 'kapasitas')
            ->orderBy('tanggal_latihan')
            ->orderBy('time_slot_id')
            ->limit(3)
            ->get();

        return $schedules
            ->map(function (TrainingSchedule $schedule) {
                return [
                    'id' => $schedule->id,
                    'kode_jadwal' => $schedule->kode_jadwal,
                    'tanggal_latihan' => DateFormatter::date($schedule->tanggal_latihan),
                    'tanggal_latihan_label' => $this->formatIndonesianDate(DateFormatter::date($schedule->tanggal_latihan)),

                    'slot' => $schedule->timeSlot ? [
                        'id' => $schedule->timeSlot->id,
                        'nama_slot' => $schedule->timeSlot->nama_slot,
                        'jam_mulai' => DateFormatter::time($schedule->timeSlot->jam_mulai),
                        'jam_selesai' => DateFormatter::time($schedule->timeSlot->jam_selesai),
                        'jam_label' => DateFormatter::time($schedule->timeSlot->jam_mulai)
                            . ' - '
                            . DateFormatter::time($schedule->timeSlot->jam_selesai),
                    ] : null,

                    'instruktur' => $schedule->instructor ? [
                        'id' => $schedule->instructor->id,
                        'nama_instruktur' => $schedule->instructor->user?->name,
                    ] : null,

                    'kendaraan' => $schedule->vehicle ? [
                        'id' => $schedule->vehicle->id,
                        'nama_kendaraan' => $schedule->vehicle->nama_kendaraan,
                        'nomor_plat' => $schedule->vehicle->nomor_plat,
                        'transmisi' => $schedule->vehicle->transmisi,
                    ] : null,

                    'kapasitas' => (int) $schedule->kapasitas,
                    'jumlah_booking' => (int) $schedule->jumlah_booking,
                    'sisa_kapasitas' => max(0, (int) $schedule->kapasitas - (int) $schedule->jumlah_booking),
                    'button_label' => 'Booking Sekarang',
                ];
            })
            ->values()
            ->toArray();
    }

    private function getRecentBookingHistory(Participant $participant): array
    {
        $bookings = Booking::query()
            ->with([
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment',
            ])
            ->where('participant_id', $participant->id)
            ->latest()
            ->limit(5)
            ->get();

        return $bookings
            ->map(fn(Booking $booking) => $this->formatBookingHistoryRow($booking))
            ->values()
            ->toArray();
    }

    private function getAccountInfo(Participant $participant): array
    {
        return [
            'nama_lengkap' => $participant->user?->name,
            'tipe_pelatihan' => $participant->activePackage?->nama_paket
                ?? $this->resolveLatestPackageName($participant)
                ?? '-',
            'kontak' => $participant->user?->no_telepon,
            'email' => $participant->user?->email,
            'alamat' => $participant->user?->alamat,
            'status_akun' => $participant->user?->status_akun,
        ];
    }

    private function resolveActivePackageId(Participant $participant): ?int
    {
        if ($participant->paket_aktif_id) {
            return (int) $participant->paket_aktif_id;
        }

        $latestBooking = Booking::query()
            ->where('participant_id', $participant->id)
            ->whereNotNull('course_package_id')
            ->latest()
            ->first();

        return $latestBooking?->course_package_id
            ? (int) $latestBooking->course_package_id
            : null;
    }

    private function resolveLatestPackageName(Participant $participant): ?string
    {
        $latestBooking = Booking::query()
            ->with('coursePackage')
            ->where('participant_id', $participant->id)
            ->whereNotNull('course_package_id')
            ->latest()
            ->first();

        return $latestBooking?->coursePackage?->nama_paket;
    }

    private function resolveCertificateStatusLabel(Participant $participant): string
    {
        if ($participant->status_sertifikat === 'Terbit') {
            return 'Terverifikasi';
        }

        if ($participant->status_sertifikat === 'Dalam Proses') {
            return 'Dalam Proses';
        }

        $hasPassed = TrainingResult::query()
            ->where('participant_id', $participant->id)
            ->where('status_kelulusan', 'Lulus')
            ->exists();

        return $hasPassed ? 'Menunggu Sertifikat' : 'Belum Lulus';
    }

    private function formatBookingCard(Booking $booking): array
    {
        $schedule = $booking->trainingSchedule;

        return [
            'id' => $booking->id,
            'kode_booking' => $booking->kode_booking,
            'status' => $booking->status,
            'status_label' => $this->resolveBookingStatusLabel($booking->status),

            'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),

            'tanggal_latihan' => $schedule ? DateFormatter::date($schedule->tanggal_latihan) : null,
            'tanggal_latihan_label' => $schedule
                ? $this->formatIndonesianDate(DateFormatter::date($schedule->tanggal_latihan))
                : null,

            'time_slot' => $schedule?->timeSlot ? [
                'id' => $schedule->timeSlot->id,
                'nama_slot' => $schedule->timeSlot->nama_slot,
                'jam_mulai' => DateFormatter::time($schedule->timeSlot->jam_mulai),
                'jam_selesai' => DateFormatter::time($schedule->timeSlot->jam_selesai),
                'jam_label' => DateFormatter::time($schedule->timeSlot->jam_mulai)
                    . ' - '
                    . DateFormatter::time($schedule->timeSlot->jam_selesai),
            ] : null,

            'instruktur' => $schedule?->instructor ? [
                'id' => $schedule->instructor->id,
                'nama_instruktur' => $schedule->instructor->user?->name,
            ] : null,

            'kendaraan' => $schedule?->vehicle ? [
                'id' => $schedule->vehicle->id,
                'nama_kendaraan' => $schedule->vehicle->nama_kendaraan,
                'nomor_plat' => $schedule->vehicle->nomor_plat,
                'transmisi' => $schedule->vehicle->transmisi,
            ] : null,

            'paket' => $booking->coursePackage ? [
                'id' => $booking->coursePackage->id,
                'nama_paket' => $booking->coursePackage->nama_paket,
                'durasi_jam' => (int) $booking->coursePackage->durasi_jam,
            ] : null,

            'payment' => $booking->payment ? [
                'id' => $booking->payment->id,
                'status' => $booking->payment->status,
                'nominal_bayar' => (int) $booking->payment->nominal_bayar,
            ] : null,
        ];
    }

    private function formatBookingHistoryRow(Booking $booking): array
    {
        $schedule = $booking->trainingSchedule;

        return [
            'id' => $booking->id,
            'kode_booking' => $booking->kode_booking,
            'tanggal' => $schedule
                ? DateFormatter::date($schedule->tanggal_latihan)
                : DateFormatter::dateTime($booking->tanggal_booking),
            'tanggal_label' => $schedule
                ? $this->formatShortIndonesianDate(DateFormatter::date($schedule->tanggal_latihan))
                : null,

            'sesi' => $schedule?->timeSlot
                ? DateFormatter::time($schedule->timeSlot->jam_mulai)
                . ' - '
                . DateFormatter::time($schedule->timeSlot->jam_selesai)
                : '-',

            'instruktur' => $schedule?->instructor?->user?->name ?? '-',

            'status' => $booking->status,
            'status_label' => $this->resolveBookingStatusLabel($booking->status),

            'paket' => $booking->coursePackage ? [
                'id' => $booking->coursePackage->id,
                'nama_paket' => $booking->coursePackage->nama_paket,
            ] : null,
        ];
    }

    private function resolveBookingStatusLabel(string $status): string
    {
        return match ($status) {
            'Menunggu Pembayaran' => 'PENDING',
            'Menunggu Konfirmasi Pembayaran' => 'MENUNGGU KONFIRMASI',
            'Dikonfirmasi' => 'TERKONFIRMASI',
            'Dijadwalkan Ulang' => 'DIJADWALKAN ULANG',
            'Selesai' => 'SELESAI',
            'Dibatalkan' => 'DIBATALKAN',
            default => strtoupper($status),
        };
    }

    private function formatIndonesianDate(?string $date): ?string
    {
        if (!$date) {
            return null;
        }

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

    private function formatShortIndonesianDate(?string $date): ?string
    {
        if (!$date) {
            return null;
        }

        $carbon = Carbon::parse($date);

        $months = [
            1 => 'Jan',
            2 => 'Feb',
            3 => 'Mar',
            4 => 'Apr',
            5 => 'Mei',
            6 => 'Jun',
            7 => 'Jul',
            8 => 'Agu',
            9 => 'Sep',
            10 => 'Okt',
            11 => 'Nov',
            12 => 'Des',
        ];

        $monthName = $months[(int) $carbon->format('n')] ?? $carbon->format('M');

        return $carbon->format('d') . ' ' . $monthName . ' ' . $carbon->format('Y');
    }
}