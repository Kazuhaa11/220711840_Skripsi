<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\CertificateTemplate;
use App\Models\TrainingResult;
use App\Services\BookingWhatsAppNotificationService;
use App\Services\CertificatePdfService;
use App\Services\CertificateQrCodeService;
use App\Support\DateFormatter;
use App\Support\TrainingResultEligibility;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use RuntimeException;

class SertifikatController extends Controller
{
    public function __construct(
        private readonly BookingWhatsAppNotificationService $bookingWhatsAppNotificationService,
    ) {
    }

    public function kandidat(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $results = TrainingResult::query()
            ->with([
                'booking.coursePackage',
                'booking.bookingGroup',
                'participant.user',
                'trainingSchedule.timeSlot',
                'trainingSchedule.vehicle',
                'trainingSchedule.coursePackage',
                'instructor.user',
                'certificate',
                'validator',
            ])
            ->where('status_kelulusan', 'Lulus')
            ->whereNotNull('validated_at')
            ->whereDoesntHave('certificate')
            ->whereHas('booking', function ($bookingQuery) {
                $bookingQuery
                    ->whereColumn('sesi_ke', '>=', 'total_sesi')
                    ->whereHas('bookingGroup', function ($groupQuery) {
                        $groupQuery
                            ->where('status', 'Selesai')
                            ->whereColumn('jumlah_sesi_selesai', '>=', 'total_sesi');
                    });
            })
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->whereHas('booking', function ($bookingQuery) use ($keyword) {
                            $bookingQuery->where('kode_booking', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('participant.user', function ($userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%")
                                ->orWhere('no_telepon', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('instructor.user', function ($userQuery) use ($keyword) {
                            $userQuery->where('name', 'like', "%{$keyword}%");
                        })
                        ->orWhereHas('trainingSchedule', function ($scheduleQuery) use ($keyword) {
                            $scheduleQuery->where('kode_jadwal', 'like', "%{$keyword}%");
                        });
                });
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
            'message' => 'Data kandidat sertifikat berhasil diambil.',
            'data' => [
                'items' => collect($results->items())
                    ->map(fn(TrainingResult $result) => $this->formatCandidate($result))
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

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $certificates = Certificate::query()
            ->with([
                'trainingResult.booking.bookingGroup',
                'trainingResult.instructor.user',
                'participant.user',
                'coursePackage',
                'template',
                'creator',
                'updater',
            ])
            ->when($request->filled('q'), function ($query) use ($request) {
                $keyword = $request->query('q');

                $query->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('nomor_sertifikat', 'like', "%{$keyword}%")
                        ->orWhere('kode_verifikasi', 'like', "%{$keyword}%")
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
                        });
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('tanggal_terbit'), function ($query) use ($request) {
                $query->whereDate('tanggal_terbit', $request->query('tanggal_terbit'));
            })
            ->when($request->filled('tanggal_mulai'), function ($query) use ($request) {
                $query->whereDate('tanggal_terbit', '>=', $request->query('tanggal_mulai'));
            })
            ->when($request->filled('tanggal_selesai'), function ($query) use ($request) {
                $query->whereDate('tanggal_terbit', '<=', $request->query('tanggal_selesai'));
            })
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Data sertifikat berhasil diambil.',
            'data' => [
                'items' => collect($certificates->items())
                    ->map(fn(Certificate $certificate) => $this->formatCertificate($certificate, false))
                    ->values(),
                'pagination' => [
                    'current_page' => $certificates->currentPage(),
                    'last_page' => $certificates->lastPage(),
                    'per_page' => $certificates->perPage(),
                    'total' => $certificates->total(),
                ],
            ],
        ]);
    }

    public function terbitkan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hasil_latihan_id' => ['required', 'exists:training_results,id'],
            'template_id' => ['nullable', 'exists:certificate_templates,id'],
            'tanggal_terbit' => ['nullable', 'date'],
            'status' => ['nullable', Rule::in(['Draft', 'Terbit'])],
            'catatan' => ['nullable', 'string'],
        ], [
            'hasil_latihan_id.required' => 'Hasil latihan wajib dipilih.',
            'hasil_latihan_id.exists' => 'Hasil latihan tidak ditemukan.',
            'template_id.exists' => 'Template sertifikat tidak ditemukan.',
            'status.in' => 'Status sertifikat tidak valid.',
        ]);

