import type { LucideIcon } from "lucide-react";
import {
  Award,
  BadgeCheck,
  FileCheck2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

export type AdminCertificateStatus = "Menunggu Penerbitan" | "Draft" | "Terbit" | "Dicabut";

export type AdminCertificateVerificationStatus = "Belum" | "Terverifikasi" | "Dicabut";

export type AdminCertificateSourceType = "candidate" | "certificate";

export type AdminCertificateTemplateStatus = "Aktif" | "Nonaktif";
export type AdminCertificateTemplateBackgroundType = "Warna" | "Gambar";

export interface AdminCertificateTemplate {
  id: string;
  numericId?: number | null;
  templateName: string;
  accreditationText: string;
  title: string;
  recipientLabel: string;
  programPrefix: string;
  openingText: string;
  closingText: string;
  institutionName: string;
  institutionAddress: string;
  signerName: string;
  signerTitle: string;
  backgroundType: AdminCertificateTemplateBackgroundType;
  backgroundColor: string;
  borderColor: string;
  accentColor: string;
  backgroundImage: string;
  signatureImage: string;
  backgroundImageFileName?: string | null;
  signatureImageFileName?: string | null;
  status: AdminCertificateTemplateStatus;
  isDefault: boolean;
  certificatesCount?: number;
}

export interface AdminDigitalCertificate {
  id: string;
  numericId?: number | null;
  sourceType: AdminCertificateSourceType;
  sourceResultId: string;
  sourceResultNumericId?: number | null;
  participantId: string;
  participantName: string;
  participantEmail?: string;
  packageName: string;
  graduationDate: string;
  issuedAt: string;
  certificateNumber: string;
  status: AdminCertificateStatus;
  verificationStatus: AdminCertificateVerificationStatus;
  verificationCode?: string;
  verificationUrl?: string;
  qrCodeValue: string;
  templateId: string;
  templateData?: AdminCertificateTemplate | null;
  instructorName?: string;
  score?: number | null;
  hasPdf?: boolean;
  pdfDownloadUrl?: string | null;
  pdfOriginalName?: string | null;
  completedSessions?: number | null;
  totalSessions?: number | null;
  progressComplete?: boolean;
}

export interface AdminCertificateIssueFormValues {
  sourceResultId: string;
  templateId: string;
  certificateNumber: string;
  issuedAt: string;
  status: "Draft" | "Terbit";
}

export interface AdminCertificateStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "emerald" | "red" | "slate";
}

export const adminCertificateHeader = {
  title: "Manajemen Sertifikat Digital",
  description:
    "Kelola penerbitan, verifikasi, dan template sertifikat digital peserta yang telah dinyatakan lulus.",
};

export const adminCertificateDefaultTemplate: AdminCertificateTemplate = {
  id: "1",
  numericId: 1,
  templateName: "Template Utama SIKEMUDI",
  accreditationText: "Diberikan sebagai bukti penyelesaian pelatihan mengemudi",
  title: "SERTIFIKAT KURSUS MENGEMUDI",
  recipientLabel: "Diberikan kepada",
  programPrefix: "Atas kelulusannya dalam program",
  openingText:
    "Dengan ini menyatakan bahwa peserta berikut telah menyelesaikan program kursus mengemudi dan dinyatakan lulus berdasarkan hasil pelatihan.",
  closingText:
    "Sertifikat ini diterbitkan sebagai dokumen pendukung internal lembaga kursus mengemudi.",
  institutionName: "LKP Yuzza Kutai Barat",
  institutionAddress: "Kutai Barat, Kalimantan Timur",
  signerName: "Pimpinan LKP Yuzza",
  signerTitle: "Pimpinan Lembaga",
  backgroundType: "Warna",
  backgroundColor: "#ffffff",
  borderColor: "#1e3a8a",
  accentColor: "#2563eb",
  backgroundImage: "",
  signatureImage: "",
  backgroundImageFileName: null,
  signatureImageFileName: null,
  status: "Aktif",
  isDefault: true,
  certificatesCount: 0,
};

export const adminCertificateInitialData: AdminDigitalCertificate[] = [];

export const certificateStatusOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Menunggu Penerbitan", value: "Menunggu Penerbitan" },
  { label: "Draft", value: "Draft" },
  { label: "Terbit", value: "Terbit" },
  { label: "Dicabut", value: "Dicabut" },
];

export const certificateIssueStatusOptions = [
  { label: "Terbit", value: "Terbit" },
];

export const emptyCertificateIssueFormValues: AdminCertificateIssueFormValues = {
  sourceResultId: "",
  templateId: "1",
  certificateNumber: "",
  issuedAt: "",
  status: "Terbit",
};

export const adminCertificateMessages = {
  issueSuccess: "Sertifikat digital berhasil diterbitkan.",
  draftSuccess: "Draft sertifikat digital berhasil disimpan.",
  pdfSuccess: "PDF sertifikat berhasil dibuat dan siap diunduh.",
  templateSuccess: "Template sertifikat berhasil disimpan.",
  templateDefaultSuccess: "Template default berhasil diperbarui.",
  templateDeleteSuccess: "Template sertifikat berhasil dihapus atau dinonaktifkan.",
  revokeSuccess: "Sertifikat digital berhasil dicabut.",
  emptyTitle: "Tidak ada peserta lulus yang tersedia",
  emptyDescription:
    "Sertifikat digital hanya dapat diterbitkan untuk peserta yang sudah lulus, seluruh sesi paketnya sudah selesai, dan belum memiliki sertifikat.",
};

export const adminCertificateStatIcons = {
  issued: FileCheck2,
  pending: Award,
  verified: ShieldCheck,
  review: TriangleAlert,
  template: BadgeCheck,
};
