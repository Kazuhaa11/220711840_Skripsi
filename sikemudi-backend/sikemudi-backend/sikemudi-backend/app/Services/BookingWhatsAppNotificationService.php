<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingGroup;
use App\Models\BookingRefund;
use App\Models\Certificate;
use App\Support\DateFormatter;
use Throwable;

class BookingWhatsAppNotificationService
{
    public function __construct(
        private readonly WhatsAppNotificationLogService $notificationLogService,
        private readonly BookingPaymentInvoicePdfService $invoicePdfService,
    ) {
    }

    public function notifyBookingCreated(BookingGroup $group): array
    {
        $group = $this->loadGroup($group);
        $phone = $group->participant?->user?->no_telepon;

        return $this->sendLogged(
            'booking_created',
            $group,
            $phone,
            $this->bookingCreatedMessage($group),
        );
    }

    public function notifyPaymentConfirmed(BookingGroup $group): array
    {
        $group = $this->loadGroup($group);
        $phone = $group->participant?->user?->no_telepon;
        $invoiceUrl = null;

        try {
            $invoice = $this->invoicePdfService->generate($group);
            $invoiceUrl = $invoice['url'] ?? null;
        } catch (Throwable $exception) {
            $invoiceUrl = null;
        }

        return $this->sendLogged(
            'payment_confirmed',
            $group,
            $phone,
            $this->paymentConfirmedInvoiceMessage($group, $invoiceUrl),
        );
    }

    public function notifyPaymentRejected(BookingGroup $group): array
    {
        $group = $this->loadGroup($group);
        $phone = $group->participant?->user?->no_telepon;

        return $this->sendLogged(
            'payment_rejected',
            $group,
            $phone,
            $this->paymentRejectedMessage($group),
        );
    }

    public function notifyPackageCancelled(BookingGroup $group): array
    {
        $group = $this->loadGroup($group);
        $phone = $group->participant?->user?->no_telepon;

        return $this->sendLogged(
            'package_cancelled',
            $group,
            $phone,
            $this->packageCancelledMessage($group),
        );
    }

    public function notifyPackageAutoCancelledPaymentTimeout(BookingGroup $group, int $timeoutMinutes = 5): array
    {
        $group = $this->loadGroup($group);
        $phone = $group->participant?->user?->no_telepon;

        return $this->sendLogged(
            'package_auto_cancelled_payment_timeout',
            $group,
            $phone,
            $this->packageAutoCancelledPaymentTimeoutMessage($group, $timeoutMinutes),
        );
    }

    public function notifyRefundFinished(BookingRefund $refund): array
    {
        $refund = $refund->loadMissing([
            'bookingGroup.participant.user',
            'bookingGroup.coursePackage',
            'bookingPayment',
            'processor',
        ]);

        $phone = $refund->bookingGroup?->participant?->user?->no_telepon;

        return $this->sendLogged(
            'refund_finished',
            $refund,
            $phone,
            $this->refundFinishedMessage($refund),
        );
    }

    public function notifyCertificatePublished(Certificate $certificate): array
    {
        $certificate = $certificate->loadMissing([
            'participant.user',
            'coursePackage',
            'trainingResult.booking.bookingGroup',
        ]);

        $phone = $certificate->participant?->user?->no_telepon;

        if ($certificate->status !== 'Terbit') {
            return $this->notificationLogService->markSkipped(
                'certificate_published',
                $certificate,
                $phone,
                null,
                'Sertifikat belum berstatus Terbit.',
                $this->notificationKey('certificate_published', $certificate),
            );
        }

        return $this->sendLogged(
            'certificate_published',
            $certificate,
            $phone,
            $this->certificatePublishedMessage($certificate),
        );
    }

    public function notifyBookingH1Reminder(Booking $booking): array
    {
        $booking = $booking->loadMissing([
            'participant.user',
            'coursePackage',
            'bookingGroup.coursePackage',
            'bookingGroup.instructor.user',
            'bookingGroup.vehicle',
            'bookingGroup.payment',
            'trainingSchedule.timeSlot',
            'trainingSchedule.instructor.user',
            'trainingSchedule.vehicle',
        ]);

        $phone = $booking->participant?->user?->no_telepon;
        $notificationKey = $this->bookingH1ReminderNotificationKey(
            $booking,
            (string) $booking->trainingSchedule?->tanggal_latihan,
        );

        if (!in_array($booking->status, ['Dikonfirmasi', 'Dijadwalkan Ulang'], true)) {
            return $this->notificationLogService->markSkipped(
                'booking_h1_reminder',
                $booking,
                $phone,
                $this->bookingH1ReminderMessage($booking),
                'Booking tidak dalam status aktif untuk pengingat H-1.',
                $notificationKey,
            );
        }

        $paymentStatus = $booking->bookingGroup?->payment?->status ?? $booking->payment?->status;

        if ($paymentStatus !== 'Terkonfirmasi') {
            return $this->notificationLogService->markSkipped(
                'booking_h1_reminder',
                $booking,
                $phone,
                $this->bookingH1ReminderMessage($booking),
                'Pembayaran booking belum terkonfirmasi.',
                $notificationKey,
            );
        }

        return $this->sendLogged(
            'booking_h1_reminder',
            $booking,
            $phone,
            $this->bookingH1ReminderMessage($booking),
            $notificationKey,
        );
    }

