<?php

namespace App\Http\Controllers\Api\Peserta;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Participant;
use App\Services\CertificateQrCodeService;
use App\Support\DateFormatter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SertifikatPesertaController extends Controller
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

        $certificates = Certificate::query()
            ->with([
                'trainingResult.instructor.user',
                'trainingResult.trainingSchedule.timeSlot',
                'trainingResult.trainingSchedule.vehicle',
                'coursePackage',
                'template',
            ])
            ->where('peserta_id', $participant->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data sertifikat peserta berhasil diambil.',
            'data' => [
                'items' => $certificates
                    ->map(fn(Certificate $certificate) => $this->formatCertificate($certificate, false))
                    ->values(),
            ],
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $certificate = Certificate::query()
            ->with([
                'trainingResult.instructor.user',
                'trainingResult.trainingSchedule.timeSlot',
                'trainingResult.trainingSchedule.vehicle',
                'participant.user',
                'coursePackage',
                'template',
                'creator',
                'updater',
            ])
            ->where('peserta_id', $participant->id)
            ->find($id);

        if (!$certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Sertifikat tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail sertifikat peserta berhasil diambil.',
            'data' => [
                'item' => $this->formatCertificate($certificate, true),
            ],
        ]);
    }

    public function download(Request $request, string $id)
    {
        $participant = $this->getAuthenticatedParticipant($request);

        if (!$participant) {
            return response()->json([
                'success' => false,
                'message' => 'Data peserta tidak ditemukan.',
            ], 404);
        }

        $certificate = Certificate::query()
            ->where('peserta_id', $participant->id)
            ->find($id);

        if (!$certificate) {
            return response()->json([
                'success' => false,
                'message' => 'Sertifikat tidak ditemukan.',
            ], 404);
        }

        if ($certificate->status !== 'Terbit') {
            return response()->json([
                'success' => false,
                'message' => 'Sertifikat belum aktif atau sudah dicabut sehingga tidak dapat diunduh.',
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

    private function getAuthenticatedParticipant(Request $request): ?Participant
    {
        return Participant::query()
            ->with(['user.role', 'activePackage'])
            ->where('user_id', $request->user()->id)
            ->first();
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
                ? '/api/peserta/sertifikat/' . $certificate->id . '/download'
                : null,
            'catatan' => $certificate->catatan,

            'peserta' => $certificate->participant ? [
                'id' => $certificate->participant->id,
                'kode_peserta' => $certificate->participant->kode_peserta,
                'nama_peserta' => $certificate->participant->user?->name,
                'email' => $certificate->participant->user?->email,
                'no_telepon' => $certificate->participant->user?->no_telepon,
            ] : null,

            'course_package' => $certificate->coursePackage ? [
                'id' => $certificate->coursePackage->id,
                'kode_paket' => $certificate->coursePackage->kode_paket,
                'nama_paket' => $certificate->coursePackage->nama_paket,
                'durasi_jam' => (int) $certificate->coursePackage->durasi_jam,
            ] : null,

            'training_result' => $certificate->trainingResult ? [
                'id' => $certificate->trainingResult->id,
                'tanggal_latihan' => DateFormatter::date($certificate->trainingResult->tanggal_latihan),
                'status_kehadiran' => $certificate->trainingResult->status_kehadiran,
                'nilai_praktik' => $certificate->trainingResult->nilai_praktik !== null
                    ? (float) $certificate->trainingResult->nilai_praktik
                    : null,
                'nilai_sikap' => $certificate->trainingResult->nilai_sikap !== null
                    ? (float) $certificate->trainingResult->nilai_sikap
                    : null,
                'nilai_pemahaman' => $certificate->trainingResult->nilai_pemahaman !== null
                    ? (float) $certificate->trainingResult->nilai_pemahaman
                    : null,
                'nilai_akhir' => $certificate->trainingResult->nilai_akhir !== null
                    ? (float) $certificate->trainingResult->nilai_akhir
                    : null,
                'status_kelulusan' => $certificate->trainingResult->status_kelulusan,
                'catatan_instruktur' => $certificate->trainingResult->catatan_instruktur,
                'catatan_admin' => $certificate->trainingResult->catatan_admin,

                'instructor' => $certificate->trainingResult->instructor ? [
                    'id' => $certificate->trainingResult->instructor->id,
                    'kode_instruktur' => $certificate->trainingResult->instructor->kode_instruktur,
                    'nama_instruktur' => $certificate->trainingResult->instructor->user?->name,
                ] : null,

                'training_schedule' => $certificate->trainingResult->trainingSchedule ? [
                    'id' => $certificate->trainingResult->trainingSchedule->id,
                    'kode_jadwal' => $certificate->trainingResult->trainingSchedule->kode_jadwal,
                    'tanggal_latihan' => DateFormatter::date($certificate->trainingResult->trainingSchedule->tanggal_latihan),

                    'time_slot' => $certificate->trainingResult->trainingSchedule->timeSlot ? [
                        'id' => $certificate->trainingResult->trainingSchedule->timeSlot->id,
                        'nama_slot' => $certificate->trainingResult->trainingSchedule->timeSlot->nama_slot,
                        'jam_mulai' => DateFormatter::time($certificate->trainingResult->trainingSchedule->timeSlot->jam_mulai),
                        'jam_selesai' => DateFormatter::time($certificate->trainingResult->trainingSchedule->timeSlot->jam_selesai),
                    ] : null,

                    'vehicle' => $certificate->trainingResult->trainingSchedule->vehicle ? [
                        'id' => $certificate->trainingResult->trainingSchedule->vehicle->id,
                        'nama_kendaraan' => $certificate->trainingResult->trainingSchedule->vehicle->nama_kendaraan,
                        'nomor_plat' => $certificate->trainingResult->trainingSchedule->vehicle->nomor_plat,
                        'transmisi' => $certificate->trainingResult->trainingSchedule->vehicle->transmisi,
                    ] : null,
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

            'created_at' => DateFormatter::dateTime($certificate->created_at),
            'updated_at' => DateFormatter::dateTime($certificate->updated_at),
        ];
    }
}
