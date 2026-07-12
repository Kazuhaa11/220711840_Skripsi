<?php

namespace App\Services;

use App\Models\Certificate;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class CertificateQrCodeService
{
    public function generateAndStore(Certificate $certificate): Certificate
    {
        if (!class_exists(Builder::class)) {
            throw new RuntimeException(
                'Package QR Code belum terpasang. Jalankan: composer require endroid/qr-code:^5.0'
            );
        }

        $verificationUrl = $certificate->verification_url
            ?: $this->buildVerificationUrl($certificate->kode_verifikasi);

        $result = Builder::create()
            ->writer(new PngWriter())
            ->data($verificationUrl)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::High)
            ->size(320)
            ->margin(16)
            ->roundBlockSizeMode(RoundBlockSizeMode::Margin)
            ->validateResult(false)
            ->build();

        $qrContent = $result->getString();
        $safeNumber = Str::slug($certificate->nomor_sertifikat ?: 'sertifikat-' . $certificate->id);
        $fileName = 'qr-' . ($safeNumber ?: 'sertifikat-' . $certificate->id) . '.png';
        $path = 'sikemudi/qr-sertifikat/' . $certificate->id . '/' . $fileName;
        $oldPath = $certificate->qr_code_path;

        if (!Storage::disk('public')->put($path, $qrContent)) {
            throw new RuntimeException('QR code sertifikat gagal disimpan ke public storage.');
        }

        try {
            $certificate->forceFill([
                'qr_code' => $verificationUrl,
                'verification_url' => $verificationUrl,
                'qr_code_path' => $path,
                'qr_code_mime' => $result->getMimeType() ?: 'image/png',
                'qr_code_size' => strlen($qrContent),
            ])->save();
        } catch (\Throwable $throwable) {
            Storage::disk('public')->delete($path);
            throw $throwable;
        }

        if ($oldPath && $oldPath !== $path && Storage::disk('public')->exists($oldPath)) {
            Storage::disk('public')->delete($oldPath);
        }

        return $certificate->fresh() ?: $certificate;
    }

    public function getPublicUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        return Storage::disk('public')->url($path);
    }

    private function buildVerificationUrl(string $verificationCode): string
    {
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        return $frontendUrl . '/verifikasi-sertifikat/' . $verificationCode;
    }
}