    private function sendLogged(
        string $eventType,
        BookingGroup|Booking|BookingRefund|Certificate $notifiable,
        ?string $target,
        string $message,
        ?string $notificationKey = null,
    ): array {
        return $this->notificationLogService->sendLogged(
            $eventType,
            $notifiable,
            $target,
            $message,
            $notificationKey ?: $this->notificationKey($eventType, $notifiable),
        );
    }

    private function notificationKey(string $eventType, BookingGroup|Booking|BookingRefund|Certificate $notifiable, array $extra = []): string
    {
        $key = $eventType . ':' . class_basename($notifiable) . ':' . $notifiable->getKey();

        foreach ($extra as $name => $value) {
            if ($value !== null && $value !== '') {
                $key .= ':' . $name . ':' . $value;
            }
        }

        return $key;
    }

    private function bookingH1ReminderNotificationKey(Booking $booking, ?string $scheduleDate): string
    {
        return 'booking_h1_reminder:booking:' . $booking->id . ':date:' . ($scheduleDate ?: 'unknown');
    }

    private function bookingCreatedMessage(BookingGroup $group): string
    {
        $participantName = $group->participant?->user?->name ?: 'Peserta';
        $packageName = $group->coursePackage?->nama_paket ?: 'Paket kursus';
        $firstSession = $this->firstSessionLabel($group);
        $dashboardUrl = $this->frontendUrl('/peserta/jadwal-saya');
        $payment = $group->payment;
        $isCash = $payment?->metode_pembayaran === 'Cash';
        $paymentInstruction = $isCash
            ? 'Silakan lakukan pembayaran cash kepada admin. Booking akan aktif setelah admin mengonfirmasi pembayaran cash tersebut.'
            : 'Silakan upload bukti pembayaran melalui menu Jadwal Saya agar booking dapat diverifikasi admin.';

        return implode("\n", array_filter([
            'Halo ' . $participantName . ',',
            '',
            'Booking paket kursus Anda berhasil dibuat.',
            'Kode Booking: ' . $group->kode_group,
            'Paket: ' . $packageName,
            'Total Sesi: ' . (int) $group->total_sesi . ' sesi',
            'Nominal Tagihan: ' . $this->rupiah($group->harga_paket),
            'Metode Pembayaran: ' . ($isCash ? 'Cash' : 'Transfer Bank'),
            $firstSession ? 'Sesi Pertama: ' . $firstSession : null,
            '',
            $paymentInstruction,
            $dashboardUrl ? 'Link: ' . $dashboardUrl : null,
            '',
            'Terima kasih.',
            'SIKEMUDI',
        ], fn ($line) => $line !== null));
    }

    private function paymentConfirmedInvoiceMessage(BookingGroup $group, ?string $invoiceUrl = null): string
    {
        $participantName = $group->participant?->user?->name ?: 'Peserta';
        $dashboardUrl = $this->frontendUrl('/peserta/jadwal-saya');

        return implode("\n", array_filter([
            'Halo ' . $participantName . ',',
            '',
            'Pembayaran booking paket Anda telah dikonfirmasi admin.',
            $invoiceUrl ? 'Invoice pembayaran dapat dibuka melalui link berikut:' : 'Invoice pembayaran belum dapat dibuat otomatis. Silakan cek detail pembayaran melalui menu Jadwal Saya.',
            $invoiceUrl,
            '',
            'Booking paket Anda sudah aktif. Silakan cek jadwal latihan di sistem.',
            $dashboardUrl ? 'Link Jadwal: ' . $dashboardUrl : null,
            '',
            'Terima kasih.',
            'SIKEMUDI',
        ], fn ($line) => $line !== null && $line !== ''));
    }

