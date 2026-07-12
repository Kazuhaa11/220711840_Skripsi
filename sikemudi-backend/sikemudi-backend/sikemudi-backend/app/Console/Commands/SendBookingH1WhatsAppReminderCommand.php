<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\WhatsAppNotificationLog;
use App\Services\BookingWhatsAppNotificationService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendBookingH1WhatsAppReminderCommand extends Command
{
    protected $signature = 'sikemudi:whatsapp-pengingat-h1
        {--date= : Tanggal latihan target dalam format YYYY-MM-DD. Default: besok}
        {--limit= : Maksimal pesan yang dikirim dalam sekali jalan}
        {--dry-run : Tampilkan kandidat tanpa mengirim WhatsApp}';

    protected $description = 'Mengirim notifikasi WhatsApp pengingat H-1 untuk booking latihan yang aktif dan pembayarannya sudah terkonfirmasi.';

    public function __construct(
        private readonly BookingWhatsAppNotificationService $notificationService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $targetDate = $this->resolveTargetDate();
        $limit = $this->resolveLimit();
        $delaySeconds = max(0, (int) config('services.fonnte.send_delay_seconds', 8));
        $dryRun = (bool) $this->option('dry-run');

        $bookings = $this->bookingQuery($targetDate)
            ->limit(max($limit * 5, $limit))
            ->get();

        $this->info('Target tanggal latihan: ' . $targetDate->toDateString());
        $this->info('Kandidat ditemukan: ' . $bookings->count());
        $this->info('Limit kirim sekali jalan: ' . $limit);
        $this->info('Delay antar pesan: ' . $delaySeconds . ' detik');

        if ($dryRun) {
            $this->warn('Mode dry-run aktif. Tidak ada WhatsApp yang dikirim.');
        }

        $sent = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($bookings as $booking) {
            if ($sent >= $limit) {
                $this->warn('Limit pengiriman tercapai. Sisa kandidat akan dikirim pada run berikutnya.');
                break;
            }

            $notificationKey = $this->notificationKey($booking, $targetDate);

            $existingLog = WhatsAppNotificationLog::query()
                ->where('notification_key', $notificationKey)
                ->first();

            if ($existingLog?->status === 'Terkirim') {
                $skipped++;
                $this->line('Lewati ' . $booking->kode_booking . ' karena pengingat sudah pernah terkirim.');
                continue;
            }

            $target = $booking->participant?->user?->no_telepon;
            $message = $this->notificationService->bookingH1ReminderMessage($booking);

            if ($dryRun) {
                $this->line('[DRY RUN] ' . $booking->kode_booking . ' -> ' . ($target ?: 'nomor kosong'));
                continue;
            }

            $log = WhatsAppNotificationLog::query()->updateOrCreate(
                ['notification_key' => $notificationKey],
                [
                    'event_type' => 'booking_h1_reminder',
                    'notifiable_type' => Booking::class,
                    'notifiable_id' => $booking->id,
                    'target' => $target,
                    'message' => $message,
                    'status' => 'Pending',
                    'error_message' => null,
                ]
            );

            try {
                $result = $this->notificationService->notifyBookingH1Reminder($booking);

                if (($result['success'] ?? false) === true) {
                    $log->update([
                        'status' => 'Terkirim',
                        'fonnte_response' => $result,
                        'error_message' => null,
                        'sent_at' => now(),
                    ]);

                    $sent++;
                    $this->info('Terkirim: ' . $booking->kode_booking . ' -> ' . $target);

                    if ($sent < $limit && $delaySeconds > 0) {
                        sleep($delaySeconds);
                    }

                    continue;
                }

                $isSkipped = (bool) ($result['skipped'] ?? false);
                $status = $isSkipped ? 'Dilewati' : 'Gagal';
                $messageResult = $result['message'] ?? 'Pengiriman WhatsApp gagal diproses.';

                $log->update([
                    'status' => $status,
                    'fonnte_response' => $result,
                    'error_message' => $messageResult,
                    'sent_at' => null,
                ]);

                if ($isSkipped) {
                    $skipped++;
                    $this->warn('Dilewati: ' . $booking->kode_booking . ' - ' . $messageResult);
                } else {
                    $failed++;
                    $this->error('Gagal: ' . $booking->kode_booking . ' - ' . $messageResult);
                }
            } catch (Throwable $exception) {
                $failed++;

                $log->update([
                    'status' => 'Gagal',
                    'error_message' => $exception->getMessage(),
                    'sent_at' => null,
                ]);

                Log::warning('Pengingat H-1 WhatsApp gagal dikirim.', [
                    'booking_id' => $booking->id,
                    'kode_booking' => $booking->kode_booking,
                    'error' => $exception->getMessage(),
                ]);

                $this->error('Gagal: ' . $booking->kode_booking . ' - ' . $exception->getMessage());
            }
        }

        $this->newLine();
        $this->info('Ringkasan: terkirim=' . $sent . ', dilewati=' . $skipped . ', gagal=' . $failed);

        return self::SUCCESS;
    }

    private function bookingQuery(Carbon $targetDate)
    {
        return Booking::query()
            ->with([
                'participant.user',
                'coursePackage',
                'bookingGroup.coursePackage',
                'bookingGroup.payment',
                'bookingGroup.instructor.user',
                'bookingGroup.vehicle',
                'trainingSchedule.timeSlot',
                'trainingSchedule.instructor.user',
                'trainingSchedule.vehicle',
            ])
            ->whereIn('status', ['Dikonfirmasi', 'Dijadwalkan Ulang'])
            ->whereHas('bookingGroup', function ($query) {
                $query->whereIn('status', ['Dikonfirmasi', 'Dijadwalkan Ulang', 'Berlangsung']);
            })
            ->whereHas('bookingGroup.payment', function ($query) {
                $query->where('status', 'Terkonfirmasi');
            })
            ->whereHas('trainingSchedule', function ($query) use ($targetDate) {
                $query->whereDate('tanggal_latihan', $targetDate->toDateString())
                    ->whereNotIn('status', ['Selesai', 'Dibatalkan']);
            })
            ->orderBy('training_schedule_id')
            ->orderBy('sesi_ke')
            ->orderBy('id');
    }

    private function resolveTargetDate(): Carbon
    {
        $date = $this->option('date');

        if ($date) {
            return Carbon::parse($date)->startOfDay();
        }

        return now()->addDay()->startOfDay();
    }

    private function resolveLimit(): int
    {
        $optionLimit = $this->option('limit');

        if ($optionLimit !== null && $optionLimit !== '') {
            return max(1, (int) $optionLimit);
        }

        return max(1, (int) config('services.fonnte.h1_reminder_batch_limit', 20));
    }

    private function notificationKey(Booking $booking, Carbon $targetDate): string
    {
        return 'booking_h1_reminder:booking:' . $booking->id . ':date:' . $targetDate->toDateString();
    }
}
