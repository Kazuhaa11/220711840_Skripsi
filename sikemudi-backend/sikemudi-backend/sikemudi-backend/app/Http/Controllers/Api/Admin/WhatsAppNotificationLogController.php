<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\WhatsAppNotificationLog;
use App\Services\WhatsAppNotificationLogService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WhatsAppNotificationLogController extends Controller
{
    public function __construct(
        private readonly WhatsAppNotificationLogService $notificationLogService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->query('per_page', 10);
        $perPage = max(1, min($perPage, 100));

        $baseQuery = $this->filteredQuery($request);

        $logs = (clone $baseQuery)
            ->latest('created_at')
            ->latest('id')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Log notifikasi WhatsApp berhasil diambil.',
            'data' => [
                'items' => collect($logs->items())
                    ->map(fn (WhatsAppNotificationLog $log) => $this->formatLog($log))
                    ->values(),
                'pagination' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                ],
                'stats' => $this->summaryStats($request),
                'filter_options' => $this->filterOptions(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $log = WhatsAppNotificationLog::query()->find($id);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Log notifikasi WhatsApp tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail log notifikasi WhatsApp berhasil diambil.',
            'data' => [
                'item' => $this->formatLog($log, true),
            ],
        ]);
    }

    public function retry(string $id): JsonResponse
    {
        $log = WhatsAppNotificationLog::query()->find($id);

        if (!$log) {
            return response()->json([
                'success' => false,
                'message' => 'Log notifikasi WhatsApp tidak ditemukan.',
            ], 404);
        }

        if (!in_array($log->status, ['Gagal', 'Dilewati', 'Pending'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya log berstatus Gagal, Dilewati, atau Pending yang dapat dikirim ulang.',
            ], 422);
        }

        if (!$log->target || !$log->message) {
            return response()->json([
                'success' => false,
                'message' => 'Log tidak memiliki nomor tujuan atau isi pesan yang dapat dikirim ulang.',
            ], 422);
        }

        $result = $this->notificationLogService->retry($log);
        $success = (bool) ($result['success'] ?? false);
        $skipped = (bool) ($result['skipped'] ?? false);

        return response()->json([
            'success' => $success,
            'message' => $success
                ? 'Notifikasi WhatsApp berhasil dikirim ulang.'
                : ($skipped ? 'Pengiriman ulang WhatsApp dilewati.' : 'Pengiriman ulang WhatsApp gagal.'),
            'data' => [
                'item' => $this->formatLog($log->fresh(), true),
                'result' => $result,
            ],
        ], $success || $skipped ? 200 : 500);
    }

    private function filteredQuery(Request $request): Builder
    {
        return WhatsAppNotificationLog::query()
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $keyword = trim((string) $request->query('q'));

                $query->where(function (Builder $subQuery) use ($keyword) {
                    $subQuery
                        ->where('notification_key', 'like', "%{$keyword}%")
                        ->orWhere('event_type', 'like', "%{$keyword}%")
                        ->orWhere('target', 'like', "%{$keyword}%")
                        ->orWhere('message', 'like', "%{$keyword}%")
                        ->orWhere('error_message', 'like', "%{$keyword}%");
                });
            })
            ->when($request->filled('status') && $request->query('status') !== 'all', function (Builder $query) use ($request) {
                $query->where('status', $request->query('status'));
            })
            ->when($request->filled('event_type') && $request->query('event_type') !== 'all', function (Builder $query) use ($request) {
                $query->where('event_type', $request->query('event_type'));
            })
            ->when($request->filled('target'), function (Builder $query) use ($request) {
                $target = trim((string) $request->query('target'));
                $query->where('target', 'like', "%{$target}%");
            })
            ->when($request->filled('start_date'), function (Builder $query) use ($request) {
                $query->whereDate('created_at', '>=', $request->query('start_date'));
            })
            ->when($request->filled('end_date'), function (Builder $query) use ($request) {
                $query->whereDate('created_at', '<=', $request->query('end_date'));
            });
    }

    private function summaryStats(Request $request): array
    {
        $query = $this->filteredQuery($request);

        return [
            'total' => (clone $query)->count(),
            'pending' => (clone $query)->where('status', 'Pending')->count(),
            'sent' => (clone $query)->where('status', 'Terkirim')->count(),
            'skipped' => (clone $query)->where('status', 'Dilewati')->count(),
            'failed' => (clone $query)->where('status', 'Gagal')->count(),
        ];
    }

    private function filterOptions(): array
    {
        $eventTypes = WhatsAppNotificationLog::query()
            ->select('event_type')
            ->whereNotNull('event_type')
            ->distinct()
            ->orderBy('event_type')
            ->pluck('event_type')
            ->map(fn (string $eventType) => [
                'label' => $this->resolveEventTypeLabel($eventType),
                'value' => $eventType,
            ])
            ->values();

        return [
            'statuses' => [
                ['label' => 'Semua Status', 'value' => 'all'],
                ['label' => 'Pending', 'value' => 'Pending'],
                ['label' => 'Terkirim', 'value' => 'Terkirim'],
                ['label' => 'Dilewati', 'value' => 'Dilewati'],
                ['label' => 'Gagal', 'value' => 'Gagal'],
            ],
            'event_types' => collect([['label' => 'Semua Event', 'value' => 'all']])
                ->merge($eventTypes)
                ->values(),
        ];
    }

    private function formatLog(?WhatsAppNotificationLog $log, bool $withResponse = false): ?array
    {
        if (!$log) {
            return null;
        }

        return [
            'id' => $log->id,
            'notification_key' => $log->notification_key,
            'event_type' => $log->event_type,
            'event_type_label' => $this->resolveEventTypeLabel($log->event_type),
            'notifiable_type' => $log->notifiable_type,
            'notifiable_type_label' => $this->resolveNotifiableTypeLabel($log->notifiable_type),
            'notifiable_id' => $log->notifiable_id,
            'target' => $log->target,
            'message' => $log->message,
            'message_preview' => Str::limit((string) $log->message, 120),
            'status' => $log->status,
            'status_label' => $this->resolveStatusLabel($log->status),
            'error_message' => $log->error_message,
            'sent_at' => optional($log->sent_at)->toISOString(),
            'sent_at_label' => $this->formatDateTime($log->sent_at),
            'created_at' => optional($log->created_at)->toISOString(),
            'created_at_label' => $this->formatDateTime($log->created_at),
            'updated_at' => optional($log->updated_at)->toISOString(),
            'updated_at_label' => $this->formatDateTime($log->updated_at),
            'can_retry' => in_array($log->status, ['Gagal', 'Dilewati', 'Pending'], true)
                && filled($log->target)
                && filled($log->message),
            'fonnte_response' => $withResponse ? $log->fonnte_response : null,
        ];
    }

    private function resolveStatusLabel(?string $status): string
    {
        return match ($status) {
            'Pending' => 'Menunggu Proses',
            'Terkirim' => 'Terkirim',
            'Dilewati' => 'Dilewati',
            'Gagal' => 'Gagal',
            default => $status ?: '-',
        };
    }

    private function resolveEventTypeLabel(?string $eventType): string
    {
        return match ($eventType) {
            'booking_created' => 'Booking Dibuat',
            'payment_confirmed' => 'Pembayaran Dikonfirmasi',
            'payment_rejected' => 'Pembayaran Ditolak',
            'package_cancelled' => 'Paket Dibatalkan',
            'package_auto_cancelled_payment_timeout' => 'Auto Cancel Pembayaran',
            'refund_finished' => 'Refund Selesai',
            'certificate_published' => 'Sertifikat Terbit',
            'booking_h1_reminder' => 'Pengingat H-1',
            default => $eventType ? Str::headline(str_replace('_', ' ', $eventType)) : '-',
        };
    }

    private function resolveNotifiableTypeLabel(?string $type): string
    {
        if (!$type) {
            return '-';
        }

        return class_basename($type);
    }

    private function formatDateTime($dateTime): ?string
    {
        if (!$dateTime) {
            return null;
        }

        return $dateTime->timezone(config('app.timezone'))->format('d/m/Y H:i');
    }
}
