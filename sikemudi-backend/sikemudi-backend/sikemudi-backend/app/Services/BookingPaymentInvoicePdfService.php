<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingGroup;
use App\Support\DateFormatter;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class BookingPaymentInvoicePdfService
{
    public function generate(BookingGroup $group): array
    {
        $group = $this->loadGroup($group);
        $payment = $group->payment;
        $fileName = $this->fileName($group->kode_group);
        $relativePath = $this->relativePath($group->kode_group);

        $pdf = Pdf::loadView('pdf.booking-payment-invoice', [
            'group' => $group,
            'payment' => $payment,
            'invoiceNumber' => 'INV-' . $group->kode_group,
            'participantName' => $group->participant?->user?->name ?: 'Peserta',
            'participantPhone' => $group->participant?->user?->no_telepon,
            'packageName' => $group->coursePackage?->nama_paket ?: 'Paket kursus',
            'confirmedAt' => DateFormatter::dateTime($payment?->tanggal_verifikasi) ?: DateFormatter::dateTime($group->tanggal_dikonfirmasi),
            'nominalPaid' => (float) ($payment?->nominal_bayar ?: $group->harga_paket),
            'paymentMethod' => $payment?->metode_pembayaran ?: 'Transfer',
            'firstSessionLabel' => $this->firstSessionLabel($group),
        ])->setPaper('a4', 'portrait');

        Storage::disk('public')->put($relativePath, $pdf->output());

        return $this->buildInfo($group->kode_group);
    }

    public function ensureGenerated(BookingGroup $group): array
    {
        $relativePath = $this->relativePath($group->kode_group);

        if (!Storage::disk('public')->exists($relativePath)) {
            return $this->generate($group);
        }

        return $this->buildInfo($group->kode_group);
    }

    public function publicViewUrl(string $bookingCode): string
    {
        return route('publik.invoice-pembayaran.show', [
            'kode' => $bookingCode,
            'token' => $this->tokenForCode($bookingCode),
        ]);
    }

    public function tokenForCode(string $bookingCode): string
    {
        return substr(hash_hmac('sha256', $bookingCode, (string) config('app.key')), 0, 32);
    }

    public function relativePath(string $bookingCode): string
    {
        return 'sikemudi/invoices/' . $this->fileName($bookingCode);
    }

    public function fileName(string $bookingCode): string
    {
        return 'invoice-' . $this->safeFileName($bookingCode) . '-' . substr($this->tokenForCode($bookingCode), 0, 8) . '.pdf';
    }

    private function buildInfo(string $bookingCode): array
    {
        $relativePath = $this->relativePath($bookingCode);

        return [
            'path' => Storage::disk('public')->path($relativePath),
            'relative_path' => $relativePath,
            'url' => $this->publicViewUrl($bookingCode),
            'storage_url' => $this->storageUrl($relativePath),
            'filename' => $this->fileName($bookingCode),
            'mime_type' => 'application/pdf',
            'size_bytes' => Storage::disk('public')->exists($relativePath) ? Storage::disk('public')->size($relativePath) : null,
        ];
    }

    private function loadGroup(BookingGroup $group): BookingGroup
    {
        return $group->loadMissing([
            'participant.user',
            'coursePackage',
            'instructor.user',
            'vehicle',
            'payment.verifier',
            'bookings' => function ($query) {
                $query->orderBy('sesi_ke')->orderBy('id');
            },
            'bookings.trainingSchedule.timeSlot',
            'bookings.trainingSchedule.instructor.user',
            'bookings.trainingSchedule.vehicle',
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

    private function storageUrl(string $relativePath): string
    {
        $url = Storage::disk('public')->url($relativePath);

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        $appUrl = rtrim((string) config('app.url'), '/');

        return $appUrl . '/' . ltrim($url, '/');
    }

    private function safeFileName(string $value): string
    {
        $safe = preg_replace('/[^A-Za-z0-9\-_]/', '-', $value);

        return trim((string) $safe, '-') ?: 'invoice';
    }
}
