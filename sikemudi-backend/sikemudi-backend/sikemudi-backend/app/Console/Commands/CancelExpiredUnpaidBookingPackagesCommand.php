<?php

namespace App\Console\Commands;

use App\Models\Booking;
use App\Models\BookingGroup;
use App\Models\BookingHistory;
use App\Models\BookingPayment;
use App\Models\Participant;
use App\Models\TrainingSchedule;
use App\Services\BookingWhatsAppNotificationService;
use App\Support\BookingCapacityManager;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class CancelExpiredUnpaidBookingPackagesCommand extends Command
{
    protected $signature = 'sikemudi:booking-auto-cancel-belum-upload-bukti
        {--minutes= : Batas menit upload bukti bayar setelah booking dibuat. Default dari env BOOKING_PAYMENT_UPLOAD_TIMEOUT_MINUTES}
        {--limit= : Maksimal booking group yang diproses dalam sekali jalan. Default dari env BOOKING_PAYMENT_AUTO_CANCEL_BATCH_LIMIT}
        {--dry-run : Tampilkan kandidat tanpa membatalkan booking dan tanpa mengirim WhatsApp}';

    protected $description = 'Membatalkan otomatis booking paket yang belum upload bukti bayar setelah batas waktu tertentu agar jadwal instruktur dan kendaraan tidak tertahan.';

    public function __construct(
        private readonly BookingWhatsAppNotificationService $notificationService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $timeoutMinutes = $this->resolveTimeoutMinutes();
        $limit = $this->resolveLimit();
        $cutoff = now()->subMinutes($timeoutMinutes);
        $dryRun = (bool) $this->option('dry-run');

        $groups = $this->candidateQuery($cutoff)
            ->limit($limit)
            ->get();

        $this->info('Batas upload bukti bayar: ' . $timeoutMinutes . ' menit');
        $this->info('Cutoff booking: <= ' . $cutoff->format('Y-m-d H:i:s'));
        $this->info('Kandidat ditemukan: ' . $groups->count());
        $this->info('Limit proses sekali jalan: ' . $limit);

        if ($dryRun) {
            $this->warn('Mode dry-run aktif. Tidak ada booking yang dibatalkan dan tidak ada WhatsApp yang dikirim.');
        }

        $cancelled = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($groups as $group) {
            if ($dryRun) {
                $this->line('[DRY RUN] ' . $group->kode_group . ' - peserta: ' . ($group->participant?->user?->name ?: '-'));
                continue;
            }

            try {
                $result = DB::transaction(function () use ($group, $timeoutMinutes) {
                    return $this->cancelGroupIfStillExpired($group->id, $timeoutMinutes);
                });

                if (($result['cancelled'] ?? false) !== true) {
                    $skipped++;
                    $this->warn('Dilewati: ' . $group->kode_group . ' - ' . ($result['message'] ?? 'Tidak memenuhi syarat auto cancel.'));
                    continue;
                }

                /** @var BookingGroup $cancelledGroup */
                $cancelledGroup = $result['group'];

                try {
                    $this->notificationService->notifyPackageAutoCancelledPaymentTimeout($cancelledGroup, $timeoutMinutes);
                } catch (Throwable $notificationException) {
                    Log::warning('Notifikasi WhatsApp auto cancel booking gagal dikirim.', [
                        'booking_group_id' => $cancelledGroup->id,
                        'kode_group' => $cancelledGroup->kode_group,
                        'error' => $notificationException->getMessage(),
                    ]);
                }

                $cancelled++;
                $this->info('Dibatalkan otomatis: ' . $cancelledGroup->kode_group);
            } catch (Throwable $exception) {
                $failed++;

                Log::error('Auto cancel booking paket gagal diproses.', [
                    'booking_group_id' => $group->id,
                    'kode_group' => $group->kode_group,
                    'error' => $exception->getMessage(),
                ]);

                $this->error('Gagal: ' . $group->kode_group . ' - ' . $exception->getMessage());
            }
        }

        $this->newLine();
        $this->info('Ringkasan: dibatalkan=' . $cancelled . ', dilewati=' . $skipped . ', gagal=' . $failed);

        return self::SUCCESS;
    }

    private function candidateQuery(Carbon $cutoff)
    {
        return BookingGroup::query()
            ->with([
                'participant.user',
                'coursePackage',
                'payment',
                'bookings.trainingSchedule.timeSlot',
                'bookings.trainingSchedule.instructor.user',
                'bookings.trainingSchedule.vehicle',
            ])
            ->where('status', 'Menunggu Pembayaran')
            ->where(function ($query) use ($cutoff) {
                $query
                    ->where(function ($innerQuery) use ($cutoff) {
                        $innerQuery
                            ->whereNotNull('tanggal_booking')
                            ->where('tanggal_booking', '<=', $cutoff);
                    })
                    ->orWhere(function ($innerQuery) use ($cutoff) {
                        $innerQuery
                            ->whereNull('tanggal_booking')
                            ->where('created_at', '<=', $cutoff);
                    });
            })
            ->where(function ($query) {
                $query
                    ->whereDoesntHave('payment')
                    ->orWhereHas('payment', function ($paymentQuery) {
                        $paymentQuery
                            ->where(function ($methodQuery) {
                                $methodQuery
                                    ->whereNull('metode_pembayaran')
                                    ->orWhere('metode_pembayaran', 'Transfer');
                            })
                            ->where('status', 'Belum Upload')
                            ->whereNull('tanggal_upload')
                            ->where(function ($proofQuery) {
                                $proofQuery
                                    ->whereNull('bukti_bayar_path')
                                    ->orWhere('bukti_bayar_path', '');
                            })
                            ->where(function ($proofQuery) {
                                $proofQuery
                                    ->whereNull('bukti_bayar')
                                    ->orWhere('bukti_bayar', '');
                            });
                    });
            })
            ->orderBy('tanggal_booking')
            ->orderBy('created_at')
            ->orderBy('id');
    }

    private function cancelGroupIfStillExpired(int $groupId, int $timeoutMinutes): array
    {
        /** @var BookingGroup|null $group */
        $group = BookingGroup::query()
            ->with(['participant.user', 'coursePackage'])
            ->lockForUpdate()
            ->find($groupId);

        if (!$group) {
            return [
                'cancelled' => false,
                'message' => 'Booking paket tidak ditemukan.',
            ];
        }

        /** @var BookingPayment|null $payment */
        $payment = BookingPayment::query()
            ->where('booking_group_id', $group->id)
            ->lockForUpdate()
            ->first();

        if (!$this->isStillUnpaidWithoutProof($group, $payment)) {
            return [
                'cancelled' => false,
                'message' => 'Booking sudah upload bukti bayar atau statusnya sudah berubah.',
            ];
        }

        $now = now();
        $reason = 'Booking dibatalkan otomatis oleh sistem karena bukti pembayaran belum diunggah dalam ' . $timeoutMinutes . ' menit.';

        $bookings = Booking::query()
            ->with('trainingSchedule')
            ->where('booking_group_id', $group->id)
            ->lockForUpdate()
            ->orderBy('sesi_ke')
            ->orderBy('id')
            ->get();

        foreach ($bookings as $booking) {
            if (in_array($booking->status, ['Dibatalkan', 'Selesai'], true)) {
                continue;
            }

            $oldStatus = $booking->status;
            $oldScheduleId = $booking->training_schedule_id;

            $booking->update([
                'status' => 'Dibatalkan',
                'tanggal_dibatalkan' => $now,
                'alasan_pembatalan' => $reason,
            ]);

            BookingHistory::create([
                'booking_id' => $booking->id,
                'old_training_schedule_id' => $oldScheduleId,
                'new_training_schedule_id' => null,
                'aksi' => 'Dibatalkan',
                'status_sebelum' => $oldStatus,
                'status_sesudah' => 'Dibatalkan',
                'catatan' => $reason,
                'changed_by' => null,
            ]);

            if ($oldScheduleId) {
                /** @var TrainingSchedule|null $schedule */
                $schedule = TrainingSchedule::query()
                    ->with('bookings')
                    ->lockForUpdate()
                    ->find($oldScheduleId);

                if ($schedule) {
                    BookingCapacityManager::syncFromBookings($schedule);
                }
            }
        }

        if ($payment) {
            $payment->update([
                'catatan_admin' => $reason,
                'alasan_penolakan' => null,
                'tanggal_verifikasi' => null,
                'verified_by' => null,
            ]);
        }

        $group->update([
            'status' => 'Dibatalkan',
            'tanggal_dibatalkan' => $now,
            'alasan_pembatalan' => $reason,
        ]);

        $this->syncParticipantActivePackageAfterAutoCancel($group);

        $group = $group->fresh([
            'participant.user',
            'coursePackage',
            'payment',
            'refund',
            'instructor.user',
            'vehicle',
            'bookings' => function ($query) {
                $query->orderBy('sesi_ke')->orderBy('id');
            },
            'bookings.trainingSchedule.timeSlot',
        ]);

        return [
            'cancelled' => true,
            'group' => $group,
        ];
    }

    private function isStillUnpaidWithoutProof(BookingGroup $group, ?BookingPayment $payment): bool
    {
        if ($group->status !== 'Menunggu Pembayaran') {
            return false;
        }

        if (!$payment) {
            return true;
        }

        if ($payment->isCash()) {
            return false;
        }

        if ($payment->status !== 'Belum Upload') {
            return false;
        }

        return empty($payment->tanggal_upload)
            && empty($payment->bukti_bayar_path)
            && empty($payment->bukti_bayar);
    }

    private function syncParticipantActivePackageAfterAutoCancel(BookingGroup $cancelledGroup): void
    {
        /** @var Participant|null $participant */
        $participant = Participant::query()
            ->lockForUpdate()
            ->find($cancelledGroup->participant_id);

        if (!$participant) {
            return;
        }

        /** @var BookingGroup|null $activeGroup */
        $activeGroup = BookingGroup::query()
            ->where('participant_id', $participant->id)
            ->where('id', '!=', $cancelledGroup->id)
            ->whereIn('status', [
                'Menunggu Pembayaran',
                'Menunggu Konfirmasi Pembayaran',
                'Dikonfirmasi',
                'Dijadwalkan Ulang',
                'Berlangsung',
            ])
            ->latest('updated_at')
            ->first();

        if (!$activeGroup) {
            $participant->update([
                'paket_aktif_id' => null,
                'jumlah_sesi_total' => 0,
                'jumlah_sesi_selesai' => 0,
                'jumlah_absen' => 0,
                'status_sertifikat' => 'Belum Ada',
            ]);

            return;
        }

        $participant->update([
            'paket_aktif_id' => $activeGroup->course_package_id,
            'jumlah_sesi_total' => (int) $activeGroup->total_sesi,
            'jumlah_sesi_selesai' => (int) $activeGroup->jumlah_sesi_selesai,
            'status_sertifikat' => 'Dalam Proses',
        ]);
    }

    private function resolveTimeoutMinutes(): int
    {
        $optionMinutes = $this->option('minutes');

        if ($optionMinutes !== null && $optionMinutes !== '') {
            return max(1, (int) $optionMinutes);
        }

        return max(1, (int) env('BOOKING_PAYMENT_UPLOAD_TIMEOUT_MINUTES', 5));
    }

    private function resolveLimit(): int
    {
        $optionLimit = $this->option('limit');

        if ($optionLimit !== null && $optionLimit !== '') {
            return max(1, (int) $optionLimit);
        }

        return max(1, (int) env('BOOKING_PAYMENT_AUTO_CANCEL_BATCH_LIMIT', 50));
    }
}
