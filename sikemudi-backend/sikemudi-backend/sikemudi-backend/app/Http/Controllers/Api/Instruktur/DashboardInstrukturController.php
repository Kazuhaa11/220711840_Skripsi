<?php

namespace App\Http\Controllers\Api\Instruktur;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Instructor;
use App\Models\TrainingSchedule;
use App\Support\DateFormatter;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardInstrukturController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $instructor = $this->getAuthenticatedInstructor($request);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Data instruktur tidak ditemukan.',
            ], 404);
        }

        $today = now()->toDateString();

        $todaySchedules = $this->getTodaySchedulesQuery($instructor->id, $today)
            ->get();

        $activeOrNextSchedule = $this->resolveActiveOrNextSchedule($instructor->id, $today);

        return response()->json([
            'success' => true,
            'message' => 'Data dashboard instruktur berhasil diambil.',
            'data' => [
                'tanggal_hari_ini' => $today,
                'tanggal_hari_ini_label' => $this->formatIndonesianDate($today),

                'profile' => [
                    'id' => $instructor->id,
                    'kode_instruktur' => $instructor->kode_instruktur,
                    'nama_instruktur' => $instructor->user?->name,
                    'email' => $instructor->user?->email,
                    'role' => 'instruktur',
                    'jabatan' => $instructor->jabatan,
                    'spesialisasi' => $instructor->spesialisasi,
                    'status' => $instructor->status,
                    'status_jadwal' => $instructor->status_jadwal,
                ],

                'summary_cards' => $this->getSummaryCards($instructor->id, $today),

                'jadwal_hari_ini' => $todaySchedules
                    ->map(fn(TrainingSchedule $schedule) => $this->formatTodaySchedule($schedule, $today))
                    ->values(),

                'sesi_berikutnya' => $activeOrNextSchedule
                    ? $this->formatNextSession($activeOrNextSchedule, $today)
                    : null,

                'peserta_sesi_aktif' => $activeOrNextSchedule
                    ? $this->formatActiveSessionParticipants($activeOrNextSchedule)
                    : [
                        'schedule' => null,
                        'items' => [],
                    ],

                'tugas_pengingat' => $this->getReminders($instructor->id, $today),
            ],
        ]);
    }

    private function getAuthenticatedInstructor(Request $request): ?Instructor
    {
        return Instructor::query()
            ->with('user.role')
            ->where('user_id', $request->user()->id)
            ->first();
    }

    private function getTodaySchedulesQuery(int $instructorId, string $today)
    {
        return TrainingSchedule::query()
            ->with([
                'timeSlot',
                'vehicle',
                'coursePackage',
                'bookings' => function ($query) {
                    $query
                        ->whereIn('status', ['Dikonfirmasi', 'Dijadwalkan Ulang', 'Selesai'])
                        ->with([
                            'participant.user',
                            'coursePackage',
                            'trainingResult',
                            'payment',
                        ]);
                },
            ])
            ->withCount([
                'bookings as jumlah_peserta_valid' => function ($query) {
                    $query->whereIn('status', ['Dikonfirmasi', 'Dijadwalkan Ulang', 'Selesai']);
                },
            ])
            ->where('instructor_id', $instructorId)
            ->whereDate('tanggal_latihan', $today)
            ->whereNotIn('status', ['Dibatalkan'])
            ->orderBy('time_slot_id');
    }

    private function getSummaryCards(int $instructorId, string $today): array
    {
        $todaySchedulesCount = TrainingSchedule::query()
            ->where('instructor_id', $instructorId)
            ->whereDate('tanggal_latihan', $today)
            ->whereNotIn('status', ['Dibatalkan'])
            ->count();

        $ongoingSchedulesCount = $this->getTodaySchedulesQuery($instructorId, $today)
            ->get()
            ->filter(fn(TrainingSchedule $schedule) => $this->resolveComputedStatus($schedule, $today) === 'Berlangsung')
            ->count();

        $todayParticipantsCount = Booking::query()
            ->whereIn('status', ['Dikonfirmasi', 'Dijadwalkan Ulang', 'Selesai'])
            ->whereHas('trainingSchedule', function ($query) use ($instructorId, $today) {
                $query
                    ->where('instructor_id', $instructorId)
                    ->whereDate('tanggal_latihan', $today);
            })
            ->count();

        $pendingResultCount = Booking::query()
            ->whereIn('status', ['Dikonfirmasi', 'Dijadwalkan Ulang'])
            ->whereDoesntHave('trainingResult')
            ->whereHas('trainingSchedule', function ($query) use ($instructorId, $today) {
                $query
                    ->where('instructor_id', $instructorId)
                    ->whereDate('tanggal_latihan', '<=', $today);
            })
            ->count();

        return [
            'jadwal_hari_ini' => [
                'label' => 'Hari Ini',
                'value' => $todaySchedulesCount,
                'unit' => 'Sesi',
                'description' => 'Jadwal Mengajar',
            ],
            'sesi_aktif' => [
                'label' => 'Aktif',
                'value' => $ongoingSchedulesCount,
                'unit' => 'Sesi',
                'description' => 'Sedang Berlangsung',
            ],
            'peserta_hari_ini' => [
                'label' => 'Total',
                'value' => $todayParticipantsCount,
                'unit' => 'Peserta',
                'description' => 'Peserta Hari Ini',
            ],
            'pending_hasil' => [
                'label' => 'Pending',
                'value' => $pendingResultCount,
                'unit' => 'Sesi',
                'description' => 'Menunggu Input Hasil',
            ],
        ];
    }

    private function resolveActiveOrNextSchedule(int $instructorId, string $today): ?TrainingSchedule
    {
        $schedules = $this->getTodaySchedulesQuery($instructorId, $today)->get();

        $ongoingSchedule = $schedules
            ->first(fn(TrainingSchedule $schedule) => $this->resolveComputedStatus($schedule, $today) === 'Berlangsung');

        if ($ongoingSchedule) {
            return $ongoingSchedule;
        }

        $now = now();

        return $schedules
            ->first(function (TrainingSchedule $schedule) use ($today, $now) {
                if (!$schedule->timeSlot) {
                    return false;
                }

                $startTime = Carbon::parse($today . ' ' . (string) $schedule->timeSlot->jam_mulai);

                return $startTime->gt($now);
            });
    }

    private function formatTodaySchedule(TrainingSchedule $schedule, string $today): array
    {
        $computedStatus = $this->resolveComputedStatus($schedule, $today);

        return [
            'id' => $schedule->id,
            'kode_jadwal' => $schedule->kode_jadwal,
            'tanggal_latihan' => DateFormatter::date($schedule->tanggal_latihan),

            'jam' => $schedule->timeSlot ? [
                'jam_mulai' => DateFormatter::time($schedule->timeSlot->jam_mulai),
                'jam_selesai' => DateFormatter::time($schedule->timeSlot->jam_selesai),
                'label' => DateFormatter::time($schedule->timeSlot->jam_mulai)
                    . ' - '
                    . DateFormatter::time($schedule->timeSlot->jam_selesai),
            ] : null,

            'kendaraan' => $schedule->vehicle ? [
                'id' => $schedule->vehicle->id,
                'kode_kendaraan' => $schedule->vehicle->kode_kendaraan,
                'nama_kendaraan' => $schedule->vehicle->nama_kendaraan,
                'model' => $schedule->vehicle->model,
                'nomor_plat' => $schedule->vehicle->nomor_plat,
                'transmisi' => $schedule->vehicle->transmisi,
                'label' => trim($schedule->vehicle->nama_kendaraan . ' ' . $schedule->vehicle->model),
            ] : null,

            'paket' => $schedule->coursePackage ? [
                'id' => $schedule->coursePackage->id,
                'nama_paket' => $schedule->coursePackage->nama_paket,
                'durasi_jam' => (int) $schedule->coursePackage->durasi_jam,
            ] : null,

            'peserta' => (int) ($schedule->jumlah_peserta_valid ?? 0),
            'kapasitas' => (int) $schedule->kapasitas,

            'status' => $computedStatus,
            'status_label' => strtoupper($computedStatus),

            'aksi' => [
                'can_view_detail' => true,
                'can_open_session' => $computedStatus === 'Akan Datang',
                'can_input_result' => in_array($computedStatus, ['Berlangsung', 'Selesai'], true),
            ],
        ];
    }

    private function formatNextSession(TrainingSchedule $schedule, string $today): array
    {
        return [
            'id' => $schedule->id,
            'kode_jadwal' => $schedule->kode_jadwal,
            'tanggal_latihan' => DateFormatter::date($schedule->tanggal_latihan),
            'status' => $this->resolveComputedStatus($schedule, $today),

            'jam' => $schedule->timeSlot ? [
                'jam_mulai' => DateFormatter::time($schedule->timeSlot->jam_mulai),
                'jam_selesai' => DateFormatter::time($schedule->timeSlot->jam_selesai),
                'label' => DateFormatter::time($schedule->timeSlot->jam_mulai)
                    . ' - '
                    . DateFormatter::time($schedule->timeSlot->jam_selesai),
            ] : null,

            'timezone_label' => 'Waktu Indonesia Barat',

            'kendaraan' => $schedule->vehicle ? [
                'id' => $schedule->vehicle->id,
                'kode_kendaraan' => $schedule->vehicle->kode_kendaraan,
                'nama_kendaraan' => $schedule->vehicle->nama_kendaraan,
                'model' => $schedule->vehicle->model,
                'nomor_plat' => $schedule->vehicle->nomor_plat,
                'transmisi' => $schedule->vehicle->transmisi,
                'label' => trim($schedule->vehicle->nama_kendaraan . ' ' . $schedule->vehicle->model)
                    . ' • '
                    . $schedule->vehicle->nomor_plat,
            ] : null,

            'lokasi_start' => 'Pool SIKEMUDI',
            'button_label' => 'Siapkan Sesi',
        ];
    }

    private function formatActiveSessionParticipants(TrainingSchedule $schedule): array
    {
        $items = $schedule->bookings
            ? $schedule->bookings
                ->map(function (Booking $booking) {
                    $participantName = $booking->participant?->user?->name ?? '-';

                    return [
                        'booking_id' => $booking->id,
                        'kode_booking' => $booking->kode_booking,
                        'status_booking' => $booking->status,

                        'peserta' => [
                            'id' => $booking->participant?->id,
                            'kode_peserta' => $booking->participant?->kode_peserta,
                            'nama_peserta' => $participantName,
                            'inisial' => $this->getInitials($participantName),
                            'email' => $booking->participant?->user?->email,
                            'no_telepon' => $booking->participant?->user?->no_telepon,
                        ],

                        'paket' => $booking->coursePackage ? [
                            'id' => $booking->coursePackage->id,
                            'nama_paket' => $booking->coursePackage->nama_paket,
                            'durasi_jam' => (int) $booking->coursePackage->durasi_jam,
                        ] : null,

                        'sesi_label' => $booking->coursePackage
                            ? strtoupper($booking->coursePackage->nama_paket)
                            : null,

                        'sudah_input_hasil' => (bool) $booking->trainingResult,
                    ];
                })
                ->values()
            : collect();

        return [
            'schedule' => [
                'id' => $schedule->id,
                'kode_jadwal' => $schedule->kode_jadwal,
                'tanggal_latihan' => DateFormatter::date($schedule->tanggal_latihan),
                'jam_label' => $schedule->timeSlot
                    ? DateFormatter::time($schedule->timeSlot->jam_mulai)
                    . ' - '
                    . DateFormatter::time($schedule->timeSlot->jam_selesai)
                    : null,
            ],
            'items' => $items,
        ];
    }

    private function getReminders(int $instructorId, string $today): array
    {
        $pendingResultsCount = Booking::query()
            ->whereIn('status', ['Dikonfirmasi', 'Dijadwalkan Ulang'])
            ->whereDoesntHave('trainingResult')
            ->whereHas('trainingSchedule', function ($query) use ($instructorId, $today) {
                $query
                    ->where('instructor_id', $instructorId)
                    ->whereDate('tanggal_latihan', '<=', $today);
            })
            ->count();

        $nextSoonSchedule = $this->getTodaySchedulesQuery($instructorId, $today)
            ->get()
            ->first(function (TrainingSchedule $schedule) use ($today) {
                if (!$schedule->timeSlot) {
                    return false;
                }

                $startTime = Carbon::parse($today . ' ' . (string) $schedule->timeSlot->jam_mulai);
                $minutesUntilStart = now()->diffInMinutes($startTime, false);

                return $minutesUntilStart >= 0 && $minutesUntilStart <= 60;
            });

        $reminders = [];

        $reminders[] = [
            'type' => 'warning',
            'title' => 'Input Hasil Pending',
            'description' => $pendingResultsCount > 0
                ? "{$pendingResultsCount} sesi belum diinput hasilnya. Segera lengkapi untuk laporan peserta."
                : 'Tidak ada hasil latihan yang tertunda.',
            'count' => $pendingResultsCount,
        ];

        if ($nextSoonSchedule) {
            $start = DateFormatter::time($nextSoonSchedule->timeSlot?->jam_mulai);
            $minutesUntilStart = now()->diffInMinutes(
                Carbon::parse($today . ' ' . (string) $nextSoonSchedule->timeSlot?->jam_mulai),
                false
            );

            $reminders[] = [
                'type' => 'info',
                'title' => 'Sesi Segera Dimulai',
                'description' => "Sesi jam {$start} akan dimulai dalam {$minutesUntilStart} menit. Harap cek kesiapan kendaraan.",
                'count' => 1,
                'schedule_id' => $nextSoonSchedule->id,
            ];
        }

        return $reminders;
    }

    private function resolveComputedStatus(TrainingSchedule $schedule, string $today): string
    {
        if (in_array($schedule->status, ['Dibatalkan'], true)) {
            return 'Dibatalkan';
        }

        if (!$schedule->timeSlot) {
            return $schedule->status;
        }

        $startTime = Carbon::parse($today . ' ' . (string) $schedule->timeSlot->jam_mulai);
        $endTime = Carbon::parse($today . ' ' . (string) $schedule->timeSlot->jam_selesai);
        $now = now();

        if ($now->between($startTime, $endTime)) {
            return 'Berlangsung';
        }

        if ($now->lt($startTime)) {
            return 'Terjadwal';
        }

        return 'Selesai';
    }

    private function getInitials(string $name): string
    {
        $parts = collect(preg_split('/\s+/', trim($name)))
            ->filter()
            ->values();

        if ($parts->isEmpty()) {
            return '-';
        }

        if ($parts->count() === 1) {
            return strtoupper(substr($parts->first(), 0, 2));
        }

        return strtoupper(substr($parts->get(0), 0, 1) . substr($parts->get(1), 0, 1));
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