    private function paymentRejectedMessage(BookingGroup $group): string
    {
        $participantName = $group->participant?->user?->name ?: 'Peserta';
        $packageName = $group->coursePackage?->nama_paket ?: 'Paket kursus';
        $payment = $group->payment;
        $dashboardUrl = $this->frontendUrl('/peserta/jadwal-saya');

        return implode("\n", array_filter([
            'Halo ' . $participantName . ',',
            '',
            'Mohon maaf, pembayaran booking paket Anda belum dapat dikonfirmasi.',
            'Kode Booking: ' . $group->kode_group,
            'Paket: ' . $packageName,
            'Metode Pembayaran: ' . (($payment?->metode_pembayaran === 'Cash') ? 'Cash' : 'Transfer Bank'),
            'Status Pembayaran: Ditolak',
            $payment?->alasan_penolakan ? 'Alasan: ' . $payment->alasan_penolakan : null,
            $payment?->catatan_admin ? 'Catatan Admin: ' . $payment->catatan_admin : null,
            '',
            'Silakan upload ulang bukti pembayaran yang benar melalui menu Jadwal Saya.',
            $dashboardUrl ? 'Link: ' . $dashboardUrl : null,
            '',
            'Terima kasih.',
            'SIKEMUDI',
        ], fn ($line) => $line !== null));
    }

    private function packageCancelledMessage(BookingGroup $group): string
    {
        $participantName = $group->participant?->user?->name ?: 'Peserta';
        $packageName = $group->coursePackage?->nama_paket ?: 'Paket kursus';
        $refund = $group->refund;

        $refundLine = null;

        if ($refund) {
            $refundLine = 'Refund: ' . $refund->status_refund . ' - ' . $this->rupiah($refund->nominal_refund);
        } elseif ($group->payment?->status === 'Belum Upload' || $group->payment?->status === 'Ditolak') {
            $refundLine = 'Refund: Tidak dibuat karena pembayaran belum terkonfirmasi atau belum ada bukti bayar valid.';
        }

        return implode("\n", array_filter([
            'Halo ' . $participantName . ',',
            '',
            'Booking paket kursus Anda berhasil dibatalkan.',
            'Kode Booking: ' . $group->kode_group,
            'Paket: ' . $packageName,
            $group->alasan_pembatalan ? 'Alasan: ' . $group->alasan_pembatalan : null,
            $refundLine,
            '',
            'Jika ada proses refund, admin akan memproses sesuai data rekening yang Anda kirimkan.',
            '',
            'Terima kasih.',
            'SIKEMUDI',
        ], fn ($line) => $line !== null));
    }

    private function packageAutoCancelledPaymentTimeoutMessage(BookingGroup $group, int $timeoutMinutes): string
    {
        $participantName = $group->participant?->user?->name ?: 'Peserta';
        $packageName = $group->coursePackage?->nama_paket ?: 'Paket kursus';
        $dashboardUrl = $this->frontendUrl('/peserta/pilih-paket');

        return implode("\n", array_filter([
            'Halo ' . $participantName . ',',
            '',
            'Booking paket kursus Anda dibatalkan otomatis oleh sistem.',
            'Kode Booking: ' . $group->kode_group,
            'Paket: ' . $packageName,
            'Alasan: Bukti pembayaran belum diunggah dalam batas waktu ' . $timeoutMinutes . ' menit setelah booking dibuat.',
            '',
            'Jadwal instruktur dan kendaraan pada booking tersebut sudah dilepas agar dapat digunakan peserta lain.',
            'Refund: Tidak dibuat karena belum ada bukti pembayaran yang diunggah.',
            '',
            'Jika masih ingin mengikuti kursus, silakan lakukan booking ulang dan upload bukti pembayaran sebelum batas waktu berakhir.',
            $dashboardUrl ? 'Booking ulang: ' . $dashboardUrl : null,
            '',
            'Terima kasih.',
            'SIKEMUDI',
        ], fn ($line) => $line !== null));
    }

    private function refundFinishedMessage(BookingRefund $refund): string
    {
        $group = $refund->bookingGroup;
        $participantName = $group?->participant?->user?->name ?: 'Peserta';
        $packageName = $group?->coursePackage?->nama_paket ?: 'Paket kursus';

        return implode("\n", array_filter([
            'Halo ' . $participantName . ',',
            '',
            'Refund booking paket Anda sudah selesai diproses.',
            $group?->kode_group ? 'Kode Booking: ' . $group->kode_group : null,
            'Paket: ' . $packageName,
            'Nominal Refund: ' . $this->rupiah($refund->nominal_refund),
            'Tipe Refund: ' . $refund->tipe_refund,
            'Bank Tujuan: ' . $refund->bank_tujuan,
            'Nomor Rekening: ' . $refund->nomor_rekening,
            'Nama Penerima: ' . $refund->nama_penerima,
            $refund->catatan_admin ? 'Catatan Admin: ' . $refund->catatan_admin : null,
            '',
            'Silakan cek mutasi rekening tujuan Anda.',
            '',
            'Terima kasih.',
            'SIKEMUDI',
        ], fn ($line) => $line !== null));
    }

