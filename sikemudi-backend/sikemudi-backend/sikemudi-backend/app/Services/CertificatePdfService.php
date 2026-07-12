<?php

namespace App\Services;

use App\Models\Certificate;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class CertificatePdfService
{
    public function generateAndStore(Certificate $certificate, ?int $updatedBy = null): Certificate
    {
        $certificate->loadMissing($this->relations());

        if ($certificate->status === 'Dicabut') {
            throw new RuntimeException('PDF tidak dapat dibuat untuk sertifikat yang sudah dicabut.');
        }

        if (! $certificate->qr_code_path || ! Storage::disk('public')->exists($certificate->qr_code_path)) {
            $certificate = app(CertificateQrCodeService::class)->generateAndStore($certificate);
            $certificate->load($this->relations());
        }

        $pdfContent = Pdf::loadView('certificates.pdf', [
            'certificate' => $certificate,
        ])->setPaper('a4', 'landscape')->output();

        $safeNumber = Str::slug($certificate->nomor_sertifikat) ?: 'sertifikat-' . $certificate->id;
        $fileName = 'sertifikat-' . $safeNumber . '.pdf';
        $path = 'sikemudi/sertifikat/' . $certificate->id . '/' . $fileName;
        $oldPath = $certificate->pdf_path;

        if (! Storage::disk('local')->put($path, $pdfContent)) {
            throw new RuntimeException('PDF sertifikat gagal disimpan.');
        }

        try {
            $certificate->forceFill([
                'pdf_path' => $path,
                'pdf_original_name' => $fileName,
                'pdf_mime' => 'application/pdf',
                'pdf_size' => strlen($pdfContent),
                'pdf_url' => '/api/peserta/sertifikat/' . $certificate->id . '/download',
                'updated_by' => $updatedBy ?: $certificate->updated_by,
            ])->save();
        } catch (\Throwable $throwable) {
            Storage::disk('local')->delete($path);

            throw $throwable;
        }

        if ($oldPath && $oldPath !== $path && Storage::disk('local')->exists($oldPath)) {
            Storage::disk('local')->delete($oldPath);
        }

        return $certificate->fresh($this->relations()) ?: $certificate;
    }

    public function relations(): array
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
}
