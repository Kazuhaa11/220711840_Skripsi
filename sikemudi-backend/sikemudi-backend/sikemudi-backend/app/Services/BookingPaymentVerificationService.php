<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingHistory;
use App\Models\BookingPayment;
use App\Models\CoursePackage;
use App\Models\Participant;
use App\Models\TrainingSchedule;
use App\Support\BookingCapacityManager;
use App\Support\CourseProgressManager;
use Illuminate\Support\Facades\DB;

class BookingPaymentVerificationService
{
    public function confirmByPaymentId(string $paymentId, int $adminId, ?string $adminNote = null): array
    {
        return DB::transaction(function () use ($paymentId, $adminId, $adminNote) {
            /** @var BookingPayment|null $payment */
            $payment = BookingPayment::query()
                ->lockForUpdate()
                ->find($paymentId);

            if (!$payment) {
                return $this->error(404, 'Data pembayaran booking tidak ditemukan.');
            }

            /** @var Booking|null $booking */
            $booking = Booking::query()
                ->lockForUpdate()
                ->find($payment->booking_id);

            return $this->confirmLockedPayment($booking, $payment, $adminId, $adminNote);
        });
    }

    public function confirmByBookingId(string $bookingId, int $adminId, ?string $adminNote = null): array
    {
        return DB::transaction(function () use ($bookingId, $adminId, $adminNote) {
            /** @var Booking|null $booking */
            $booking = Booking::query()
                ->lockForUpdate()
                ->find($bookingId);

            if (!$booking) {
                return $this->error(404, 'Booking tidak ditemukan.');
            }

            /** @var BookingPayment|null $payment */
            $payment = BookingPayment::query()
                ->where('booking_id', $booking->id)
                ->lockForUpdate()
                ->first();

            if (!$payment) {
                return $this->error(404, 'Data pembayaran booking tidak ditemukan.');
            }

            return $this->confirmLockedPayment($booking, $payment, $adminId, $adminNote);
        });
    }

    public function rejectByPaymentId(
        string $paymentId,
        int $adminId,
        string $rejectionReason,
        ?string $adminNote = null
    ): array {
        return DB::transaction(function () use ($paymentId, $adminId, $rejectionReason, $adminNote) {
            /** @var BookingPayment|null $payment */
            $payment = BookingPayment::query()
                ->lockForUpdate()
                ->find($paymentId);

            if (!$payment) {
                return $this->error(404, 'Data pembayaran booking tidak ditemukan.');
            }

            /** @var Booking|null $booking */
            $booking = Booking::query()
                ->lockForUpdate()
                ->find($payment->booking_id);

            return $this->rejectLockedPayment($booking, $payment, $adminId, $rejectionReason, $adminNote);
        });
    }

    public function rejectByBookingId(
        string $bookingId,
        int $adminId,
        string $rejectionReason,
        ?string $adminNote = null
    ): array {
        return DB::transaction(function () use ($bookingId, $adminId, $rejectionReason, $adminNote) {
            /** @var Booking|null $booking */
            $booking = Booking::query()
                ->lockForUpdate()
                ->find($bookingId);

            if (!$booking) {
                return $this->error(404, 'Booking tidak ditemukan.');
            }

            /** @var BookingPayment|null $payment */
            $payment = BookingPayment::query()
                ->where('booking_id', $booking->id)
                ->lockForUpdate()
                ->first();

            if (!$payment) {
                return $this->error(404, 'Data pembayaran booking tidak ditemukan.');
            }

            return $this->rejectLockedPayment($booking, $payment, $adminId, $rejectionReason, $adminNote);
        });
    }

