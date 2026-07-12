<?php

namespace App\Http\Controllers\Api\Instruktur;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Instructor;
use App\Models\TrainingSchedule;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JadwalMengajarController extends Controller
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

        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $schedules = TrainingSchedule::query()
            ->with([
                'timeSlot',
                'vehicle',
                'coursePackage',
                'bookings' => function ($query) {
                    $query
                        ->whereIn('status', [
                            'Dikonfirmasi',
                            'Dijadwalkan Ulang',
                            'Selesai',
                        ])
                        ->with([
                            'participant.user',
                            'coursePackage',
                            'payment',
                            'bookingGroup.payment',
                            'trainingResult',
                        ])
                        ->orderBy('sesi_ke')
                        ->orderBy('id');
                },
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
            ->where('instructor_id', $instructor->id)
            ->whereHas('bookings', function ($query) {
                $query->whereIn('status', [
                    'Dikonfirmasi',
                    'Dijadwalkan Ulang',
                    'Selesai',
                ]);
            })
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_jadwal', 'like', "%{$keyword}%")
                        ->orWhere('catatan', 'like', "%{$keyword}%")
                        ->orWhereHas('timeSlot', function ($slotQuery) use ($keyword) {
                            $slotQuery
                                ->where('nama_slot', 'like', "%{$keyword}%")
                                ->orWhere('subtitle', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('vehicle', function ($vehicleQuery) use ($keyword) {
                            $vehicleQuery
                                ->where('nama_kendaraan', 'like', "%{$keyword}%")
                                ->orWhere('nomor_plat', 'like', "%{$keyword}%")
                                ->orWhere('transmisi', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('coursePackage', function ($packageQuery) use ($keyword) {
                            $packageQuery
                                ->where('nama_paket', 'like', "%{$keyword}%")
                                ->orWhere('kode_paket', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('bookings.participant.user', function ($userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%")
                                ->orWhere('no_telepon', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('bookings.bookingGroup', function ($groupQuery) use ($keyword) {
                            $groupQuery->where('kode_group', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('tanggal'), function ($query) use ($request) {
                $query->whereDate('tanggal_latihan', $request->query('tanggal'));
            })
            ->when($request->filled('tanggal_mulai'), function ($query) use ($request) {
                $query->whereDate('tanggal_latihan', '>=', $request->query('tanggal_mulai'));
            })
            ->when($request->filled('tanggal_selesai'), function ($query) use ($request) {
                $query->whereDate('tanggal_latihan', '<=', $request->query('tanggal_selesai'));
            })
            ->orderBy('tanggal_latihan')
            ->orderBy('time_slot_id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data jadwal mengajar berhasil diambil.',
            'data' => [
                'items' => collect($schedules->items())
                    ->map(fn(TrainingSchedule $schedule) => $this->formatSchedule($schedule))
                    ->values(),
                'pagination' => [
                    'current_page' => $schedules->currentPage(),
                    'last_page' => $schedules->lastPage(),
                    'per_page' => $schedules->perPage(),
                    'total' => $schedules->total(),
                ],
            ],
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $instructor = $this->getAuthenticatedInstructor($request);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Data instruktur tidak ditemukan.',
            ], 404);
        }

        $schedule = TrainingSchedule::query()
            ->with([
                'timeSlot',
                'vehicle',
                'coursePackage',
                'bookings' => function ($query) {
                    $query
                        ->whereIn('status', [
                            'Dikonfirmasi',
                            'Dijadwalkan Ulang',
                            'Selesai',
                        ])
                        ->with([
                            'participant.user',
                            'coursePackage',
                            'payment',
                            'bookingGroup.payment',
                            'trainingResult',
                        ])
                        ->orderBy('sesi_ke')
                        ->orderBy('id');
                },
            ])
            ->where('instructor_id', $instructor->id)
            ->find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal mengajar tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail jadwal mengajar berhasil diambil.',
            'data' => [
                'item' => $this->formatScheduleDetail($schedule),
            ],
        ]);
    }

    public function showPackage(Request $request, string $id): JsonResponse
    {
        $instructor = $this->getAuthenticatedInstructor($request);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Data instruktur tidak ditemukan.',
            ], 404);
        }

        $bookings = Booking::query()
            ->with([
                'participant.user',
                'coursePackage',
                'payment',
                'bookingGroup.payment',
                'trainingResult',
                'trainingSchedule.timeSlot',
                'trainingSchedule.vehicle',
                'trainingSchedule.coursePackage',
            ])
            ->where('booking_group_id', $id)
            ->whereIn('status', [
                'Dikonfirmasi',
                'Dijadwalkan Ulang',
                'Selesai',
            ])
            ->whereHas('trainingSchedule', function ($query) use ($instructor) {
                $query->where('instructor_id', $instructor->id);
            })
            ->orderBy('sesi_ke')
            ->orderBy('id')
            ->get();

        if ($bookings->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Detail paket jadwal mengajar tidak ditemukan.',
            ], 404);
        }

        $firstBooking = $bookings->first();
        $bookingGroup = $firstBooking?->bookingGroup;
        $participant = $firstBooking?->participant;
        $coursePackage = $firstBooking?->coursePackage;
        $firstSchedule = $firstBooking?->trainingSchedule;
        $firstVehicle = $firstSchedule?->vehicle;

        return response()->json([
            'success' => true,
            'message' => 'Detail paket jadwal mengajar berhasil diambil.',
            'data' => [
                'item' => [
                    'id' => $bookingGroup?->id ?? (int) $id,
                    'kode_group' => $bookingGroup?->kode_group,
                    'status' => $bookingGroup?->status,
                    'total_sesi' => (int) ($bookingGroup?->total_sesi ?? $firstBooking?->total_sesi ?? $bookings->count()),
                    'jumlah_sesi_selesai' => (int) ($bookingGroup?->jumlah_sesi_selesai ?? $bookings->where('status', 'Selesai')->count()),
                    'progress_label' => sprintf(
                        '%d/%d sesi',
                        (int) ($bookingGroup?->jumlah_sesi_selesai ?? $bookings->where('status', 'Selesai')->count()),
                        (int) ($bookingGroup?->total_sesi ?? $firstBooking?->total_sesi ?? $bookings->count())
                    ),
                    'participant' => $participant ? [
                        'id' => $participant->id,
                        'kode_peserta' => $participant->kode_peserta,
                        'nama_peserta' => $participant->user?->name,
                        'email' => $participant->user?->email,
                        'no_telepon' => $participant->user?->no_telepon,
                        'alamat' => $participant->user?->alamat,
                        'status_sertifikat' => $participant->status_sertifikat,
                    ] : null,
                    'course_package' => $coursePackage ? [
                        'id' => $coursePackage->id,
                        'kode_paket' => $coursePackage->kode_paket,
                        'nama_paket' => $coursePackage->nama_paket,
                        'durasi_jam' => (int) $coursePackage->durasi_jam,
                    ] : null,
                    'vehicle' => $firstVehicle ? [
                        'id' => $firstVehicle->id,
                        'kode_kendaraan' => $firstVehicle->kode_kendaraan,
                        'nama_kendaraan' => $firstVehicle->nama_kendaraan,
                        'model' => $firstVehicle->model,
                        'nomor_plat' => $firstVehicle->nomor_plat,
                        'transmisi' => $firstVehicle->transmisi,
                    ] : null,
                    'payment' => $bookingGroup?->payment ? [
                        'id' => $bookingGroup->payment->id,
                        'status' => $bookingGroup->payment->status,
                        'tanggal_upload' => DateFormatter::dateTime($bookingGroup->payment->tanggal_upload),
                        'tanggal_verifikasi' => DateFormatter::dateTime($bookingGroup->payment->tanggal_verifikasi),
                    ] : null,
                    'sessions' => $bookings
                        ->map(function (Booking $booking) {
                            return [
                                'booking_id' => $booking->id,
                                'kode_booking' => $booking->kode_booking,
                                'status_booking' => $booking->status,
                                'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),
                                'sesi_ke' => (int) ($booking->sesi_ke ?? 0),
                                'total_sesi' => (int) ($booking->total_sesi ?? 0),
                                'training_schedule' => $booking->trainingSchedule
                                    ? $this->formatSchedule($booking->trainingSchedule)
                                    : null,
                                'training_result' => $booking->trainingResult ? [
                                    'id' => $booking->trainingResult->id,
                                    'status_kehadiran' => $booking->trainingResult->status_kehadiran,
                                    'nilai_akhir' => $booking->trainingResult->nilai_akhir !== null
                                        ? (float) $booking->trainingResult->nilai_akhir
                                        : null,
                                    'status_kelulusan' => $booking->trainingResult->status_kelulusan,
                                    'catatan_instruktur' => $booking->trainingResult->catatan_instruktur,
                                ] : null,
                            ];
                        })
                        ->values(),
                ],
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

    private function formatSchedule(TrainingSchedule $schedule): array
    {
        $remainingCapacity = max(0, (int) $schedule->kapasitas - (int) $schedule->jumlah_booking);

        $data = [
            'id' => $schedule->id,
            'kode_jadwal' => $schedule->kode_jadwal,
            'tanggal_latihan' => DateFormatter::date($schedule->tanggal_latihan),

            'time_slot' => $schedule->timeSlot ? [
                'id' => $schedule->timeSlot->id,
                'kode_slot' => $schedule->timeSlot->kode_slot,
                'nama_slot' => $schedule->timeSlot->nama_slot,
                'subtitle' => $schedule->timeSlot->subtitle,
                'jam_mulai' => DateFormatter::time($schedule->timeSlot->jam_mulai),
                'jam_selesai' => DateFormatter::time($schedule->timeSlot->jam_selesai),
                'durasi_menit' => (int) $schedule->timeSlot->durasi_menit,
            ] : null,

            'vehicle' => $schedule->vehicle ? [
                'id' => $schedule->vehicle->id,
                'kode_kendaraan' => $schedule->vehicle->kode_kendaraan,
                'nama_kendaraan' => $schedule->vehicle->nama_kendaraan,
                'model' => $schedule->vehicle->model,
                'nomor_plat' => $schedule->vehicle->nomor_plat,
                'transmisi' => $schedule->vehicle->transmisi,
            ] : null,

            'course_package' => $schedule->coursePackage ? [
                'id' => $schedule->coursePackage->id,
                'kode_paket' => $schedule->coursePackage->kode_paket,
                'nama_paket' => $schedule->coursePackage->nama_paket,
                'durasi_jam' => (int) $schedule->coursePackage->durasi_jam,
            ] : null,

            'kapasitas' => (int) $schedule->kapasitas,
            'jumlah_booking' => (int) $schedule->jumlah_booking,
            'jumlah_peserta_valid' => (int) ($schedule->jumlah_peserta_valid ?? 0),
            'sisa_kapasitas' => $remainingCapacity,
            'status' => $schedule->status,
            'catatan' => $schedule->catatan,
            'created_at' => DateFormatter::dateTime($schedule->created_at),
            'updated_at' => DateFormatter::dateTime($schedule->updated_at),
        ];

        if ($schedule->relationLoaded('bookings')) {
            $data['peserta'] = $schedule->bookings
                ? $schedule->bookings
                    ->map(fn(Booking $booking) => $this->formatBookingForSchedule($booking))
                    ->values()
                : [];
        }

        return $data;
    }

    private function formatScheduleDetail(TrainingSchedule $schedule): array
    {
        $data = $this->formatSchedule($schedule);

        if (!array_key_exists('peserta', $data)) {
            $data['peserta'] = $schedule->bookings
                ? $schedule->bookings
                    ->map(fn(Booking $booking) => $this->formatBookingForSchedule($booking))
                    ->values()
                : [];
        }

        return $data;
    }

    private function formatBookingForSchedule(Booking $booking): array
    {
        $payment = $booking->payment ?? $booking->bookingGroup?->payment;

        return [
            'booking_id' => $booking->id,
            'kode_booking' => $booking->kode_booking,
            'booking_group_id' => $booking->booking_group_id,
            'sesi_ke' => (int) ($booking->sesi_ke ?? 0),
            'total_sesi' => (int) ($booking->total_sesi ?? 0),
            'status_booking' => $booking->status,
            'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),

            'booking_group' => $booking->bookingGroup ? [
                'id' => $booking->bookingGroup->id,
                'kode_group' => $booking->bookingGroup->kode_group,
                'status' => $booking->bookingGroup->status,
                'total_sesi' => (int) $booking->bookingGroup->total_sesi,
                'jumlah_sesi_selesai' => (int) $booking->bookingGroup->jumlah_sesi_selesai,
                'progress_label' => sprintf(
                    '%d/%d sesi',
                    (int) $booking->bookingGroup->jumlah_sesi_selesai,
                    (int) $booking->bookingGroup->total_sesi
                ),
            ] : null,

            'peserta' => $booking->participant ? [
                'id' => $booking->participant->id,
                'kode_peserta' => $booking->participant->kode_peserta,
                'nama_peserta' => $booking->participant->user?->name,
                'email' => $booking->participant->user?->email,
                'no_telepon' => $booking->participant->user?->no_telepon,
                'alamat' => $booking->participant->user?->alamat,
                'status_sertifikat' => $booking->participant->status_sertifikat,
            ] : null,

            'course_package' => $booking->coursePackage ? [
                'id' => $booking->coursePackage->id,
                'kode_paket' => $booking->coursePackage->kode_paket,
                'nama_paket' => $booking->coursePackage->nama_paket,
                'durasi_jam' => (int) $booking->coursePackage->durasi_jam,
            ] : null,

            'pakai_antar_jemput' => (bool) $booking->pakai_antar_jemput,
            'pakai_sim' => (bool) $booking->pakai_sim,
            'alamat_jemput' => $booking->alamat_jemput,
            'harga_paket' => (int) $booking->harga_paket,

            'payment' => $payment ? [
                'id' => $payment->id,
                'status' => $payment->status,
                'tanggal_upload' => DateFormatter::dateTime($payment->tanggal_upload),
                'tanggal_verifikasi' => DateFormatter::dateTime($payment->tanggal_verifikasi),
            ] : null,
        ];
    }
}
