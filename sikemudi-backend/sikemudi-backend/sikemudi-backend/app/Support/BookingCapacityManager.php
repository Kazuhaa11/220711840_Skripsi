<?php

namespace App\Support;

use App\Models\TrainingSchedule;

class BookingCapacityManager
{
    public const CAPACITY_HOLD_STATUSES = [
        'Menunggu Pembayaran',
        'Menunggu Konfirmasi Pembayaran',
        'Dikonfirmasi',
        'Dijadwalkan Ulang',
    ];

    public static function occupiesCapacity(?string $bookingStatus): bool
    {
        return in_array($bookingStatus, self::CAPACITY_HOLD_STATUSES, true);
    }

    public static function hasCapacity(TrainingSchedule $schedule): bool
    {
        return (int) $schedule->jumlah_booking < (int) $schedule->kapasitas;
    }

    public static function reserve(TrainingSchedule $schedule): void
    {
        $schedule->increment('jumlah_booking');
        $schedule->refresh();

        self::syncStatus($schedule);
    }

    public static function release(TrainingSchedule $schedule): void
    {
        if ((int) $schedule->jumlah_booking > 0) {
            $schedule->decrement('jumlah_booking');
            $schedule->refresh();
        }

        self::syncStatus($schedule);
    }

    public static function syncStatus(TrainingSchedule $schedule): void
    {
        if (in_array($schedule->status, ['Dibatalkan', 'Selesai', 'Berlangsung'], true)) {
            return;
        }

        $nextStatus = (int) $schedule->jumlah_booking >= (int) $schedule->kapasitas
            ? 'Penuh'
            : 'Tersedia';

        if ($schedule->status !== $nextStatus) {
            $schedule->update([
                'status' => $nextStatus,
            ]);
        }
    }

    /**
     * Menyinkronkan kapasitas jadwal berdasarkan booking yang benar-benar masih aktif.
     *
     * Ini dipakai untuk mencegah instruktur/kendaraan terkunci permanen setelah
     * hasil latihan disimpan dan booking berubah menjadi Selesai. Nilai
     * jumlah_booking tidak lagi dipercaya mentah-mentah jika data booking pada
     * jadwal tersebut seluruhnya sudah selesai/dibatalkan.
     */
    public static function syncFromBookings(TrainingSchedule $schedule): void
    {
        if ($schedule->status === 'Dibatalkan') {
            return;
        }

        $activeBookingsCount = $schedule->bookings()
            ->whereIn('status', self::CAPACITY_HOLD_STATUSES)
            ->count();

        $isPastSchedule = $schedule->tanggal_latihan
            && $schedule->tanggal_latihan->lt(now()->startOfDay());

        $nextStatus = (int) $activeBookingsCount >= (int) $schedule->kapasitas
            ? 'Penuh'
            : ($isPastSchedule ? 'Selesai' : 'Tersedia');

        $updates = [];

        if ((int) $schedule->jumlah_booking !== (int) $activeBookingsCount) {
            $updates['jumlah_booking'] = (int) $activeBookingsCount;
        }

        if ($schedule->status !== $nextStatus) {
            $updates['status'] = $nextStatus;
        }

        if ($updates !== []) {
            $schedule->update($updates);
            $schedule->refresh();
        }
    }
}
