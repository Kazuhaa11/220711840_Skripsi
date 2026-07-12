<?php

namespace App\Support;

use App\Models\BookingPayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class BookingPaymentProofResponder
{
    public static function response(BookingPayment $payment): mixed
    {
        if ($payment->bukti_bayar_path) {
            $disk = Storage::disk('local');

            if (!$disk->exists($payment->bukti_bayar_path)) {
                return response()->json([
                    'success' => false,
                    'message' => 'File bukti bayar tidak ditemukan.',
                ], 404);
            }

            return response()->file($disk->path($payment->bukti_bayar_path), [
                'Content-Type' => $payment->bukti_bayar_mime ?: 'application/octet-stream',
                'Content-Disposition' => 'inline; filename="' . addslashes($payment->bukti_bayar_original_name ?: 'bukti-bayar') . '"',
            ]);
        }

        if ($payment->bukti_bayar) {
            $legacyProof = self::decodeLegacyBase64Proof($payment->bukti_bayar);

            if (!$legacyProof) {
                return response()->json([
                    'success' => false,
                    'message' => 'File bukti bayar lama tidak valid.',
                ], 404);
            }

            return response($legacyProof['content'], 200, [
                'Content-Type' => $legacyProof['mime'],
                'Content-Disposition' => 'inline; filename="bukti-bayar-lama.' . $legacyProof['extension'] . '"',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Bukti bayar tidak ditemukan.',
        ], 404);
    }

    private static function decodeLegacyBase64Proof(string $proof): ?array
    {
        if (!preg_match('/^data:(image\/jpeg|image\/png|image\/webp|application\/pdf);base64,([A-Za-z0-9+\/=]+)$/', $proof, $matches)) {
            return null;
        }

        $content = base64_decode($matches[2], true);

        if ($content === false || $content === '') {
            return null;
        }

        $mime = $matches[1];

        return [
            'content' => $content,
            'mime' => $mime,
            'extension' => match ($mime) {
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/webp' => 'webp',
                'application/pdf' => 'pdf',
            },
        ];
    }
}
