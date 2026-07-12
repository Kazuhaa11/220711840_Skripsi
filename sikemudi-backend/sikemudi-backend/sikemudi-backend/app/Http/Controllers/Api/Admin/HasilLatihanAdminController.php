<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingGroup;
use App\Models\Participant;
use App\Models\TrainingResult;
use App\Support\DateFormatter;
use App\Support\TrainingResultEligibility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class HasilLatihanAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $groups = BookingGroup::query()
            ->with($this->trainingResultPackageRelations())
            ->whereHas('bookings.trainingResult')
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_group', 'like', "%{$keyword}%")
                        ->orWhere('status', 'like', "%{$keyword}%")
                        ->orWhereHas('participant.user', function ($userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%")
                                ->orWhere('no_telepon', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('coursePackage', function ($packageQuery) use ($keyword) {
                            $packageQuery
                                ->where('nama_paket', 'like', "%{$keyword}%")
                                ->orWhere('kode_paket', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('instructor.user', function ($userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('vehicle', function ($vehicleQuery) use ($keyword) {
                            $vehicleQuery
                                ->where('nama_kendaraan', 'like', "%{$keyword}%")
                                ->orWhere('nomor_plat', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('bookings', function ($bookingQuery) use ($keyword) {
                            $bookingQuery
                                ->where('kode_booking', 'like', "%{$keyword}%")
                                ->orWhereHas('trainingSchedule', function ($scheduleQuery) use ($keyword) {
                                    $scheduleQuery->where('kode_jadwal', 'like', "%{$keyword}%");
                                });
                        })
                        ->orWhereHas('bookings.trainingResult', function ($resultQuery) use ($keyword) {
                            $resultQuery
                                ->where('catatan_instruktur', 'like', "%{$keyword}%")
                                ->orWhere('catatan_admin', 'like', "%{$keyword}%")
                                ->orWhere('status_kelulusan', 'like', "%{$keyword}%")
                                ->orWhere('status_kehadiran', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('status_kehadiran'), function ($query) use ($request) {
                $query->whereHas('bookings.trainingResult', function ($resultQuery) use ($request) {
                    $resultQuery->where('status_kehadiran', $request->query('status_kehadiran'));
                });
            })
            ->when($request->filled('status_kelulusan'), function ($query) use ($request) {
                $query->whereHas('bookings.trainingResult', function ($resultQuery) use ($request) {
                    $resultQuery->where('status_kelulusan', $request->query('status_kelulusan'));
                });
            })
            ->when($request->filled('participant_id'), function ($query) use ($request) {
                $query->where('participant_id', $request->query('participant_id'));
            })
            ->when($request->filled('instructor_id'), function ($query) use ($request) {
                $query->where('instructor_id', $request->query('instructor_id'));
            })
            ->when($request->filled('training_schedule_id'), function ($query) use ($request) {
                $query->whereHas('bookings', function ($bookingQuery) use ($request) {
                    $bookingQuery->where('training_schedule_id', $request->query('training_schedule_id'));
                });
            })
            ->when($request->filled('tanggal'), function ($query) use ($request) {
                $query->whereHas('bookings.trainingSchedule', function ($scheduleQuery) use ($request) {
                    $scheduleQuery->whereDate('tanggal_latihan', $request->query('tanggal'));
                });
            })
            ->when($request->filled('tanggal_mulai'), function ($query) use ($request) {
                $query->whereHas('bookings.trainingSchedule', function ($scheduleQuery) use ($request) {
                    $scheduleQuery->whereDate('tanggal_latihan', '>=', $request->query('tanggal_mulai'));
                });
            })
            ->when($request->filled('tanggal_selesai'), function ($query) use ($request) {
                $query->whereHas('bookings.trainingSchedule', function ($scheduleQuery) use ($request) {
                    $scheduleQuery->whereDate('tanggal_latihan', '<=', $request->query('tanggal_selesai'));
                });
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data hasil latihan paket berhasil diambil.',
            'data' => [
                'items' => collect($groups->items())
                    ->map(fn (BookingGroup $group) => $this->formatTrainingResultPackage($group))
                    ->values(),
                'pagination' => [
                    'current_page' => $groups->currentPage(),
                    'last_page' => $groups->lastPage(),
                    'per_page' => $groups->perPage(),
                    'total' => $groups->total(),
                ],
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $result = TrainingResult::query()
            ->with($this->trainingResultRelations())
            ->find($id);

        if (! $result) {
            return response()->json([
                'success' => false,
                'message' => 'Hasil latihan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail hasil latihan berhasil diambil.',
            'data' => [
                'item' => $this->formatTrainingResult($result),
            ],
        ]);
    }

    public function validasiKelulusan(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status_kelulusan' => ['nullable', Rule::in(['Lulus'])],
            'catatan_admin' => ['nullable', 'string'],
        ], [
            'status_kelulusan.in' => 'Validasi sertifikat hanya dapat dilakukan untuk hasil akhir berstatus Lulus.',
        ]);

        $transactionResult = DB::transaction(function () use ($request, $id, $validated) {
            /** @var TrainingResult|null $result */
            $result = TrainingResult::query()
                ->with($this->trainingResultRelations())
                ->lockForUpdate()
                ->find($id);

            if (! $result) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Hasil latihan tidak ditemukan.',
                ];
            }

            $eligibility = TrainingResultEligibility::resolve($result);

            if (! $eligibility['is_final_session']) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Validasi kelulusan hanya dapat dilakukan pada sesi terakhir paket.',
                ];
            }

            if (! $eligibility['is_package_completed']) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Paket latihan peserta belum selesai, hasil akhir belum dapat divalidasi.',
                ];
            }

            if (! $eligibility['has_passing_final_result']) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Validasi sertifikat hanya dapat dilakukan untuk hasil akhir berstatus Lulus dengan nilai akhir minimal 70 dan kehadiran Hadir.',
                ];
            }

            if ($eligibility['has_active_certificate']) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Hasil latihan sudah memiliki sertifikat aktif sehingga tidak perlu divalidasi ulang.',
                ];
            }

            if ($result->validated_at) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Hasil akhir ini sudah divalidasi oleh admin dan siap diterbitkan sertifikat.',
                ];
            }

            $validatedAt = now();
            $adminNote = $validated['catatan_admin'] ?? $result->catatan_admin;
            $bookingGroup = $result->booking?->bookingGroup;

            if ($bookingGroup) {
                $groupResultIds = TrainingResult::query()
                    ->whereHas('booking', function ($bookingQuery) use ($bookingGroup) {
                        $bookingQuery->where('booking_group_id', $bookingGroup->id);
                    })
                    ->pluck('id');

                TrainingResult::query()
                    ->whereIn('id', $groupResultIds)
                    ->update([
                        'validated_by' => $request->user()->id,
                        'validated_at' => $validatedAt,
                        'updated_by' => $request->user()->id,
                        'updated_at' => $validatedAt,
                    ]);

                $result->update([
                    'status_kelulusan' => 'Lulus',
                    'catatan_admin' => $adminNote,
                    'validated_by' => $request->user()->id,
                    'validated_at' => $validatedAt,
                    'updated_by' => $request->user()->id,
                ]);
            } else {
                $result->update([
                    'status_kelulusan' => 'Lulus',
                    'catatan_admin' => $adminNote,
                    'validated_by' => $request->user()->id,
                    'validated_at' => $validatedAt,
                    'updated_by' => $request->user()->id,
                ]);
            }

            /** @var Participant|null $participant */
            $participant = Participant::query()
                ->lockForUpdate()
                ->find($result->participant_id);

            if ($participant) {
                $this->syncParticipantCertificateStatus($participant);
            }

            $result = $result->fresh($this->trainingResultRelations());

            return [
                'error' => false,
                'training_result' => $result,
            ];
        });

        if ($transactionResult['error']) {
            return response()->json([
                'success' => false,
                'message' => $transactionResult['message'],
            ], $transactionResult['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Hasil akhir berhasil divalidasi. Peserta sudah masuk kandidat penerbitan sertifikat.',
            'data' => [
                'item' => $this->formatTrainingResult($transactionResult['training_result']),
            ],
        ]);
    }

    private function trainingResultRelations(): array
    {
        return [
            'booking.coursePackage',
            'booking.bookingGroup.payment',
            'certificate',
            'participant.user',
            'trainingSchedule.timeSlot',
            'trainingSchedule.vehicle',
            'trainingSchedule.coursePackage',
            'instructor.user',
            'creator',
            'updater',
            'validator',
        ];
    }

    private function trainingResultPackageRelations(): array
    {
        return [
            'participant.user',
            'coursePackage',
            'instructor.user',
            'vehicle',
            'payment',
            'bookings' => function ($query) {
                $query->orderBy('sesi_ke')->orderBy('id');
            },
            'bookings.coursePackage',
            'bookings.bookingGroup.payment',
            'bookings.trainingSchedule.timeSlot',
            'bookings.trainingSchedule.vehicle',
            'bookings.trainingSchedule.coursePackage',
            'bookings.trainingResult.certificate',
            'bookings.trainingResult.participant.user',
            'bookings.trainingResult.trainingSchedule.timeSlot',
            'bookings.trainingResult.trainingSchedule.vehicle',
            'bookings.trainingResult.trainingSchedule.coursePackage',
            'bookings.trainingResult.instructor.user',
            'bookings.trainingResult.creator',
            'bookings.trainingResult.updater',
            'bookings.trainingResult.validator',
        ];
    }

    private function formatTrainingResultPackage(BookingGroup $group): array
    {
        $results = $group->bookings
            ? $group->bookings
                ->sortBy(fn (Booking $booking) => (int) ($booking->sesi_ke ?: $booking->id))
                ->map(fn (Booking $booking) => $booking->trainingResult)
                ->filter()
                ->values()
            : collect();

        $results->each(function (TrainingResult $result) {
            $result->loadMissing($this->trainingResultRelations());
        });

        $finalResult = $results
            ->first(function (TrainingResult $result) {
                return TrainingResultEligibility::resolve($result)['is_final_session'];
            }) ?: $results->last();

        $finalEligibility = $finalResult
            ? TrainingResultEligibility::resolve($finalResult)
            : [
                'can_validate_certificate' => false,
                'can_issue_certificate' => false,
                'validation_status' => 'Dalam Proses',
                'is_package_completed' => false,
                'progress_label' => (int) $group->jumlah_sesi_selesai . '/' . (int) $group->total_sesi . ' sesi',
            ];

        $sessions = $results
            ->map(fn (TrainingResult $result) => $this->formatTrainingResult($result))
            ->values();

        $firstBooking = $group->bookings?->first();
        $firstSchedule = $firstBooking?->trainingSchedule;
        $lastSchedule = $group->bookings?->last()?->trainingSchedule;
        $dateRange = $this->formatPackageDateRange($group);
        $payment = $group->payment;

        return [
            'id' => $group->id,
            'booking_group_id' => $group->id,
            'kode_group' => $group->kode_group,
            'status' => $group->status,
            'total_sesi' => (int) $group->total_sesi,
            'jumlah_sesi_selesai' => (int) $group->jumlah_sesi_selesai,
            'progress_label' => (int) $group->jumlah_sesi_selesai . '/' . (int) $group->total_sesi . ' sesi',
            'tanggal_booking' => DateFormatter::dateTime($group->tanggal_booking),
            'tanggal_dikonfirmasi' => DateFormatter::dateTime($group->tanggal_dikonfirmasi),
            'tanggal_dibatalkan' => DateFormatter::dateTime($group->tanggal_dibatalkan),
            'tanggal_mulai' => DateFormatter::date($firstSchedule?->tanggal_latihan),
            'tanggal_selesai' => DateFormatter::date($lastSchedule?->tanggal_latihan),
            'tanggal_range' => $dateRange,
            'payment_status' => $payment?->status,
            'status_kehadiran' => $finalResult?->status_kehadiran,
            'status_kelulusan' => $finalResult?->status_kelulusan,
            'nilai_akhir' => $finalResult?->nilai_akhir !== null ? (float) $finalResult->nilai_akhir : null,
            'can_validate_certificate' => (bool) ($finalEligibility['can_validate_certificate'] ?? false),
            'can_issue_certificate' => (bool) ($finalEligibility['can_issue_certificate'] ?? false),
            'validation_status' => $finalEligibility['validation_status'] ?? 'Dalam Proses',
            'is_package_completed' => (bool) ($finalEligibility['is_package_completed'] ?? false),
            'validated_at' => DateFormatter::dateTime($finalResult?->validated_at),
            'participant' => $group->participant ? [
                'id' => $group->participant->id,
                'kode_peserta' => $group->participant->kode_peserta,
                'nama_peserta' => $group->participant->user?->name,
                'email' => $group->participant->user?->email,
                'no_telepon' => $group->participant->user?->no_telepon,
                'alamat' => $group->participant->user?->alamat,
                'tanggal_lahir' => DateFormatter::date($group->participant->tanggal_lahir),
                'gender' => $group->participant->gender,
                'status_sertifikat' => $group->participant->status_sertifikat,
                'jumlah_sesi_selesai' => (int) $group->participant->jumlah_sesi_selesai,
                'jumlah_sesi_total' => (int) $group->participant->jumlah_sesi_total,
                'jumlah_absen' => (int) $group->participant->jumlah_absen,
            ] : null,
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
                'email' => $group->instructor->user?->email,
                'no_telepon' => $group->instructor->user?->no_telepon,
            ] : null,
            'vehicle' => $group->vehicle ? [
                'id' => $group->vehicle->id,
                'kode_kendaraan' => $group->vehicle->kode_kendaraan,
                'nama_kendaraan' => $group->vehicle->nama_kendaraan,
                'nomor_plat' => $group->vehicle->nomor_plat,
                'transmisi' => $group->vehicle->transmisi,
            ] : null,
            'final_result' => $finalResult ? $this->formatTrainingResult($finalResult) : null,
            'sessions' => $sessions,
            'created_at' => DateFormatter::dateTime($group->created_at),
            'updated_at' => DateFormatter::dateTime($group->updated_at),
        ];
    }

    private function formatPackageDateRange(BookingGroup $group): string
    {
        $dates = $group->bookings
            ? $group->bookings
                ->map(fn (Booking $booking) => $booking->trainingSchedule?->tanggal_latihan)
                ->filter()
                ->map(fn ($date) => DateFormatter::date($date))
                ->values()
            : collect();

        if ($dates->isEmpty()) {
            return 'Tanggal belum tersedia';
        }

        $first = $dates->first();
        $last = $dates->last();

        if ($first === $last) {
            return $first;
        }

        return $first . ' - ' . $last;
    }

    private function syncParticipantCertificateStatus(Participant $participant): void
    {
        if ($participant->certificates()->where('status', 'Terbit')->exists()) {
            $participant->update([
                'status_sertifikat' => 'Terbit',
            ]);

            return;
        }

        if ((int) $participant->jumlah_sesi_selesai > 0 || $participant->trainingResults()->exists()) {
            $participant->update([
                'status_sertifikat' => 'Dalam Proses',
            ]);

            return;
        }

        $participant->update([
            'status_sertifikat' => 'Belum Ada',
        ]);
    }

    private function formatTrainingResult(TrainingResult $result): array
    {
        $result->loadMissing($this->trainingResultRelations());

        $eligibility = TrainingResultEligibility::resolve($result);

        return [
            'id' => $result->id,
            'booking_id' => $result->booking_id,
            'booking_group_id' => $eligibility['booking_group_id'],
            'sesi_ke' => $eligibility['sesi_ke'],
            'total_sesi' => $eligibility['total_sesi'],
            'session_label' => $eligibility['session_label'],
            'is_final_session' => $eligibility['is_final_session'],
            'jumlah_sesi_selesai' => $eligibility['jumlah_sesi_selesai'],
            'progress_label' => $eligibility['progress_label'],
            'is_package_completed' => $eligibility['is_package_completed'],
            'can_validate_certificate' => $eligibility['can_validate_certificate'],
            'can_issue_certificate' => $eligibility['can_issue_certificate'],
            'validation_status' => $eligibility['validation_status'],
            'validated_at' => DateFormatter::dateTime($result->validated_at),
            'tanggal_latihan' => DateFormatter::date($result->tanggal_latihan),

            'status_kehadiran' => $result->status_kehadiran,
            'nilai_praktik' => $result->nilai_praktik !== null ? (float) $result->nilai_praktik : null,
            'nilai_sikap' => $result->nilai_sikap !== null ? (float) $result->nilai_sikap : null,
            'nilai_pemahaman' => $result->nilai_pemahaman !== null ? (float) $result->nilai_pemahaman : null,
            'nilai_akhir' => $result->nilai_akhir !== null ? (float) $result->nilai_akhir : null,

            'status_kelulusan' => $result->status_kelulusan,
            'catatan_instruktur' => $result->catatan_instruktur,
            'catatan_admin' => $result->catatan_admin,

            'booking' => $result->booking ? [
                'id' => $result->booking->id,
                'kode_booking' => $result->booking->kode_booking,
                'booking_group_id' => $result->booking->booking_group_id,
                'sesi_ke' => (int) ($result->booking->sesi_ke ?: 1),
                'total_sesi' => (int) ($result->booking->total_sesi ?: $result->booking->bookingGroup?->total_sesi ?: 1),
                'status' => $result->booking->status,
                'harga_paket' => (int) $result->booking->harga_paket,
                'pakai_antar_jemput' => (bool) $result->booking->pakai_antar_jemput,
                'pakai_sim' => (bool) $result->booking->pakai_sim,
                'alamat_jemput' => $result->booking->alamat_jemput,
                'course_package' => $result->booking->coursePackage ? [
                    'id' => $result->booking->coursePackage->id,
                    'kode_paket' => $result->booking->coursePackage->kode_paket,
                    'nama_paket' => $result->booking->coursePackage->nama_paket,
                    'durasi_jam' => (int) $result->booking->coursePackage->durasi_jam,
                ] : null,
                'booking_group' => $result->booking->bookingGroup ? [
                    'id' => $result->booking->bookingGroup->id,
                    'kode_group' => $result->booking->bookingGroup->kode_group,
                    'status' => $result->booking->bookingGroup->status,
                    'total_sesi' => (int) $result->booking->bookingGroup->total_sesi,
                    'jumlah_sesi_selesai' => (int) $result->booking->bookingGroup->jumlah_sesi_selesai,
                    'progress_label' => (int) $result->booking->bookingGroup->jumlah_sesi_selesai . '/' . (int) $result->booking->bookingGroup->total_sesi . ' sesi',
                ] : null,
            ] : null,

            'peserta' => $result->participant ? [
                'id' => $result->participant->id,
                'kode_peserta' => $result->participant->kode_peserta,
                'nama_peserta' => $result->participant->user?->name,
                'email' => $result->participant->user?->email,
                'no_telepon' => $result->participant->user?->no_telepon,
                'alamat' => $result->participant->user?->alamat,
                'tanggal_lahir' => DateFormatter::date($result->participant->tanggal_lahir),
                'gender' => $result->participant->gender,
                'status_sertifikat' => $result->participant->status_sertifikat,
                'jumlah_sesi_selesai' => (int) $result->participant->jumlah_sesi_selesai,
                'jumlah_sesi_total' => (int) $result->participant->jumlah_sesi_total,
                'jumlah_absen' => (int) $result->participant->jumlah_absen,
            ] : null,

            'training_schedule' => $result->trainingSchedule ? [
                'id' => $result->trainingSchedule->id,
                'kode_jadwal' => $result->trainingSchedule->kode_jadwal,
                'tanggal_latihan' => DateFormatter::date($result->trainingSchedule->tanggal_latihan),
                'status' => $result->trainingSchedule->status,
                'time_slot' => $result->trainingSchedule->timeSlot ? [
                    'id' => $result->trainingSchedule->timeSlot->id,
                    'nama_slot' => $result->trainingSchedule->timeSlot->nama_slot,
                    'jam_mulai' => DateFormatter::time($result->trainingSchedule->timeSlot->jam_mulai),
                    'jam_selesai' => DateFormatter::time($result->trainingSchedule->timeSlot->jam_selesai),
                    'durasi_menit' => (int) $result->trainingSchedule->timeSlot->durasi_menit,
                ] : null,
                'vehicle' => $result->trainingSchedule->vehicle ? [
                    'id' => $result->trainingSchedule->vehicle->id,
                    'kode_kendaraan' => $result->trainingSchedule->vehicle->kode_kendaraan,
                    'nama_kendaraan' => $result->trainingSchedule->vehicle->nama_kendaraan,
                    'nomor_plat' => $result->trainingSchedule->vehicle->nomor_plat,
                    'transmisi' => $result->trainingSchedule->vehicle->transmisi,
                ] : null,
                'course_package' => $result->trainingSchedule->coursePackage ? [
                    'id' => $result->trainingSchedule->coursePackage->id,
                    'kode_paket' => $result->trainingSchedule->coursePackage->kode_paket,
                    'nama_paket' => $result->trainingSchedule->coursePackage->nama_paket,
                    'durasi_jam' => (int) $result->trainingSchedule->coursePackage->durasi_jam,
                ] : null,
            ] : null,

            'instructor' => $result->instructor ? [
                'id' => $result->instructor->id,
                'kode_instruktur' => $result->instructor->kode_instruktur,
                'nama_instruktur' => $result->instructor->user?->name,
                'email' => $result->instructor->user?->email,
                'no_telepon' => $result->instructor->user?->no_telepon,
            ] : null,

            'created_by' => $result->creator ? [
                'id' => $result->creator->id,
                'name' => $result->creator->name,
                'email' => $result->creator->email,
            ] : null,

            'updated_by' => $result->updater ? [
                'id' => $result->updater->id,
                'name' => $result->updater->name,
                'email' => $result->updater->email,
            ] : null,

            'validated_by' => $result->validator ? [
                'id' => $result->validator->id,
                'name' => $result->validator->name,
                'email' => $result->validator->email,
            ] : null,

            'created_at' => DateFormatter::dateTime($result->created_at),
            'updated_at' => DateFormatter::dateTime($result->updated_at),
        ];
    }
}
