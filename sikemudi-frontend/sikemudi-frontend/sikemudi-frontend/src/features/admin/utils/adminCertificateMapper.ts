import type {
  AdminCertificateApi,
  AdminCertificateCandidateApi,
  AdminCertificateTemplateApi,
} from "@/types/adminCertificate";
import { sortByLatestDate } from "@/utils/sortData";
import type {
  AdminCertificateStatus,
  AdminCertificateTemplate,
  AdminCertificateTemplateBackgroundType,
  AdminCertificateTemplateStatus,
  AdminCertificateVerificationStatus,
  AdminDigitalCertificate,
} from "@/features/admin/constants/certificates";
import { adminCertificateDefaultTemplate } from "@/features/admin/constants/certificates";

function fallback(value: unknown, fallbackValue = "-"): string {
  if (value === undefined || value === null || value === "") {
    return fallbackValue;
  }

  return String(value);
}

function normalizeCertificateStatus(status?: string | null): AdminCertificateStatus {
  if (status === "Draft" || status === "Terbit" || status === "Dicabut") {
    return status;
  }

  return "Menunggu Penerbitan";
}

function normalizeVerificationStatus(status: AdminCertificateStatus): AdminCertificateVerificationStatus {
  if (status === "Terbit") {
    return "Terverifikasi";
  }

  if (status === "Dicabut") {
    return "Dicabut";
  }

  return "Belum";
}

function normalizeTemplateStatus(status?: string | null): AdminCertificateTemplateStatus {
  return status === "Nonaktif" ? "Nonaktif" : "Aktif";
}

function normalizeBackgroundType(type?: string | null): AdminCertificateTemplateBackgroundType {
  return type === "Gambar" ? "Gambar" : "Warna";
}

export function mapApiTemplateToAdminCertificateTemplate(
  template?: AdminCertificateTemplateApi | null,
): AdminCertificateTemplate {
  if (!template) {
    return adminCertificateDefaultTemplate;
  }

  return {
    id: String(template.id),
    numericId: template.id,
    templateName: fallback(template.nama_template, adminCertificateDefaultTemplate.templateName),
    accreditationText: fallback(template.subjudul, adminCertificateDefaultTemplate.accreditationText),
    title: fallback(template.judul_sertifikat, adminCertificateDefaultTemplate.title),
    recipientLabel: fallback(template.recipient_label, adminCertificateDefaultTemplate.recipientLabel),
    programPrefix: fallback(template.program_prefix, adminCertificateDefaultTemplate.programPrefix),
    openingText: fallback(template.kalimat_pembuka, adminCertificateDefaultTemplate.openingText),
    closingText: fallback(template.kalimat_penutup, adminCertificateDefaultTemplate.closingText),
    institutionName: fallback(template.nama_penyelenggara, adminCertificateDefaultTemplate.institutionName),
    institutionAddress: fallback(template.institution_address, adminCertificateDefaultTemplate.institutionAddress),
    signerName: fallback(template.nama_penandatangan, adminCertificateDefaultTemplate.signerName),
    signerTitle: fallback(template.jabatan_penandatangan, adminCertificateDefaultTemplate.signerTitle),
    backgroundType: normalizeBackgroundType(template.background_type),
    backgroundColor: fallback(template.background_color, adminCertificateDefaultTemplate.backgroundColor),
    borderColor: fallback(template.border_color, adminCertificateDefaultTemplate.borderColor),
    accentColor: fallback(template.accent_color, adminCertificateDefaultTemplate.accentColor),
    backgroundImage: template.background_image_url || template.background_image || "",
    signatureImage: template.ttd_digital_url || template.ttd_digital || "",
    backgroundImageFileName: template.background_image_original_name ?? null,
    signatureImageFileName: template.ttd_digital_original_name ?? null,
    status: normalizeTemplateStatus(template.status),
    isDefault: Boolean(template.is_default),
    certificatesCount: template.certificates_count ?? 0,
  };
}

export function mapTemplateToPayload(
  template: AdminCertificateTemplate,
  files: {
    backgroundImageFile?: File | null;
    signatureImageFile?: File | null;
    removeBackgroundImage?: boolean;
    removeSignatureImage?: boolean;
  } = {},
) {
  return {
    nama_template: template.templateName.trim(),
    judul_sertifikat: template.title.trim(),
    subjudul: template.accreditationText.trim(),
    recipient_label: template.recipientLabel.trim(),
    program_prefix: template.programPrefix.trim(),
    kalimat_pembuka: template.openingText.trim(),
    kalimat_penutup: template.closingText.trim(),
    nama_penyelenggara: template.institutionName.trim(),
    institution_address: template.institutionAddress.trim(),
    nama_penandatangan: template.signerName.trim(),
    jabatan_penandatangan: template.signerTitle.trim(),
    background_type: template.backgroundType,
    background_color: template.backgroundColor,
    border_color: template.borderColor,
    accent_color: template.accentColor,
    status: template.status,
    is_default: template.isDefault,
    background_image_file: files.backgroundImageFile ?? null,
    ttd_digital_file: files.signatureImageFile ?? null,
    remove_background_image: files.removeBackgroundImage ?? false,
    remove_ttd_digital: files.removeSignatureImage ?? false,
  };
}

