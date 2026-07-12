<?php

namespace App\Support;

use App\Models\TrainingResult;

class TrainingResultEligibility
{
    public static function resolve(TrainingResult $result): array
    {
        $booking = $result->booking;
        $group = $booking?->bookingGroup;
        $participant = $result->participant;

        $sessionNumber = (int) ($booking?->sesi_ke ?: 1);
        $totalSessions = (int) ($booking?->total_sesi ?: $group?->total_sesi ?: $participant?->jumlah_sesi_total ?: 1);
        $totalSessions = max(1, $totalSessions);
        $sessionNumber = max(1, $sessionNumber);
        $isFinalSession = $sessionNumber >= $totalSessions;

        $completedSessions = $group
            ? (int) $group->jumlah_sesi_selesai
            : (int) ($participant?->jumlah_sesi_selesai ?: 0);

        $isPackageCompleted = $totalSessions > 0 && $completedSessions >= $totalSessions;
        $hasPassingFinalResult = $result->status_kehadiran === 'Hadir'
            && $result->status_kelulusan === 'Lulus'
            && $result->nilai_akhir !== null
            && (float) $result->nilai_akhir >= 70;

        $hasActiveCertificate = $result->certificate !== null
            && in_array($result->certificate->status, ['Draft', 'Terbit'], true);

        $isValidatedByAdmin = $result->validated_at !== null;

        $canValidateCertificate = $isFinalSession
            && $isPackageCompleted
            && $hasPassingFinalResult
            && ! $isValidatedByAdmin
            && ! $hasActiveCertificate;

        $canIssueCertificate = $isFinalSession
            && $isPackageCompleted
            && $hasPassingFinalResult
            && $isValidatedByAdmin
            && ! $hasActiveCertificate;

        $validationStatus = 'Dalam Proses';

        if ($hasActiveCertificate) {
            $validationStatus = 'Sertifikat Terbit';
        } elseif ($canIssueCertificate) {
            $validationStatus = 'Siap Sertifikat';
        } elseif ($canValidateCertificate) {
            $validationStatus = 'Siap Validasi Sertifikat';
        } elseif ($isFinalSession && $result->status_kelulusan === 'Tidak Lulus') {
            $validationStatus = 'Tidak Lulus';
        } elseif ($isFinalSession && $hasPassingFinalResult && ! $isPackageCompleted) {
            $validationStatus = 'Paket Belum Selesai';
        }

        return [
            'booking_group_id' => $booking?->booking_group_id,
            'sesi_ke' => $sessionNumber,
            'total_sesi' => $totalSessions,
            'session_label' => 'Sesi ' . $sessionNumber . '/' . $totalSessions,
            'is_final_session' => $isFinalSession,
            'jumlah_sesi_selesai' => $completedSessions,
            'progress_label' => $completedSessions . '/' . $totalSessions . ' sesi',
            'is_package_completed' => $isPackageCompleted,
            'has_passing_final_result' => $hasPassingFinalResult,
            'is_validated_by_admin' => $isValidatedByAdmin,
            'has_active_certificate' => $hasActiveCertificate,
            'can_validate_certificate' => $canValidateCertificate,
            'can_issue_certificate' => $canIssueCertificate,
            'validation_status' => $validationStatus,
        ];
    }
}
