<?php

namespace App\Http\Controllers\Api\Instruktur;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Instructor;
use App\Models\Participant;
use App\Models\TrainingResult;
use App\Models\TrainingSchedule;
use App\Support\BookingCapacityManager;
use App\Support\DateFormatter;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class HasilLatihanController extends Controller
{
    public function kandidat(Request $request): JsonResponse
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

        $bookings = Booking::query()
            ->with([
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.vehicle',
                'coursePackage',
                'payment',
                'bookingGroup.payment',
            ])
            ->whereIn('status', ['Dikonfirmasi', 'Dijadwalkan Ulang'])
            ->whereDoesntHave('trainingResult')
            ->whereHas('trainingSchedule', function ($query) use ($instructor, $request) {
                $query->where('instructor_id', $instructor->id);

                if ($request->filled('tanggal')) {
                    $query->whereDate('tanggal_latihan', $request->query('tanggal'));
                }

                if ($request->filled('tanggal_mulai')) {
                    $query->whereDate('tanggal_latihan', '>=', $request->query('tanggal_mulai'));
                }

                if ($request->filled('tanggal_selesai')) {
                    $query->whereDate('tanggal_latihan', '<=', $request->query('tanggal_selesai'));
                }
            })
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('kode_booking', 'like', "%{$keyword}%")
                        ->orWhereHas('participant.user', function ($userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%")
                                ->orWhere('no_telepon', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('trainingSchedule', function ($scheduleQuery) use ($keyword) {
                            $scheduleQuery->where('kode_jadwal', 'like', "%{$keyword}%");
                        });
                });
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data kandidat hasil latihan berhasil diambil.',
            'data' => [
                'items' => collect($bookings->items())
                    ->map(fn(Booking $booking) => $this->formatCandidateBooking($booking))
                    ->values(),
                'pagination' => [
                    'current_page' => $bookings->currentPage(),
                    'last_page' => $bookings->lastPage(),
                    'per_page' => $bookings->perPage(),
                    'total' => $bookings->total(),
                ],
            ],
        ]);
    }

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

        $results = TrainingResult::query()
            ->with([
                'booking.coursePackage',
                'booking.bookingGroup.payment',
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.vehicle',
                'instructor.user',
                'creator',
                'updater',
            ])
            ->where('instructor_id', $instructor->id)
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('catatan_instruktur', 'like', "%{$keyword}%")
                        ->orWhere('status_kelulusan', 'like', "%{$keyword}%")
                        ->orWhereHas('booking', function ($bookingQuery) use ($keyword) {
                            $bookingQuery->where('kode_booking', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('participant.user', function ($userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('trainingSchedule', function ($scheduleQuery) use ($keyword) {
                            $scheduleQuery->where('kode_jadwal', 'like', "%{$keyword}%");
                        });
                });
            })
            ->when($request->filled('status_kehadiran'), function ($query) use ($request) {
                $query->where('status_kehadiran', $request->query('status_kehadiran'));
            })
            ->when($request->filled('status_kelulusan'), function ($query) use ($request) {
                $query->where('status_kelulusan', $request->query('status_kelulusan'));
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
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data hasil latihan berhasil diambil.',
            'data' => [
                'items' => collect($results->items())
                    ->map(fn(TrainingResult $result) => $this->formatTrainingResult($result))
                    ->values(),
                'pagination' => [
                    'current_page' => $results->currentPage(),
                    'last_page' => $results->lastPage(),
                    'per_page' => $results->perPage(),
                    'total' => $results->total(),
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $instructor = $this->getAuthenticatedInstructor($request);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Data instruktur tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'booking_id' => ['required', 'exists:bookings,id', 'unique:training_results,booking_id'],
            'status_kehadiran' => ['required', Rule::in(['Hadir', 'Tidak Hadir', 'Izin'])],
            'nilai_praktik' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'nilai_sikap' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'nilai_pemahaman' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'nilai_akhir' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'status_kelulusan' => ['nullable', Rule::in(['Belum Dinilai', 'Lulus', 'Tidak Lulus'])],
            'catatan_instruktur' => ['nullable', 'string'],
        ], [
            'booking_id.required' => 'Booking wajib dipilih.',
            'booking_id.exists' => 'Booking tidak ditemukan.',
            'booking_id.unique' => 'Booking ini sudah memiliki hasil latihan.',
            'status_kehadiran.required' => 'Status kehadiran wajib diisi.',
            'status_kehadiran.in' => 'Status kehadiran tidak valid.',
        ]);

        $result = DB::transaction(function () use ($request, $instructor, $validated) {
            /** @var Booking|null $booking */
            $booking = Booking::query()
                ->with([
                    'participant',
                    'trainingSchedule',
                    'coursePackage',
                    'payment',
                    'bookingGroup.payment',
                ])
                ->lockForUpdate()
                ->find($validated['booking_id']);

            if (!$booking) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Booking tidak ditemukan.',
                ];
            }

            if (!in_array($booking->status, ['Dikonfirmasi', 'Dijadwalkan Ulang'], true)) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Hasil latihan hanya dapat diinput untuk booking yang sudah dikonfirmasi.',
                ];
            }

            if (!$booking->isPaymentConfirmed()) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Hasil latihan tidak dapat diinput karena pembayaran belum terkonfirmasi.',
                ];
            }

            /** @var TrainingSchedule|null $schedule */
            $schedule = $booking->trainingSchedule;

            if (!$schedule || (int) $schedule->instructor_id !== (int) $instructor->id) {
                return [
                    'error' => true,
                    'status' => 403,
                    'message' => 'Anda tidak memiliki akses untuk menginput hasil latihan pada booking ini.',
                ];
            }

            $inputWindow = $this->resolveResultInputWindow($schedule);

            if (!$inputWindow['can_input']) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => $inputWindow['message'],
                ];
            }

            $sessionContext = $this->resolveSessionContext($booking);
            $evaluation = $this->resolveTrainingResultEvaluation($validated, $sessionContext);

            $trainingResult = TrainingResult::create([
                'booking_id' => $booking->id,
                'participant_id' => $booking->participant_id,
                'training_schedule_id' => $booking->training_schedule_id,
                'instructor_id' => $instructor->id,
                'tanggal_latihan' => $schedule->tanggal_latihan,
                'status_kehadiran' => $validated['status_kehadiran'],
                'nilai_praktik' => $evaluation['nilai_praktik'],
                'nilai_sikap' => $evaluation['nilai_sikap'],
                'nilai_pemahaman' => $evaluation['nilai_pemahaman'],
                'nilai_akhir' => $evaluation['nilai_akhir'],
                'status_kelulusan' => $evaluation['status_kelulusan'],
                'catatan_instruktur' => $validated['catatan_instruktur'] ?? null,
                'catatan_admin' => null,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            $booking->update([
                'status' => 'Selesai',
            ]);

            $this->syncFinishedSessionScheduleAvailability($schedule);

            /** @var Participant|null $participant */
            $participant = Participant::query()
                ->lockForUpdate()
                ->find($booking->participant_id);

            if ($participant && $validated['status_kehadiran'] === 'Tidak Hadir') {
                $participant->increment('jumlah_absen');
                $participant->refresh();
            }

            $this->syncCompletedSessionProgress($booking, $participant, true);

            if ($participant) {
                $participant->refresh();
                $this->syncParticipantCertificateStatus($participant);
            }

            $trainingResult = $trainingResult->fresh([
                'booking.coursePackage',
                'booking.bookingGroup.payment',
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.vehicle',
                'instructor.user',
                'creator',
                'updater',
            ]);

            return [
                'error' => false,
                'training_result' => $trainingResult,
            ];
        });

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Hasil latihan berhasil disimpan.',
            'data' => [
                'item' => $this->formatTrainingResult($result['training_result']),
            ],
        ], 201);
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

        $result = TrainingResult::query()
            ->with([
                'booking.coursePackage',
                'booking.bookingGroup.payment',
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.vehicle',
                'instructor.user',
                'creator',
                'updater',
            ])
            ->where('instructor_id', $instructor->id)
            ->find($id);

        if (!$result) {
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

    public function update(Request $request, string $id): JsonResponse
    {
        $instructor = $this->getAuthenticatedInstructor($request);

        if (!$instructor) {
            return response()->json([
                'success' => false,
                'message' => 'Data instruktur tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'status_kehadiran' => ['required', Rule::in(['Hadir', 'Tidak Hadir', 'Izin'])],
            'nilai_praktik' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'nilai_sikap' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'nilai_pemahaman' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'nilai_akhir' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'status_kelulusan' => ['nullable', Rule::in(['Belum Dinilai', 'Lulus', 'Tidak Lulus'])],
            'catatan_instruktur' => ['nullable', 'string'],
        ], [
            'status_kehadiran.required' => 'Status kehadiran wajib diisi.',
            'status_kelulusan.required' => 'Status kelulusan wajib diisi.',
        ]);

        $result = DB::transaction(function () use ($request, $instructor, $id, $validated) {
            /** @var TrainingResult|null $trainingResult */
            $trainingResult = TrainingResult::query()
                ->with(['booking.bookingGroup.payment', 'participant', 'certificate'])
                ->where('instructor_id', $instructor->id)
                ->lockForUpdate()
                ->find($id);

            if (!$trainingResult) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Hasil latihan tidak ditemukan.',
                ];
            }

            if ($trainingResult->booking && $trainingResult->booking->status === 'Selesai') {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Hasil latihan yang sudah selesai tidak dapat diubah kembali.',
                ];
            }

            if ($trainingResult->certificate && in_array($trainingResult->certificate->status, ['Draft', 'Terbit'], true)) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Hasil latihan tidak dapat diubah karena sudah memiliki sertifikat aktif. Cabut sertifikat terlebih dahulu jika data perlu diperbaiki.',
                ];
            }

            $sessionContext = $this->resolveSessionContext($trainingResult->booking);
            $evaluation = $this->resolveTrainingResultEvaluation($validated, $sessionContext);

            $oldAttendanceStatus = $trainingResult->status_kehadiran;

            $trainingResult->update([
                'status_kehadiran' => $validated['status_kehadiran'],
                'nilai_praktik' => $evaluation['nilai_praktik'],
                'nilai_sikap' => $evaluation['nilai_sikap'],
                'nilai_pemahaman' => $evaluation['nilai_pemahaman'],
                'nilai_akhir' => $evaluation['nilai_akhir'],
                'status_kelulusan' => $evaluation['status_kelulusan'],
                'catatan_instruktur' => $validated['catatan_instruktur'] ?? null,
                'updated_by' => $request->user()->id,
            ]);

            /** @var Participant|null $participant */
            $participant = Participant::query()
                ->lockForUpdate()
                ->find($trainingResult->participant_id);

            if ($participant) {
                $this->applyAttendanceCounterDelta(
                    $participant,
                    $oldAttendanceStatus,
                    $validated['status_kehadiran']
                );

                $this->syncCompletedSessionProgress($trainingResult->booking, $participant, false);
                $this->syncParticipantCertificateStatus($participant);
            } else {
                $this->syncCompletedSessionProgress($trainingResult->booking, null, false);
            }

            $trainingResult = $trainingResult->fresh([
                'booking.coursePackage',
                'booking.bookingGroup.payment',
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.vehicle',
                'instructor.user',
                'creator',
                'updater',
            ]);

            return [
                'error' => false,
                'training_result' => $trainingResult,
            ];
        });

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Hasil latihan berhasil diperbarui.',
            'data' => [
                'item' => $this->formatTrainingResult($result['training_result']),
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

    private function resolveSessionContext(?Booking $booking): array
    {
        $sesiKe = max(1, (int) ($booking?->sesi_ke ?: 1));
        $totalSesi = max(1, (int) ($booking?->total_sesi ?: $booking?->bookingGroup?->total_sesi ?: 1));

        return [
            'sesi_ke' => $sesiKe,
            'total_sesi' => $totalSesi,
            'is_final_session' => $sesiKe >= $totalSesi,
            'progress_label' => $sesiKe . '/' . $totalSesi . ' sesi',
        ];
    }

    private function resolveResultInputWindow(?TrainingSchedule $schedule): array
    {
        if (!$schedule?->tanggal_latihan) {
            return [
                'can_input' => false,
                'message' => 'Tanggal jadwal latihan tidak ditemukan.',
                'available_from' => null,
                'available_until' => null,
            ];
        }

        $sessionDate = Carbon::parse($schedule->tanggal_latihan)->startOfDay();
        $availableUntil = $sessionDate->copy()->addDays(7)->endOfDay();
        $today = now();

        if ($sessionDate->gt($today->copy()->startOfDay())) {
            return [
                'can_input' => false,
                'message' => 'Hasil latihan belum dapat diinput karena jadwal latihan belum berlangsung.',
                'available_from' => DateFormatter::date($sessionDate),
                'available_until' => DateFormatter::date($availableUntil),
            ];
        }

        if ($availableUntil->lt($today)) {
            return [
                'can_input' => false,
                'message' => 'Batas input hasil latihan sudah lewat. Hasil latihan hanya dapat diinput sampai H+7 dari tanggal sesi.',
                'available_from' => DateFormatter::date($sessionDate),
                'available_until' => DateFormatter::date($availableUntil),
            ];
        }

        return [
            'can_input' => true,
            'message' => null,
            'available_from' => DateFormatter::date($sessionDate),
            'available_until' => DateFormatter::date($availableUntil),
        ];
    }

    private function resolveTrainingResultEvaluation(array $validated, array $sessionContext): array
    {
        if (!$sessionContext['is_final_session']) {
            return [
                'nilai_praktik' => null,
                'nilai_sikap' => null,
                'nilai_pemahaman' => null,
                'nilai_akhir' => null,
                'status_kelulusan' => 'Belum Dinilai',
            ];
        }

        if (($validated['status_kehadiran'] ?? null) !== 'Hadir') {
            return [
                'nilai_praktik' => null,
                'nilai_sikap' => null,
                'nilai_pemahaman' => null,
                'nilai_akhir' => null,
                'status_kelulusan' => 'Tidak Lulus',
            ];
        }

        $practiceScore = $this->normalizeNullableScore($validated['nilai_praktik'] ?? null);
        $attitudeScore = $this->normalizeNullableScore($validated['nilai_sikap'] ?? null);
        $understandingScore = $this->normalizeNullableScore($validated['nilai_pemahaman'] ?? null);
        $finalScore = $this->resolveFinalScore($practiceScore, $attitudeScore, $understandingScore, null);

        return [
            'nilai_praktik' => $practiceScore,
            'nilai_sikap' => $attitudeScore,
            'nilai_pemahaman' => $understandingScore,
            'nilai_akhir' => $finalScore,
            'status_kelulusan' => $this->resolveGraduationStatus($validated['status_kehadiran'], $finalScore),
        ];
    }

    private function normalizeNullableScore(mixed $score): ?float
    {
        if ($score === null || $score === '') {
            return null;
        }

        return round((float) $score, 2);
    }

    private function syncFinishedSessionScheduleAvailability(?TrainingSchedule $schedule): void
    {
        if (!$schedule) {
            return;
        }

        $lockedSchedule = TrainingSchedule::query()
            ->lockForUpdate()
            ->find($schedule->id);

        if (!$lockedSchedule) {
            return;
        }

        BookingCapacityManager::syncFromBookings($lockedSchedule);
    }

    private function syncCompletedSessionProgress(
        ?Booking $booking,
        ?Participant $participant,
        bool $isNewResult
    ): void {
        if (!$booking) {
            return;
        }

        $group = $booking->bookingGroup()->lockForUpdate()->first();

        if ($group) {
            $completedSessions = Booking::query()
                ->where('booking_group_id', $group->id)
                ->where(function ($query) {
                    $query
                        ->where('status', 'Selesai')
                        ->orWhereHas('trainingResult');
                })
                ->count();

            $completedSessions = min(
                (int) $group->total_sesi,
                max(0, (int) $completedSessions)
            );

            $groupUpdates = [
                'jumlah_sesi_selesai' => $completedSessions,
            ];

            if ((int) $group->total_sesi > 0 && $completedSessions >= (int) $group->total_sesi) {
                $groupUpdates['status'] = 'Selesai';
            }

            $group->update($groupUpdates);
            $group->refresh();

            if ($participant) {
                $participantUpdates = [
                    'jumlah_sesi_selesai' => $completedSessions,
                ];

                if ((int) $participant->jumlah_sesi_total <= 0 && (int) $group->total_sesi > 0) {
                    $participantUpdates['jumlah_sesi_total'] = (int) $group->total_sesi;
                }

                if ((int) ($participantUpdates['jumlah_sesi_total'] ?? $participant->jumlah_sesi_total) > 0) {
                    $participantUpdates['jumlah_sesi_selesai'] = min(
                        (int) ($participantUpdates['jumlah_sesi_total'] ?? $participant->jumlah_sesi_total),
                        $completedSessions
                    );
                }

                $participant->update($participantUpdates);
                $participant->refresh();
            }

            return;
        }

        if (!$participant || !$isNewResult) {
            return;
        }

        $totalSessions = (int) ($participant->jumlah_sesi_total ?: $booking->total_sesi ?: 0);
        $completedSessions = (int) $participant->jumlah_sesi_selesai + 1;

        if ($totalSessions > 0) {
            $completedSessions = min($completedSessions, $totalSessions);
        }

        $participantUpdates = [
            'jumlah_sesi_selesai' => $completedSessions,
        ];

        if ((int) $participant->jumlah_sesi_total <= 0 && (int) $booking->total_sesi > 0) {
            $participantUpdates['jumlah_sesi_total'] = (int) $booking->total_sesi;
        }

        $participant->update($participantUpdates);
        $participant->refresh();
    }

    private function applyAttendanceCounterDelta(Participant $participant, ?string $oldStatus, string $newStatus): void
    {
        $absenceDelta = ($newStatus === 'Tidak Hadir' ? 1 : 0) - ($oldStatus === 'Tidak Hadir' ? 1 : 0);

        if ($absenceDelta === 0) {
            return;
        }

        $participant->update([
            'jumlah_absen' => max(
                0,
                (int) $participant->jumlah_absen + $absenceDelta
            ),
        ]);

        $participant->refresh();
    }

    private function syncParticipantCertificateStatus(Participant $participant): void
    {
        $hasActiveCertificateForActivePackage = $participant->paket_aktif_id
            ? $participant->certificates()
                ->where('status', 'Terbit')
                ->where('paket_id', $participant->paket_aktif_id)
                ->exists()
            : $participant->certificates()->where('status', 'Terbit')->exists();

        if ($hasActiveCertificateForActivePackage) {
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

    private function resolveFinalScore(
        mixed $practiceScore,
        mixed $attitudeScore,
        mixed $understandingScore,
        mixed $manualFinalScore
    ): ?float {
        if ($manualFinalScore !== null && $manualFinalScore !== '') {
            return round((float) $manualFinalScore, 2);
        }

        $scores = collect([
            $practiceScore,
            $attitudeScore,
            $understandingScore,
        ])
            ->filter(fn($score) => $score !== null && $score !== '')
            ->map(fn($score) => (float) $score)
            ->values();

        if ($scores->isEmpty()) {
            return null;
        }

        return round($scores->avg(), 2);
    }

    private function resolveGraduationStatus(string $attendanceStatus, ?float $finalScore): string
    {
        if ($attendanceStatus !== 'Hadir') {
            return 'Tidak Lulus';
        }

        return $finalScore !== null && $finalScore >= 70
            ? 'Lulus'
            : 'Tidak Lulus';
    }

    private function formatCandidateBooking(Booking $booking): array
    {
        $inputWindow = $this->resolveResultInputWindow($booking->trainingSchedule);

        return [
            'id' => $booking->id,
            'kode_booking' => $booking->kode_booking,
            'status' => $booking->status,
            'tanggal_booking' => DateFormatter::dateTime($booking->tanggal_booking),
            'booking_group_id' => $booking->booking_group_id,
            'sesi_ke' => (int) ($booking->sesi_ke ?: 1),
            'total_sesi' => (int) ($booking->total_sesi ?: $booking->bookingGroup?->total_sesi ?: 1),
            'session_label' => 'Sesi ' . (int) ($booking->sesi_ke ?: 1) . '/' . (int) ($booking->total_sesi ?: $booking->bookingGroup?->total_sesi ?: 1),
            'is_final_session' => (int) ($booking->sesi_ke ?: 1) >= (int) ($booking->total_sesi ?: $booking->bookingGroup?->total_sesi ?: 1),
            'can_input_result' => (bool) $inputWindow['can_input'],
            'input_unavailable_reason' => $inputWindow['message'],
            'input_available_from' => $inputWindow['available_from'],
            'input_available_until' => $inputWindow['available_until'],
            'booking_group' => $booking->bookingGroup ? [
                'id' => $booking->bookingGroup->id,
                'kode_group' => $booking->bookingGroup->kode_group,
                'status' => $booking->bookingGroup->status,
                'total_sesi' => (int) $booking->bookingGroup->total_sesi,
                'jumlah_sesi_selesai' => (int) $booking->bookingGroup->jumlah_sesi_selesai,
                'progress_label' => (int) $booking->bookingGroup->jumlah_sesi_selesai . '/' . (int) $booking->bookingGroup->total_sesi . ' sesi',
            ] : null,

            'peserta' => $booking->participant ? [
                'id' => $booking->participant->id,
                'kode_peserta' => $booking->participant->kode_peserta,
                'nama_peserta' => $booking->participant->user?->name,
                'email' => $booking->participant->user?->email,
                'no_telepon' => $booking->participant->user?->no_telepon,
            ] : null,

            'course_package' => $booking->coursePackage ? [
                'id' => $booking->coursePackage->id,
                'kode_paket' => $booking->coursePackage->kode_paket,
                'nama_paket' => $booking->coursePackage->nama_paket,
                'durasi_jam' => (int) $booking->coursePackage->durasi_jam,
            ] : null,

            'training_schedule' => $booking->trainingSchedule ? [
                'id' => $booking->trainingSchedule->id,
                'kode_jadwal' => $booking->trainingSchedule->kode_jadwal,
                'tanggal_latihan' => DateFormatter::date($booking->trainingSchedule->tanggal_latihan),
                'time_slot' => $booking->trainingSchedule->timeSlot ? [
                    'id' => $booking->trainingSchedule->timeSlot->id,
                    'nama_slot' => $booking->trainingSchedule->timeSlot->nama_slot,
                    'jam_mulai' => DateFormatter::time($booking->trainingSchedule->timeSlot->jam_mulai),
                    'jam_selesai' => DateFormatter::time($booking->trainingSchedule->timeSlot->jam_selesai),
                ] : null,
                'vehicle' => $booking->trainingSchedule->vehicle ? [
                    'id' => $booking->trainingSchedule->vehicle->id,
                    'nama_kendaraan' => $booking->trainingSchedule->vehicle->nama_kendaraan,
                    'nomor_plat' => $booking->trainingSchedule->vehicle->nomor_plat,
                    'transmisi' => $booking->trainingSchedule->vehicle->transmisi,
                ] : null,
            ] : null,

            'payment' => ($booking->payment ?: $booking->bookingGroup?->payment) ? [
                'id' => ($booking->payment ?: $booking->bookingGroup?->payment)->id,
                'status' => ($booking->payment ?: $booking->bookingGroup?->payment)->status,
                'tanggal_verifikasi' => DateFormatter::dateTime(($booking->payment ?: $booking->bookingGroup?->payment)->tanggal_verifikasi),
            ] : null,
        ];
    }

    private function formatTrainingResult(TrainingResult $result): array
    {
        return [
            'id' => $result->id,
            'booking_id' => $result->booking_id,
            'booking_group_id' => $result->booking?->booking_group_id,
            'sesi_ke' => (int) ($result->booking?->sesi_ke ?: 1),
            'total_sesi' => (int) ($result->booking?->total_sesi ?: $result->booking?->bookingGroup?->total_sesi ?: 1),
            'session_label' => 'Sesi ' . (int) ($result->booking?->sesi_ke ?: 1) . '/' . (int) ($result->booking?->total_sesi ?: $result->booking?->bookingGroup?->total_sesi ?: 1),
            'is_final_session' => (int) ($result->booking?->sesi_ke ?: 1) >= (int) ($result->booking?->total_sesi ?: $result->booking?->bookingGroup?->total_sesi ?: 1),
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
                'course_package' => $result->booking->coursePackage ? [
                    'id' => $result->booking->coursePackage->id,
                    'kode_paket' => $result->booking->coursePackage->kode_paket,
                    'nama_paket' => $result->booking->coursePackage->nama_paket,
                    'durasi_jam' => (int) $result->booking->coursePackage->durasi_jam,
                ] : null,
            ] : null,

            'peserta' => $result->participant ? [
                'id' => $result->participant->id,
                'kode_peserta' => $result->participant->kode_peserta,
                'nama_peserta' => $result->participant->user?->name,
                'email' => $result->participant->user?->email,
                'no_telepon' => $result->participant->user?->no_telepon,
                'status_sertifikat' => $result->participant->status_sertifikat,
            ] : null,

            'training_schedule' => $result->trainingSchedule ? [
                'id' => $result->trainingSchedule->id,
                'kode_jadwal' => $result->trainingSchedule->kode_jadwal,
                'tanggal_latihan' => DateFormatter::date($result->trainingSchedule->tanggal_latihan),
                'time_slot' => $result->trainingSchedule->timeSlot ? [
                    'id' => $result->trainingSchedule->timeSlot->id,
                    'nama_slot' => $result->trainingSchedule->timeSlot->nama_slot,
                    'jam_mulai' => DateFormatter::time($result->trainingSchedule->timeSlot->jam_mulai),
                    'jam_selesai' => DateFormatter::time($result->trainingSchedule->timeSlot->jam_selesai),
                ] : null,
                'vehicle' => $result->trainingSchedule->vehicle ? [
                    'id' => $result->trainingSchedule->vehicle->id,
                    'nama_kendaraan' => $result->trainingSchedule->vehicle->nama_kendaraan,
                    'nomor_plat' => $result->trainingSchedule->vehicle->nomor_plat,
                    'transmisi' => $result->trainingSchedule->vehicle->transmisi,
                ] : null,
            ] : null,

            'instructor' => $result->instructor ? [
                'id' => $result->instructor->id,
                'kode_instruktur' => $result->instructor->kode_instruktur,
                'nama_instruktur' => $result->instructor->user?->name,
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

            'created_at' => DateFormatter::dateTime($result->created_at),
            'updated_at' => DateFormatter::dateTime($result->updated_at),
        ];
    }
}