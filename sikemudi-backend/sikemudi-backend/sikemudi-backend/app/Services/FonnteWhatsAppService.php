<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class FonnteWhatsAppService
{
    public function isEnabled(): bool
    {
        return (bool) config('services.fonnte.enabled', false);
    }

    public function isConfigured(): bool
    {
        return filled((string) config('services.fonnte.token'))
            && filled((string) config('services.fonnte.base_url'));
    }

    public function status(): array
    {
        return [
            'enabled' => $this->isEnabled(),
            'configured' => $this->isConfigured(),
            'base_url' => config('services.fonnte.base_url'),
            'country_code' => config('services.fonnte.country_code'),
            'send_delay_seconds' => $this->sendDelaySeconds(),
            'h1_reminder_batch_limit' => $this->h1ReminderBatchLimit(),
        ];
    }

    public function sendDelaySeconds(): int
    {
        return max(0, (int) config('services.fonnte.send_delay_seconds', 8));
    }

    public function h1ReminderBatchLimit(): int
    {
        return max(1, (int) config('services.fonnte.h1_reminder_batch_limit', 20));
    }

    public function sendMessage(?string $target, string $message): array
    {
        $target = $this->normalizeTarget($target);
        $message = trim($message);

        if (!$this->isEnabled()) {
            return [
                'success' => false,
                'skipped' => true,
                'message' => 'Notifikasi WhatsApp belum diaktifkan.',
            ];
        }

        if (!$this->isConfigured()) {
            return [
                'success' => false,
                'skipped' => true,
                'message' => 'Konfigurasi Fonnte belum lengkap.',
            ];
        }

        if (!$target) {
            return [
                'success' => false,
                'skipped' => true,
                'message' => 'Nomor WhatsApp tujuan tidak tersedia.',
            ];
        }

        if ($message === '') {
            return [
                'success' => false,
                'skipped' => true,
                'message' => 'Isi pesan WhatsApp tidak boleh kosong.',
            ];
        }

        try {
            $response = Http::asForm()
                ->timeout((int) config('services.fonnte.timeout', 15))
                ->withHeaders([
                    'Authorization' => (string) config('services.fonnte.token'),
                ])
                ->post(rtrim((string) config('services.fonnte.base_url'), '/') . '/send', [
                    'target' => $target,
                    'message' => $message,
                    'countryCode' => (string) config('services.fonnte.country_code', '62'),
                ]);

            $payload = $response->json();

            if ($response->successful() && $this->payloadIsSuccess($payload)) {
                return [
                    'success' => true,
                    'skipped' => false,
                    'status' => $response->status(),
                    'data' => $payload,
                ];
            }

            Log::warning('Fonnte WhatsApp gagal mengirim pesan.', [
                'target' => $target,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'success' => false,
                'skipped' => false,
                'status' => $response->status(),
                'message' => $this->extractPayloadErrorMessage($payload) ?: 'Fonnte mengembalikan response gagal.',
                'data' => $payload ?: $response->body(),
            ];
        } catch (Throwable $exception) {
            Log::warning('Fonnte WhatsApp gagal dipanggil.', [
                'target' => $target,
                'error' => $exception->getMessage(),
            ]);

            return [
                'success' => false,
                'skipped' => false,
                'message' => $exception->getMessage(),
            ];
        }
    }

    private function normalizeTarget(?string $target): ?string
    {
        if (!$target) {
            return null;
        }

        $normalized = preg_replace('/[^0-9,]/', '', $target);

        return $normalized !== '' ? $normalized : null;
    }

    private function payloadIsSuccess(mixed $payload): bool
    {
        if (!is_array($payload)) {
            return false;
        }

        if (array_key_exists('status', $payload)) {
            return (bool) $payload['status'];
        }

        if (array_key_exists('success', $payload)) {
            return (bool) $payload['success'];
        }

        return false;
    }

    private function extractPayloadErrorMessage(mixed $payload): ?string
    {
        if (!is_array($payload)) {
            return null;
        }

        foreach (['reason', 'message', 'detail', 'error'] as $key) {
            if (isset($payload[$key]) && is_string($payload[$key]) && trim($payload[$key]) !== '') {
                return trim($payload[$key]);
            }
        }

        return null;
    }
}
