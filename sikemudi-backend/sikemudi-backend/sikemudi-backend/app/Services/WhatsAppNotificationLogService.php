<?php

namespace App\Services;

use App\Models\BookingGroup;
use App\Models\WhatsAppNotificationLog;
use Illuminate\Database\Eloquent\Model;
use Throwable;

class WhatsAppNotificationLogService
{
    public function __construct(
        private readonly FonnteWhatsAppService $whatsAppService,
        private readonly BookingPaymentInvoicePdfService $invoicePdfService,
    ) {
    }

    public function sendLogged(
        string $eventType,
        ?Model $notifiable,
        ?string $target,
        string $message,
        ?string $notificationKey = null,
        bool $skipIfAlreadySent = true,
    ): array {
        $notificationKey = $notificationKey ?: $this->buildNotificationKey($eventType, $notifiable, $target, $message);

        /** @var WhatsAppNotificationLog $log */
        $log = WhatsAppNotificationLog::query()->firstOrNew([
            'notification_key' => $notificationKey,
        ]);

        if ($skipIfAlreadySent && $log->exists && $log->status === 'Terkirim') {
            return [
                'success' => false,
                'skipped' => true,
                'message' => 'Notifikasi WhatsApp sudah pernah terkirim.',
                'log_id' => $log->id,
                'status' => $log->status,
            ];
        }

        $log->fill([
            'event_type' => $eventType,
            'notifiable_type' => $notifiable ? $notifiable::class : null,
            'notifiable_id' => $notifiable?->getKey(),
            'target' => $target,
            'message' => $message,
            'status' => 'Pending',
            'fonnte_response' => null,
            'error_message' => null,
            'sent_at' => null,
        ])->save();

        try {
            $result = $this->whatsAppService->sendMessage($target, $message);

            return $this->applySendResult($log, $result);
        } catch (Throwable $exception) {
            $log->update([
                'status' => 'Gagal',
                'fonnte_response' => null,
                'error_message' => $exception->getMessage(),
                'sent_at' => null,
            ]);

            return [
                'success' => false,
                'skipped' => false,
                'message' => $exception->getMessage(),
                'log_id' => $log->id,
                'status' => 'Gagal',
            ];
        }
    }

    public function sendDocumentLogged(
        string $eventType,
        ?Model $notifiable,
        ?string $target,
        string $message,
        string $filePath,
        ?string $filename = null,
        string $mimeType = 'application/pdf',
        ?string $notificationKey = null,
        bool $skipIfAlreadySent = true,
    ): array {
        $notificationKey = $notificationKey ?: $this->buildNotificationKey($eventType, $notifiable, $target, $message);

        /** @var WhatsAppNotificationLog $log */
        $log = WhatsAppNotificationLog::query()->firstOrNew([
            'notification_key' => $notificationKey,
        ]);

        if ($skipIfAlreadySent && $log->exists && $log->status === 'Terkirim') {
            return [
                'success' => false,
                'skipped' => true,
                'message' => 'Notifikasi WhatsApp sudah pernah terkirim.',
                'log_id' => $log->id,
                'status' => $log->status,
            ];
        }

        $log->fill([
            'event_type' => $eventType,
            'notifiable_type' => $notifiable ? $notifiable::class : null,
            'notifiable_id' => $notifiable?->getKey(),
            'target' => $target,
            'message' => $message,
            'status' => 'Pending',
            'fonnte_response' => null,
            'error_message' => null,
            'sent_at' => null,
        ])->save();

        try {
            $result = $this->whatsAppService->sendDocument($target, $message, $filePath, $filename, $mimeType);

            return $this->applySendResult($log, $result);
        } catch (Throwable $exception) {
            $log->update([
                'status' => 'Gagal',
                'fonnte_response' => null,
                'error_message' => $exception->getMessage(),
                'sent_at' => null,
            ]);

            return [
                'success' => false,
                'skipped' => false,
                'message' => $exception->getMessage(),
                'log_id' => $log->id,
                'status' => 'Gagal',
            ];
        }
    }

