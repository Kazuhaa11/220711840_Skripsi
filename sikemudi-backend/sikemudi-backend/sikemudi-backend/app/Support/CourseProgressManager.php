<?php

namespace App\Support;

use App\Models\Booking;
use App\Models\CoursePackage;
use App\Models\Participant;
use App\Models\TrainingSchedule;

class CourseProgressManager
{
    public static function totalSessionsFor(CoursePackage $package, ?TrainingSchedule $schedule = null): int
    {
        $packageDurationMinutes = max(1, (int) $package->durasi_jam * 60);
        $slotDurationMinutes = (int) ($schedule?->timeSlot?->durasi_menit ?? 0);

        if ($slotDurationMinutes <= 0) {
            $slotDurationMinutes = 120;
        }

        return max(1, (int) ceil($packageDurationMinutes / $slotDurationMinutes));
    }

    public static function isCompleted(Participant $participant): bool
    {
        return (int) $participant->jumlah_sesi_total > 0
            && (int) $participant->jumlah_sesi_selesai >= (int) $participant->jumlah_sesi_total;
    }

    public static function hasUnfinishedDifferentActivePackage(Participant $participant, CoursePackage $package): bool
    {
        return (bool) $participant->paket_aktif_id
            && (int) $participant->paket_aktif_id !== (int) $package->id
            && !self::isCompleted($participant);
    }

    public static function startOrSyncActivePackage(
        Participant $participant,
        CoursePackage $package,
        ?TrainingSchedule $schedule = null
    ): void {
        $participant->refresh();

        $totalSessions = self::totalSessionsFor($package, $schedule);
        $samePackage = (int) $participant->paket_aktif_id === (int) $package->id;
        $shouldStartNewPackage = !$participant->paket_aktif_id || !$samePackage || self::isCompleted($participant);

        if ($shouldStartNewPackage) {
            $participant->update([
                'paket_aktif_id' => $package->id,
                'jumlah_sesi_selesai' => 0,
                'jumlah_sesi_total' => $totalSessions,
                'status_sertifikat' => 'Dalam Proses',
            ]);

            $participant->refresh();
            return;
        }

        $updates = [];

        if ((int) $participant->jumlah_sesi_total !== $totalSessions) {
            $updates['jumlah_sesi_total'] = $totalSessions;
            $updates['jumlah_sesi_selesai'] = min((int) $participant->jumlah_sesi_selesai, $totalSessions);
        }

        if ($participant->status_sertifikat === 'Belum Ada') {
            $updates['status_sertifikat'] = 'Dalam Proses';
        }

        if ($updates !== []) {
            $participant->update($updates);
            $participant->refresh();
        }
    }

    public static function incrementCompletedSession(Participant $participant): void
    {
        $participant->refresh();

        $totalSessions = (int) $participant->jumlah_sesi_total;
        $completedSessions = (int) $participant->jumlah_sesi_selesai;

        $participant->update([
            'jumlah_sesi_selesai' => $totalSessions > 0
                ? min($completedSessions + 1, $totalSessions)
                : $completedSessions + 1,
        ]);

        $participant->refresh();
    }

    public static function applyCompletedSessionDelta(Participant $participant, int $delta): void
    {
        if ($delta === 0) {
            return;
        }

        $participant->refresh();

        $totalSessions = (int) $participant->jumlah_sesi_total;
        $nextCompletedSessions = max(0, (int) $participant->jumlah_sesi_selesai + $delta);

        if ($totalSessions > 0) {
            $nextCompletedSessions = min($nextCompletedSessions, $totalSessions);
        }

        $participant->update([
            'jumlah_sesi_selesai' => $nextCompletedSessions,
        ]);

        $participant->refresh();
    }

    public static function syncCertificateStatus(Participant $participant): void
    {
        $participant->refresh();

        if ($participant->certificates()->where('status', 'Terbit')->exists()) {
            $participant->update([
                'status_sertifikat' => 'Terbit',
            ]);

            $participant->refresh();
            return;
        }

        if ((bool) $participant->paket_aktif_id || $participant->trainingResults()->exists()) {
            $participant->update([
                'status_sertifikat' => 'Dalam Proses',
            ]);

            $participant->refresh();
            return;
        }

        $participant->update([
            'status_sertifikat' => 'Belum Ada',
        ]);

        $participant->refresh();
    }

    public static function hasActiveCertificateForPackage(Participant $participant, int $packageId): bool
    {
        return $participant->certificates()
            ->where('paket_id', $packageId)
            ->whereIn('status', ['Draft', 'Terbit'])
            ->exists();
    }

    public static function participantHasOtherActiveBookingPackage(Participant $participant, CoursePackage $package): bool
    {
        return Booking::query()
            ->where('participant_id', $participant->id)
            ->where('course_package_id', '!=', $package->id)
            ->whereNotIn('status', ['Dibatalkan', 'Selesai'])
            ->exists();
    }
}
