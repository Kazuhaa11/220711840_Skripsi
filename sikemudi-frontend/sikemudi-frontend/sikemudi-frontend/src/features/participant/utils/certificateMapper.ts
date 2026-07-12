import type { ParticipantDigitalCertificate } from "@/features/participant/constants/type";
import type { CertificateResponseItem } from "@/types/certificate";
import type { ParticipantDashboardData } from "@/types/dashboard";

const DEFAULT_SHARE_URL = "http://localhost:5173/verifikasi-sertifikat";

function normalizeStatus(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function formatScore(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "--";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function formatFileSize(size: number | null | undefined): string | null {
  if (!size) {
    return null;
  }

  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getParticipantName(
  item: CertificateResponseItem,
  dashboard?: ParticipantDashboardData | null,
): string {
  return (
    item.peserta?.nama_peserta ??
    dashboard?.profile?.nama_peserta ??
    dashboard?.informasi_akun?.nama_lengkap ??
    "Peserta SIKEMUDI"
  );
}

function getPackageName(
  item: CertificateResponseItem,
  dashboard?: ParticipantDashboardData | null,
): string {
  return (
    item.course_package?.nama_paket ??
    dashboard?.informasi_akun?.tipe_pelatihan ??
    "Paket Kursus"
  );
}

function getProgress(dashboard?: ParticipantDashboardData | null) {
  const progress = dashboard?.sertifikat_digital?.progress;

  return {
    completed: progress?.completed ?? 0,
    total: Math.max(progress?.total ?? 1, 1),
    percent: Math.min(Math.max(progress?.percentage ?? 0, 0), 100),
  };
}

function buildDefaultRequirements(
  completed: number,
  total: number,
  isPassed: boolean,
  isIssued: boolean,
) {
  return [
    {
      id: "req-booking",
      label: "Memiliki booking kursus yang valid",
      completed: total > 0,
    },
    {
      id: "req-sessions",
      label: `Menyelesaikan seluruh sesi latihan (${completed}/${total})`,
      completed: completed >= total,
    },
    {
      id: "req-graduation",
      label: "Dinyatakan lulus oleh instruktur/admin",
      completed: isPassed,
    },
    {
      id: "req-certificate",
      label: "Sertifikat diterbitkan oleh admin",
      completed: isIssued,
    },
  ];
}

export function pickPrimaryCertificate(
  items: CertificateResponseItem[],
): CertificateResponseItem | null {
  const published = items.find((item) => normalizeStatus(item.status) === "terbit");

  return published ?? items[0] ?? null;
}

export function mapCertificateToDigitalCertificate(
  item: CertificateResponseItem,
  dashboard?: ParticipantDashboardData | null,
): ParticipantDigitalCertificate {
  const status = normalizeStatus(item.status);
  const result = item.training_result;
  const progress = getProgress(dashboard);
  const isAvailable = status === "terbit";
  const isPassed = normalizeStatus(result?.status_kelulusan) === "lulus" || isAvailable;
  const score = formatScore(result?.nilai_akhir);
  const shareUrl = item.verification_url || DEFAULT_SHARE_URL;
  const qrCodeImageUrl = item.qr_code_url ?? null;

  return {
    id: `CERT-${item.id}`,
    backendId: item.id,
    participantName: getParticipantName(item, dashboard),
    participantTier: item.peserta?.kode_peserta ?? "PESERTA SIKEMUDI",
    packageName: getPackageName(item, dashboard),
    isAvailable,
    graduationStatus: isPassed ? "LULUS" : "DALAM_PROSES",
    verificationLabel: isAvailable ? "Terverifikasi" : item.status ?? "Belum Terbit",
    issueDate: item.tanggal_terbit ?? null,
    certificateNumber: item.nomor_sertifikat ?? null,
    verificationCode: item.kode_verifikasi ?? null,
    certificateStatus: item.status ?? null,
    averageScore: score,
    completedSessions: isAvailable
      ? Math.max(progress.completed, progress.total)
      : progress.completed,
    totalSessions: progress.total,
    progressPercent: isAvailable ? 100 : progress.percent,
    achievementText: isAvailable
      ? `Telah menyelesaikan ${getPackageName(item, dashboard)} dan dinyatakan lulus dengan nilai akhir ${score}.`
      : "Sertifikat digital belum aktif. Silakan pastikan status kelulusan dan penerbitan sertifikat sudah diproses admin.",
    shareUrl,
    qrCode: qrCodeImageUrl ?? item.qr_code ?? item.verification_url ?? null,
    qrCodeImageUrl,
    pdfAvailable: Boolean(item.pdf_path || item.pdf_url || item.pdf_download_url),
    pdfOriginalName: item.pdf_original_name ?? null,
    pdfSizeLabel: formatFileSize(item.pdf_size),
    instructorName: result?.instructor?.nama_instruktur ?? null,
    trainingDate: result?.tanggal_latihan ?? result?.training_schedule?.tanggal_latihan ?? null,
    attendanceStatus: result?.status_kehadiran ?? null,
    practiceScore: formatScore(result?.nilai_praktik),
    attitudeScore: formatScore(result?.nilai_sikap),
    understandingScore: formatScore(result?.nilai_pemahaman),
    instructorNote: result?.catatan_instruktur ?? null,
    adminNote: result?.catatan_admin ?? item.catatan ?? null,
    requirements: buildDefaultRequirements(
      isAvailable ? progress.total : progress.completed,
      progress.total,
      isPassed,
      isAvailable,
    ),
    importantNote: item.pdf_path
      ? "PDF sertifikat tersimpan di private storage dan hanya bisa diunduh oleh peserta pemilik sertifikat atau admin."
      : "Sertifikat sudah tercatat, tetapi file PDF belum dibuat. Hubungi admin untuk generate PDF sertifikat.",
  };
}

export function mapUnavailableCertificateFromDashboard(
  dashboard?: ParticipantDashboardData | null,
): ParticipantDigitalCertificate {
  const progress = getProgress(dashboard);
  const status = dashboard?.sertifikat_digital?.status ?? dashboard?.profile?.status_sertifikat;
  const isPassed = normalizeStatus(status).includes("lulus");
  const packageName = dashboard?.informasi_akun?.tipe_pelatihan ?? "Paket Kursus";

  return {
    id: "CERT-PARTICIPANT-EMPTY",
    backendId: null,
    participantName:
      dashboard?.profile?.nama_peserta ??
      dashboard?.informasi_akun?.nama_lengkap ??
      "Peserta SIKEMUDI",
    participantTier: dashboard?.profile?.kode_peserta ?? "PESERTA SIKEMUDI",
    packageName,
    isAvailable: false,
    graduationStatus: isPassed ? "LULUS" : "DALAM_PROSES",
    verificationLabel: status ?? "Belum Terbit",
    issueDate: null,
    certificateNumber: null,
    verificationCode: null,
    certificateStatus: status ?? null,
    averageScore: "--",
    completedSessions: progress.completed,
    totalSessions: progress.total,
    progressPercent: progress.percent,
    achievementText:
      "Sertifikat digital akan tersedia setelah peserta menyelesaikan sesi latihan, dinyatakan lulus, dan sertifikat diterbitkan oleh admin.",
    shareUrl: DEFAULT_SHARE_URL,
    qrCodeImageUrl: null,
    pdfAvailable: false,
    pdfOriginalName: null,
    pdfSizeLabel: null,
    requirements: buildDefaultRequirements(
      progress.completed,
      progress.total,
      isPassed,
      false,
    ),
    importantNote:
      "Jika seluruh sesi sudah selesai tetapi sertifikat belum tersedia, tunggu admin memvalidasi hasil latihan dan menerbitkan sertifikat digital.",
  };
}