export function mapCandidateToAdminCertificate(
  candidate: AdminCertificateCandidateApi,
): AdminDigitalCertificate {
  const resultId = candidate.hasil_latihan_id ?? candidate.id;
  const packageName = candidate.booking?.course_package?.nama_paket
    ?? candidate.training_schedule?.kode_jadwal
    ?? "Paket belum tersedia";
  const participantName = candidate.peserta?.nama_peserta ?? "Peserta tanpa nama";

  return {
    id: `candidate-${resultId}`,
    numericId: null,
    sourceType: "candidate",
    sourceResultId: String(resultId),
    sourceResultNumericId: resultId,
    participantId: fallback(candidate.peserta?.kode_peserta, `PST-${candidate.peserta?.id ?? resultId}`),
    participantName,
    participantEmail: candidate.peserta?.email ?? undefined,
    packageName,
    graduationDate: fallback(candidate.tanggal_latihan),
    issuedAt: "",
    certificateNumber: "",
    status: "Menunggu Penerbitan",
    verificationStatus: "Belum",
    qrCodeValue: `SIKEMUDI-CANDIDATE-${resultId}`,
    templateId: "1",
    templateData: null,
    instructorName: candidate.instructor?.nama_instruktur ?? undefined,
    score: candidate.nilai_akhir ?? null,
    hasPdf: false,
    pdfDownloadUrl: null,
    pdfOriginalName: null,
    completedSessions: candidate.booking?.booking_group?.jumlah_sesi_selesai ?? candidate.peserta?.jumlah_sesi_selesai ?? null,
    totalSessions: candidate.total_sesi ?? candidate.booking?.booking_group?.total_sesi ?? candidate.peserta?.jumlah_sesi_total ?? null,
    progressComplete: Boolean(candidate.is_package_completed ?? candidate.peserta?.progress_selesai),
  };
}

export function mapCertificateToAdminCertificate(
  certificate: AdminCertificateApi,
): AdminDigitalCertificate {
  const status = normalizeCertificateStatus(certificate.status);
  const resultId = certificate.training_result?.id ?? certificate.id;
  const participantName = certificate.peserta?.nama_peserta ?? "Peserta tanpa nama";
  const verificationUrl = certificate.verification_url ?? certificate.qr_code ?? "";
  const templateData = certificate.template
    ? mapApiTemplateToAdminCertificateTemplate(certificate.template)
    : null;

  return {
    id: `certificate-${certificate.id}`,
    numericId: certificate.id,
    sourceType: "certificate",
    sourceResultId: String(resultId),
    sourceResultNumericId: resultId,
    participantId: fallback(certificate.peserta?.kode_peserta, `PST-${certificate.peserta?.id ?? certificate.id}`),
    participantName,
    participantEmail: certificate.peserta?.email ?? undefined,
    packageName: fallback(certificate.course_package?.nama_paket, "Paket belum tersedia"),
    graduationDate: fallback(certificate.training_result?.tanggal_latihan, certificate.tanggal_terbit ?? "-"),
    issuedAt: fallback(certificate.tanggal_terbit, ""),
    certificateNumber: fallback(certificate.nomor_sertifikat, ""),
    status,
    verificationStatus: normalizeVerificationStatus(status),
    verificationCode: certificate.kode_verifikasi ?? undefined,
    verificationUrl: verificationUrl || undefined,
    qrCodeValue: verificationUrl || certificate.kode_verifikasi || `SIKEMUDI-CERT-${certificate.id}`,
    templateId: certificate.template?.id ? String(certificate.template.id) : "1",
    templateData,
    instructorName: certificate.training_result?.instructor?.nama_instruktur ?? undefined,
    score: certificate.training_result?.nilai_akhir ?? null,
    hasPdf: Boolean(certificate.pdf_path || certificate.pdf_download_url),
    pdfDownloadUrl: certificate.pdf_download_url ?? null,
    pdfOriginalName: certificate.pdf_original_name ?? null,
    completedSessions: certificate.training_result?.booking_group?.jumlah_sesi_selesai ?? certificate.peserta?.jumlah_sesi_selesai ?? null,
    totalSessions: certificate.training_result?.total_sesi ?? certificate.training_result?.booking_group?.total_sesi ?? certificate.peserta?.jumlah_sesi_total ?? null,
    progressComplete: Boolean(
      certificate.training_result?.booking_group
        ? (certificate.training_result.booking_group.jumlah_sesi_selesai ?? 0) >= (certificate.training_result.booking_group.total_sesi ?? 1)
        : certificate.peserta?.progress_selesai,
    ),
  };
}

export function buildCertificateRows(
  candidates: AdminCertificateCandidateApi[],
  certificates: AdminCertificateApi[],
): AdminDigitalCertificate[] {
  const certificateRows = certificates.map(mapCertificateToAdminCertificate);
  const issuedResultIds = new Set(
    certificateRows.map((item) => String(item.sourceResultNumericId ?? item.sourceResultId)),
  );

  const candidateRows = candidates
    .filter((candidate) => {
      const resultId = candidate.hasil_latihan_id ?? candidate.id;
      return !issuedResultIds.has(String(resultId));
    })
    .map(mapCandidateToAdminCertificate);

  return sortByLatestDate([...candidateRows, ...certificateRows], [
    "issuedAt",
    "graduationDate",
  ], {
    direction: "desc",
    fallback: (item) => item.numericId ?? item.sourceResultNumericId ?? 0,
  });
}