        $result = DB::transaction(function () use ($request, $validated) {
            /** @var TrainingResult|null $trainingResult */
            $trainingResult = TrainingResult::query()
                ->with([
                    'booking.coursePackage',
                    'booking.bookingGroup',
                    'participant',
                    'trainingSchedule',
                    'certificate',
                ])
                ->lockForUpdate()
                ->find($validated['hasil_latihan_id']);

            if (!$trainingResult) {
                return [
                    'error' => true,
                    'status' => 404,
                    'message' => 'Hasil latihan tidak ditemukan.',
                ];
            }

            if ($trainingResult->status_kelulusan !== 'Lulus') {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Sertifikat hanya dapat diterbitkan untuk hasil latihan akhir yang berstatus Lulus.',
                ];
            }

            $eligibility = TrainingResultEligibility::resolve($trainingResult);

            if (! $eligibility['is_final_session']) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Sertifikat hanya dapat diterbitkan dari hasil sesi terakhir paket.',
                ];
            }

            if (! $eligibility['is_package_completed']) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Paket latihan peserta belum selesai, sertifikat belum dapat diterbitkan.',
                ];
            }

            if (! $trainingResult->validated_at) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Hasil akhir belum divalidasi admin. Validasi hasil akhir terlebih dahulu sebelum menerbitkan sertifikat.',
                ];
            }

            if (! $eligibility['has_passing_final_result']) {
                return [
                    'error' => true,
                    'status' => 422,
                    'message' => 'Sertifikat hanya dapat diterbitkan untuk hasil akhir Lulus dengan nilai minimal 70 dan kehadiran Hadir.',
                ];
            }

            if ($trainingResult->certificate) {
                return [
                    'error' => true,
                    'status' => 409,
                    'message' => 'Hasil latihan ini sudah memiliki sertifikat.',
                ];
            }

            $templateId = $validated['template_id'] ?? $this->getDefaultTemplateId();
            $status = $validated['status'] ?? 'Terbit';
            $issuedDate = $status === 'Terbit'
                ? ($validated['tanggal_terbit'] ?? now()->toDateString())
                : null;

            $certificate = $this->createCertificateWithUniqueNumber([
                'hasil_latihan_id' => $trainingResult->id,
                'peserta_id' => $trainingResult->participant_id,
                'paket_id' => $trainingResult->booking?->course_package_id,
                'template_id' => $templateId,
                'tanggal_terbit' => $issuedDate,
                'status' => $status,
                'pdf_url' => null,
                'catatan' => $validated['catatan'] ?? null,
                'created_by' => $request->user()->id,
                'updated_by' => $request->user()->id,
            ]);

            $certificate = app(CertificateQrCodeService::class)->generateAndStore($certificate);

            if ($certificate->status === 'Terbit') {
                $certificate = app(CertificatePdfService::class)->generateAndStore(
                    $certificate,
                    $request->user()->id,
                );
            }

            if ($certificate->status === 'Terbit' && $trainingResult->participant) {
                $trainingResult->participant->update([
                    'status_sertifikat' => 'Terbit',
                ]);
            }

            $certificate = $certificate->fresh([
                'trainingResult.booking.bookingGroup',
                'trainingResult.instructor.user',
                'participant.user',
                'coursePackage',
                'template',
                'creator',
                'updater',
            ]);

            return [
                'error' => false,
                'certificate' => $certificate,
            ];
        });

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'],
            ], $result['status']);
        }

        $this->bookingWhatsAppNotificationService->notifyCertificatePublished($result['certificate']);

        return response()->json([
            'success' => true,
            'message' => 'Sertifikat berhasil diterbitkan.',
            'data' => [
                'item' => $this->formatCertificate($result['certificate'], true),
            ],
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $certificate = Certificate::query()
            ->with([
                'trainingResult.booking.bookingGroup',
                'trainingResult.instructor.user',
                'trainingResult.trainingSchedule.timeSlot',
                'trainingResult.trainingSchedule.vehicle',
                'participant.user',
                'coursePackage',
                'template',
                'creator',
                'updater',
            ])
            ->find($id);

        if (!$certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Sertifikat tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail sertifikat berhasil diambil.',
            'data' => [
                'item' => $this->formatCertificate($certificate, true),
            ],
        ]);
    }

    public function generatePdf(Request $request, string $id): JsonResponse
    {
        $certificate = Certificate::query()
            ->with($this->certificatePdfRelations())
            ->find($id);

        if (!$certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Sertifikat tidak ditemukan.',
            ], 404);
        }

        if ($certificate->status === 'Dicabut') {
            return response()->json([
                'success' => false,
                'message' => 'PDF tidak dapat dibuat untuk sertifikat yang sudah dicabut.',
            ], 422);
        }

        try {
            $certificate = app(CertificatePdfService::class)->generateAndStore(
                $certificate,
                $request->user()->id,
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], 500);
        }

        $certificate = $certificate->fresh([
            'trainingResult.booking.bookingGroup',
            'trainingResult.instructor.user',
            'trainingResult.trainingSchedule.timeSlot',
            'trainingResult.trainingSchedule.vehicle',
            'participant.user',
            'coursePackage',
            'template',
            'creator',
            'updater',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'PDF sertifikat berhasil dibuat.',
            'data' => [
                'item' => $this->formatCertificate($certificate, true),
            ],
        ]);
    }

    public function download(string $id)
    {
        $certificate = Certificate::query()->find($id);

        if (!$certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Sertifikat tidak ditemukan.',
            ], 404);
        }

        return $this->downloadCertificatePdf($certificate);
    }

    public function cabut(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'catatan' => ['nullable', 'string'],
        ]);

        $certificate = Certificate::query()
            ->with(['trainingResult.participant'])
            ->find($id);

        if (!$certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Sertifikat tidak ditemukan.',
            ], 404);
        }

        if ($certificate->status === 'Dicabut') {
            return response()->json([
                'success' => false,
                'message' => 'Sertifikat sudah berstatus dicabut.',
            ], 422);
        }

        $certificate->update([
            'status' => 'Dicabut',
            'catatan' => $validated['catatan'] ?? $certificate->catatan,
            'updated_by' => $request->user()->id,
        ]);

        if ($certificate->trainingResult?->participant) {
            $certificate->trainingResult->participant->update([
                'status_sertifikat' => 'Dalam Proses',
            ]);
        }

        $certificate = $certificate->fresh([
            'trainingResult.booking.bookingGroup',
            'trainingResult.instructor.user',
            'participant.user',
            'coursePackage',
            'template',
            'creator',
            'updater',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sertifikat berhasil dicabut.',
            'data' => [
                'item' => $this->formatCertificate($certificate, true),
            ],
        ]);
    }

    private function getDefaultTemplateId(): ?int
    {
        $template = CertificateTemplate::query()
            ->where('is_default', true)
            ->where('status', 'Aktif')
            ->first();

        if ($template) {
            return $template->id;
        }

        return CertificateTemplate::query()
            ->where('status', 'Aktif')
            ->oldest()
            ->value('id');
    }


    private function createCertificateWithUniqueNumber(array $attributes): Certificate
    {
        $lastException = null;

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $verificationCode = $this->generateVerificationCode();
            $verificationUrl = $this->buildVerificationUrl($verificationCode);

            try {
                return Certificate::create(array_merge($attributes, [
                    'nomor_sertifikat' => $this->generateCertificateNumber($attempt),
                    'kode_verifikasi' => $verificationCode,
                    'qr_code' => $verificationUrl,
                    'verification_url' => $verificationUrl,
                ]));
            } catch (QueryException $exception) {
                if (!$this->isDuplicateKeyException($exception)) {
                    throw $exception;
                }

                $lastException = $exception;
            }
        }

        throw new RuntimeException(
            'Nomor sertifikat atau kode verifikasi gagal dibuat secara unik. Silakan coba kembali.',
            0,
            $lastException
        );
    }

    private function isDuplicateKeyException(QueryException $exception): bool
    {
        $errorInfo = $exception->errorInfo;

        return ($errorInfo[0] ?? null) === '23000'
            && (int) ($errorInfo[1] ?? 0) === 1062;
    }

    private function generateCertificateNumber(int $attempt = 1): string
    {
        $date = now()->format('Ymd');

        $lastCertificate = Certificate::query()
            ->whereDate('created_at', now()->toDateString())
            ->lockForUpdate()
            ->orderByDesc('id')
            ->first();

        $nextNumber = ($lastCertificate ? $lastCertificate->id : 0) + $attempt;

        return 'SKM-' . $date . '-' . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);
    }

    private function generateVerificationCode(): string
    {
        do {
            $code = strtoupper(Str::random(16));
        } while (Certificate::where('kode_verifikasi', $code)->exists());

        return $code;
    }

    private function buildVerificationUrl(string $verificationCode): string
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        return $frontendUrl . '/verifikasi-sertifikat/' . $verificationCode;
    }

    private function certificatePdfRelations(): array
    {
        return [
            'trainingResult.booking.bookingGroup',
            'trainingResult.instructor.user',
            'trainingResult.trainingSchedule.timeSlot',
            'trainingResult.trainingSchedule.vehicle',
            'participant.user',
            'coursePackage',
            'template',
        ];
    }

    private function downloadCertificatePdf(Certificate $certificate)
    {
        if ($certificate->status !== 'Terbit') {
            return response()->json([
                'success' => false,
                'message' => 'Sertifikat belum terbit atau sudah dicabut sehingga tidak dapat diunduh.',
            ], 422);
        }

        if (!$certificate->pdf_path) {
            return response()->json([
                'success' => false,
                'message' => 'PDF sertifikat belum dibuat.',
            ], 404);
        }

        if (!Storage::disk('local')->exists($certificate->pdf_path)) {
            return response()->json([
                'success' => false,
                'message' => 'File PDF sertifikat tidak ditemukan di storage.',
            ], 404);
        }

        return Storage::disk('local')->response(
            $certificate->pdf_path,
            $certificate->pdf_original_name ?: 'sertifikat-' . $certificate->nomor_sertifikat . '.pdf',
            [
                'Content-Type' => 'application/pdf',
            ]
        );
    }

    private function formatCandidate(TrainingResult $result): array
    {
        $eligibility = TrainingResultEligibility::resolve($result);

        return [
            'id' => $result->id,
            'hasil_latihan_id' => $result->id,
            'booking_group_id' => $eligibility['booking_group_id'],
            'sesi_ke' => $eligibility['sesi_ke'],
            'total_sesi' => $eligibility['total_sesi'],
            'session_label' => $eligibility['session_label'],
            'progress_label' => $eligibility['progress_label'],
            'is_final_session' => $eligibility['is_final_session'],
            'is_package_completed' => $eligibility['is_package_completed'],
            'can_issue_certificate' => $eligibility['can_issue_certificate'],
            'validation_status' => $eligibility['validation_status'],
            'validated_at' => DateFormatter::dateTime($result->validated_at),
            'tanggal_latihan' => DateFormatter::date($result->tanggal_latihan),
            'status_kehadiran' => $result->status_kehadiran,
            'nilai_akhir' => $result->nilai_akhir !== null ? (float) $result->nilai_akhir : null,
            'status_kelulusan' => $result->status_kelulusan,
            'catatan_instruktur' => $result->catatan_instruktur,
            'catatan_admin' => $result->catatan_admin,

            'peserta' => $result->participant ? [
                'id' => $result->participant->id,
                'kode_peserta' => $result->participant->kode_peserta,
                'nama_peserta' => $result->participant->user?->name,
                'email' => $result->participant->user?->email,
                'no_telepon' => $result->participant->user?->no_telepon,
                'status_sertifikat' => $result->participant->status_sertifikat,
            ] : null,

            'booking' => $result->booking ? [
                'id' => $result->booking->id,
                'kode_booking' => $result->booking->kode_booking,
                'booking_group_id' => $result->booking->booking_group_id,
                'sesi_ke' => (int) ($result->booking->sesi_ke ?: 1),
                'total_sesi' => (int) ($result->booking->total_sesi ?: $result->booking->bookingGroup?->total_sesi ?: 1),
                'status' => $result->booking->status,
                'pakai_antar_jemput' => (bool) $result->booking->pakai_antar_jemput,
                'pakai_sim' => (bool) $result->booking->pakai_sim,
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

            'validated_by' => $result->validator ? [
                'id' => $result->validator->id,
                'name' => $result->validator->name,
                'email' => $result->validator->email,
            ] : null,
        ];
    }

    private function formatCertificate(Certificate $certificate, bool $includeTemplate): array
    {
        return [
            'id' => $certificate->id,
            'nomor_sertifikat' => $certificate->nomor_sertifikat,
            'kode_verifikasi' => $certificate->kode_verifikasi,
            'tanggal_terbit' => DateFormatter::date($certificate->tanggal_terbit),
            'status' => $certificate->status,
            'qr_code' => $certificate->qr_code,
            'qr_code_path' => $certificate->qr_code_path,
            'qr_code_url' => app(CertificateQrCodeService::class)->getPublicUrl($certificate->qr_code_path),
            'qr_code_mime' => $certificate->qr_code_mime,
            'qr_code_size' => $certificate->qr_code_size ? (int) $certificate->qr_code_size : null,
            'verification_url' => $certificate->verification_url,
            'pdf_url' => $certificate->pdf_url,
            'pdf_path' => $certificate->pdf_path,
            'pdf_original_name' => $certificate->pdf_original_name,
            'pdf_mime' => $certificate->pdf_mime,
            'pdf_size' => $certificate->pdf_size ? (int) $certificate->pdf_size : null,
            'pdf_download_url' => $certificate->pdf_path
                ? '/api/admin/sertifikat/' . $certificate->id . '/download'
                : null,
            'catatan' => $certificate->catatan,

            'peserta' => $certificate->participant ? [
                'id' => $certificate->participant->id,
                'kode_peserta' => $certificate->participant->kode_peserta,
                'nama_peserta' => $certificate->participant->user?->name,
                'email' => $certificate->participant->user?->email,
                'no_telepon' => $certificate->participant->user?->no_telepon,
                'alamat' => $certificate->participant->user?->alamat,
                'status_sertifikat' => $certificate->participant->status_sertifikat,
            ] : null,

            'course_package' => $certificate->coursePackage ? [
                'id' => $certificate->coursePackage->id,
                'kode_paket' => $certificate->coursePackage->kode_paket,
                'nama_paket' => $certificate->coursePackage->nama_paket,
                'durasi_jam' => (int) $certificate->coursePackage->durasi_jam,
            ] : null,

            'training_result' => $certificate->trainingResult ? [
                'id' => $certificate->trainingResult->id,
                'booking_group' => $certificate->trainingResult->booking?->bookingGroup ? [
                    'id' => $certificate->trainingResult->booking->bookingGroup->id,
                    'kode_group' => $certificate->trainingResult->booking->bookingGroup->kode_group,
                    'status' => $certificate->trainingResult->booking->bookingGroup->status,
                    'total_sesi' => (int) $certificate->trainingResult->booking->bookingGroup->total_sesi,
                    'jumlah_sesi_selesai' => (int) $certificate->trainingResult->booking->bookingGroup->jumlah_sesi_selesai,
                    'progress_label' => (int) $certificate->trainingResult->booking->bookingGroup->jumlah_sesi_selesai . '/' . (int) $certificate->trainingResult->booking->bookingGroup->total_sesi . ' sesi',
                ] : null,
                'sesi_ke' => (int) ($certificate->trainingResult->booking?->sesi_ke ?: 1),
                'total_sesi' => (int) ($certificate->trainingResult->booking?->total_sesi ?: $certificate->trainingResult->booking?->bookingGroup?->total_sesi ?: 1),
                'session_label' => 'Sesi ' . (int) ($certificate->trainingResult->booking?->sesi_ke ?: 1) . '/' . (int) ($certificate->trainingResult->booking?->total_sesi ?: $certificate->trainingResult->booking?->bookingGroup?->total_sesi ?: 1),
                'progress_label' => $certificate->trainingResult->booking?->bookingGroup
                    ? (int) $certificate->trainingResult->booking->bookingGroup->jumlah_sesi_selesai . '/' . (int) $certificate->trainingResult->booking->bookingGroup->total_sesi . ' sesi'
                    : null,
                'tanggal_latihan' => DateFormatter::date($certificate->trainingResult->tanggal_latihan),
                'nilai_akhir' => $certificate->trainingResult->nilai_akhir !== null
                    ? (float) $certificate->trainingResult->nilai_akhir
                    : null,
                'status_kelulusan' => $certificate->trainingResult->status_kelulusan,
                'instructor' => $certificate->trainingResult->instructor ? [
                    'id' => $certificate->trainingResult->instructor->id,
                    'kode_instruktur' => $certificate->trainingResult->instructor->kode_instruktur,
                    'nama_instruktur' => $certificate->trainingResult->instructor->user?->name,
                ] : null,
            ] : null,

            'template' => $includeTemplate && $certificate->template ? [
                'id' => $certificate->template->id,
                'nama_template' => $certificate->template->nama_template,
                'judul_sertifikat' => $certificate->template->judul_sertifikat,
                'subjudul' => $certificate->template->subjudul,
                'kalimat_pembuka' => $certificate->template->kalimat_pembuka,
                'kalimat_penutup' => $certificate->template->kalimat_penutup,
                'nama_penyelenggara' => $certificate->template->nama_penyelenggara,
                'nama_penandatangan' => $certificate->template->nama_penandatangan,
                'jabatan_penandatangan' => $certificate->template->jabatan_penandatangan,
                'ttd_digital' => $certificate->template->ttd_digital,
                'background_type' => $certificate->template->background_type,
                'background_color' => $certificate->template->background_color,
                'background_image' => $certificate->template->background_image,
                'border_color' => $certificate->template->border_color,
            ] : null,

            'created_by' => $certificate->creator ? [
                'id' => $certificate->creator->id,
                'name' => $certificate->creator->name,
                'email' => $certificate->creator->email,
            ] : null,

            'updated_by' => $certificate->updater ? [
                'id' => $certificate->updater->id,
                'name' => $certificate->updater->name,
                'email' => $certificate->updater->email,
            ] : null,

            'created_at' => DateFormatter::dateTime($certificate->created_at),
            'updated_at' => DateFormatter::dateTime($certificate->updated_at),
        ];
    }
}