    private function confirmLockedPayment(
        ?Booking $booking,
        BookingPayment $payment,
        int $adminId,
        ?string $adminNote
    ): array {
        if ($payment->status !== 'Menunggu Konfirmasi') {
            return $this->error(422, 'Pembayaran hanya dapat dikonfirmasi jika statusnya Menunggu Konfirmasi.');
        }

        if (!$booking) {
            return $this->error(404, 'Booking tidak ditemukan.');
        }

        if ($booking->status !== 'Menunggu Konfirmasi Pembayaran') {
            return $this->error(422, 'Booking tidak berada pada status menunggu konfirmasi pembayaran.');
        }

        /** @var TrainingSchedule|null $schedule */
        $schedule = TrainingSchedule::query()
            ->lockForUpdate()
            ->find($booking->training_schedule_id);

        if (!$schedule) {
            return $this->error(404, 'Jadwal latihan tidak ditemukan.');
        }

        if (in_array($schedule->status, ['Dibatalkan', 'Selesai'], true)) {
            return $this->error(422, 'Jadwal latihan sudah tidak dapat menerima booking.');
        }

        $bookingAlreadyHoldsCapacity = BookingCapacityManager::occupiesCapacity($booking->status);

        if (!$bookingAlreadyHoldsCapacity && !BookingCapacityManager::hasCapacity($schedule)) {
            return $this->error(
                409,
                'Kapasitas jadwal sudah penuh karena slot sudah dikonfirmasi atau direservasi oleh booking lain. Ubah jadwal booking peserta terlebih dahulu atau tolak pembayaran dengan alasan slot penuh.'
            );
        }

        $oldBookingStatus = $booking->status;

        $payment->update([
            'status' => 'Terkonfirmasi',
            'tanggal_verifikasi' => now(),
            'catatan_admin' => $adminNote,
            'alasan_penolakan' => null,
            'verified_by' => $adminId,
        ]);

        $booking->update([
            'status' => 'Dikonfirmasi',
            'tanggal_dikonfirmasi' => now(),
        ]);

        /** @var Participant|null $participant */
        $participant = Participant::query()
            ->lockForUpdate()
            ->find($booking->participant_id);

        if ($participant && $booking->course_package_id) {
            /** @var CoursePackage|null $coursePackage */
            $coursePackage = CoursePackage::query()
                ->find($booking->course_package_id);

            if ($coursePackage) {
                CourseProgressManager::startOrSyncActivePackage($participant, $coursePackage, $schedule);
            }
        }

        if (!$bookingAlreadyHoldsCapacity) {
            BookingCapacityManager::reserve($schedule);
        } else {
            BookingCapacityManager::syncStatus($schedule);
        }

        BookingHistory::create([
            'booking_id' => $booking->id,
            'old_training_schedule_id' => $booking->training_schedule_id,
            'new_training_schedule_id' => $booking->training_schedule_id,
            'aksi' => 'Pembayaran Dikonfirmasi',
            'status_sebelum' => $oldBookingStatus,
            'status_sesudah' => 'Dikonfirmasi',
            'catatan' => $adminNote ?? 'Pembayaran dikonfirmasi oleh admin.',
            'changed_by' => $adminId,
        ]);

        return $this->success($booking->id, $payment->id);
    }

    private function rejectLockedPayment(
        ?Booking $booking,
        BookingPayment $payment,
        int $adminId,
        string $rejectionReason,
        ?string $adminNote
    ): array {
        if ($payment->status !== 'Menunggu Konfirmasi') {
            return $this->error(422, 'Pembayaran hanya dapat ditolak jika statusnya Menunggu Konfirmasi.');
        }

        if (!$booking) {
            return $this->error(404, 'Booking tidak ditemukan.');
        }

        if ($booking->status !== 'Menunggu Konfirmasi Pembayaran') {
            return $this->error(422, 'Pembayaran hanya dapat ditolak jika booking masih berstatus Menunggu Konfirmasi Pembayaran.');
        }

        $oldBookingStatus = $booking->status;
        $bookingHeldCapacity = BookingCapacityManager::occupiesCapacity($booking->status);

        /** @var TrainingSchedule|null $schedule */
        $schedule = $bookingHeldCapacity
            ? TrainingSchedule::query()->lockForUpdate()->find($booking->training_schedule_id)
            : null;

        $payment->update([
            'status' => 'Ditolak',
            'tanggal_verifikasi' => now(),
            'catatan_admin' => $adminNote,
            'alasan_penolakan' => $rejectionReason,
            'verified_by' => $adminId,
        ]);

        $booking->update([
            'status' => 'Menunggu Pembayaran',
            'tanggal_dikonfirmasi' => null,
        ]);

        if ($bookingHeldCapacity && $schedule) {
            BookingCapacityManager::syncStatus($schedule);
        }

        BookingHistory::create([
            'booking_id' => $booking->id,
            'old_training_schedule_id' => $booking->training_schedule_id,
            'new_training_schedule_id' => $booking->training_schedule_id,
            'aksi' => 'Pembayaran Ditolak',
            'status_sebelum' => $oldBookingStatus,
            'status_sesudah' => 'Menunggu Pembayaran',
            'catatan' => $rejectionReason,
            'changed_by' => $adminId,
        ]);

        return $this->success($booking->id, $payment->id);
    }

    private function success(int $bookingId, int $paymentId): array
    {
        return [
            'error' => false,
            'booking' => Booking::query()
                ->with([
                    'participant.user',
                    'trainingSchedule.timeSlot',
                    'trainingSchedule.instructor.user',
                    'trainingSchedule.vehicle',
                    'coursePackage',
                    'payment.verifier',
                    'trainingResult',
                ])
                ->find($bookingId),
            'payment' => BookingPayment::query()
                ->with([
                    'booking.participant.user',
                    'booking.trainingSchedule.timeSlot',
                    'booking.trainingSchedule.instructor.user',
                    'booking.trainingSchedule.vehicle',
                    'booking.coursePackage',
                    'verifier',
                ])
                ->find($paymentId),
        ];
    }

    private function error(int $status, string $message): array
    {
        return [
            'error' => true,
            'status' => $status,
            'message' => $message,
        ];
    }
}