    private function certificatePublishedMessage(Certificate $certificate): string
    {
        $participantName = $certificate->participant?->user?->name ?: 'Peserta';
        $packageName = $certificate->coursePackage?->nama_paket ?: 'Paket kursus';
        $certificateUrl = $this->frontendUrl('/peserta/sertifikat');

        return implode("\n", array_filter([
            'Halo ' . $participantName . ',',
            '',
            'Selamat, sertifikat kursus mengemudi Anda sudah terbit.',
            'Nomor Sertifikat: ' . $certificate->nomor_sertifikat,
            'Paket: ' . $packageName,
            'Tanggal Terbit: ' . DateFormatter::date($certificate->tanggal_terbit),
            $certificate->verification_url ? 'Link Verifikasi Publik: ' . $certificate->verification_url : null,
            $certificateUrl ? 'Download Sertifikat: ' . $certificateUrl : null,
            '',
            'Silakan login ke sistem untuk mengunduh file sertifikat PDF.',
            '',
            'Terima kasih.',
            'SIKEMUDI',
        ], fn ($line) => $line !== null));
    }

    public function bookingH1ReminderMessage(Booking $booking): string
    {
        $participantName = $booking->participant?->user?->name ?: 'Peserta';
        $group = $booking->bookingGroup;
        $schedule = $booking->trainingSchedule;
        $slot = $schedule?->timeSlot;
        $packageName = $group?->coursePackage?->nama_paket
            ?: $booking->coursePackage?->nama_paket
            ?: 'Paket kursus';
        $instructor = $schedule?->instructor?->user?->name
            ?: $group?->instructor?->user?->name;
        $vehicle = $schedule?->vehicle ?: $group?->vehicle;
        $dashboardUrl = $this->frontendUrl('/peserta/jadwal-saya');

        $scheduleLabel = null;

        if ($schedule) {
            $scheduleLabel = DateFormatter::date($schedule->tanggal_latihan);

            if ($slot) {
                $scheduleLabel .= ', ' . DateFormatter::time($slot->jam_mulai) . ' - ' . DateFormatter::time($slot->jam_selesai);
            }
        }

        return implode("\n", array_filter([
            'Halo ' . $participantName . ',',
            '',
            'Pengingat H-1 jadwal latihan mengemudi Anda.',
            'Kode Booking: ' . ($group?->kode_group ?: $booking->kode_booking),
            'Paket: ' . $packageName,
            'Sesi: ' . ((int) $booking->sesi_ke ?: '-') . '/' . ((int) $booking->total_sesi ?: '-'),
            $scheduleLabel ? 'Jadwal: ' . $scheduleLabel : null,
            $instructor ? 'Instruktur: ' . $instructor : null,
            $vehicle ? 'Kendaraan: ' . $vehicle->nama_kendaraan . ' (' . $vehicle->nomor_plat . ')' : null,
            '',
            'Mohon hadir tepat waktu dan cek kembali jadwal Anda melalui sistem.',
            $dashboardUrl ? 'Link: ' . $dashboardUrl : null,
            '',
            'Terima kasih.',
            'SIKEMUDI',
        ], fn ($line) => $line !== null));
    }

    private function loadGroup(BookingGroup $group): BookingGroup
    {
        return $group->loadMissing([
            'participant.user',
            'coursePackage',
            'instructor.user',
            'vehicle',
            'payment',
            'refund',
            'bookings' => function ($query) {
                $query->orderBy('sesi_ke')->orderBy('id');
            },
            'bookings.trainingSchedule.timeSlot',
        ]);
    }

    private function firstSessionLabel(BookingGroup $group): ?string
    {
        /** @var Booking|null $firstBooking */
        $firstBooking = $group->bookings?->sortBy('sesi_ke')->first();
        $schedule = $firstBooking?->trainingSchedule;

        if (!$schedule) {
            return null;
        }

        $date = DateFormatter::date($schedule->tanggal_latihan);
        $slot = $schedule->timeSlot;

        if (!$slot) {
            return $date;
        }

        return $date . ', ' . DateFormatter::time($slot->jam_mulai) . ' - ' . DateFormatter::time($slot->jam_selesai);
    }

    private function rupiah($amount): string
    {
        return 'Rp' . number_format((float) $amount, 0, ',', '.');
    }

    private function frontendUrl(string $path): ?string
    {
        $baseUrl = rtrim((string) env('FRONTEND_URL', ''), '/');

        if ($baseUrl === '') {
            return null;
        }

        return $baseUrl . '/' . ltrim($path, '/');
    }
}