    public function markSkipped(
        string $eventType,
        ?Model $notifiable,
        ?string $target,
        ?string $message,
        string $reason,
        ?string $notificationKey = null,
    ): array {
        $notificationKey = $notificationKey ?: $this->buildNotificationKey($eventType, $notifiable, $target, (string) $message);

        /** @var WhatsAppNotificationLog $log */
        $log = WhatsAppNotificationLog::query()->updateOrCreate(
            ['notification_key' => $notificationKey],
            [
                'event_type' => $eventType,
                'notifiable_type' => $notifiable ? $notifiable::class : null,
                'notifiable_id' => $notifiable?->getKey(),
                'target' => $target,
                'message' => $message,
                'status' => 'Dilewati',
                'fonnte_response' => null,
                'error_message' => $reason,
                'sent_at' => null,
            ]
        );

        return [
            'success' => false,
            'skipped' => true,
            'message' => $reason,
            'log_id' => $log->id,
            'status' => 'Dilewati',
        ];
    }

    public function retry(WhatsAppNotificationLog $log): array
    {
        if (!in_array($log->status, ['Gagal', 'Dilewati', 'Pending'], true)) {
            return [
                'success' => false,
                'skipped' => true,
                'message' => 'Hanya log berstatus Gagal, Dilewati, atau Pending yang dapat dikirim ulang.',
                'log_id' => $log->id,
                'status' => $log->status,
            ];
        }

        if (!$log->target || !$log->message) {
            return [
                'success' => false,
                'skipped' => true,
                'message' => 'Log tidak memiliki nomor tujuan atau isi pesan yang dapat dikirim ulang.',
                'log_id' => $log->id,
                'status' => $log->status,
            ];
        }

        $log->update([
            'status' => 'Pending',
            'error_message' => null,
            'sent_at' => null,
        ]);

        try {
            $result = null;

            if ($log->event_type === 'payment_confirmed' && $log->notifiable instanceof BookingGroup) {
                try {
                    $invoice = $this->invoicePdfService->generate($log->notifiable);
                    $result = $this->whatsAppService->sendDocument(
                        $log->target,
                        $log->message,
                        $invoice['path'],
                        $invoice['filename'],
                        $invoice['mime_type'],
                    );
                } catch (Throwable) {
                    $result = null;
                }
            }

            $result ??= $this->whatsAppService->sendMessage($log->target, $log->message);

            return $this->applySendResult($log, $result);
        } catch (Throwable $exception) {
            $log->update([
                'status' => 'Gagal',
                'error_message' => $exception->getMessage(),
                'sent_at' => null,
            ]);

            return [
                'success' => false,
                'skipped' => false,
                'message' => $exception->getMessage(),
                'log_id' => $log->id,
                'status' => 'Gagal',
            ];
        }
    }

    public function buildNotificationKey(string $eventType, ?Model $notifiable, ?string $target = null, ?string $message = null): string
    {
        $identifier = $notifiable
            ? class_basename($notifiable) . ':' . $notifiable->getKey()
            : 'target:' . ($target ?: 'unknown') . ':hash:' . substr(sha1((string) $message), 0, 16);

        return $eventType . ':' . $identifier;
    }

    private function applySendResult(WhatsAppNotificationLog $log, array $result): array
    {
        $success = (bool) ($result['success'] ?? false);
        $skipped = (bool) ($result['skipped'] ?? false);
        $status = $success ? 'Terkirim' : ($skipped ? 'Dilewati' : 'Gagal');
        $message = $result['message'] ?? ($success ? null : 'Pengiriman WhatsApp gagal diproses.');

        $log->update([
            'status' => $status,
            'fonnte_response' => $result,
            'error_message' => $success ? null : $message,
            'sent_at' => $success ? now() : null,
        ]);

        return array_merge($result, [
            'log_id' => $log->id,
            'status' => $status,
        ]);
    }
}
