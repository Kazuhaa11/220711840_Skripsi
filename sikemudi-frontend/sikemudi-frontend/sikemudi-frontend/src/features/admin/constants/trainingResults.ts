import type { LucideIcon } from "lucide-react";
import {
  Award,
  CalendarCheck,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

export type AdminTrainingAttendance =
  | "Hadir"
  | "Tidak Hadir"
  | "Izin"
  | "Belum Diisi";

export type AdminTrainingGraduationStatus =
  | "Menunggu"
  | "Lulus"
  | "Tidak Lulus"
  | "N/A";

export type AdminTrainingResultWorkflowStatus =
  | "Dalam Proses"
  | "Siap Validasi Sertifikat"
  | "Siap Sertifikat"
  | "Sertifikat Terbit"
  | "Tidak Lulus"
  | "Tidak Hadir"
  | "Belum Dinilai";

export interface AdminTrainingResult {
  id: string;
  numericId: number;
  scheduleId: string;
  scheduleNumericId: number | null;
  bookingId: number | null;
  bookingCode: string;
  participantId: string;
  participantNumericId: number | null;
  participantName: string;
  participantType: string;
  participantEmail: string;
  participantPhone: string;
  packageName: string;
  sessionDate: string;
  sessionDateRaw: string;
  sessionTime: string;
  instructorId: string;
  instructorNumericId: number | null;
  instructorName: string;
  vehicleName: string;
  vehiclePlate: string;
  attendance: AdminTrainingAttendance;
  evaluation: string;
  instructorNote: string;
  adminNote: string;
  graduationStatus: AdminTrainingGraduationStatus;
  workflowStatus: AdminTrainingResultWorkflowStatus;
  masteryPercent: number;
  certificateIssued: boolean;
  certificateStatus: string;
  certificateNumber?: string;
  certificateIssuedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  verifiedAt?: string;
  bookingGroupId: number | null;
  sessionNumber: number;
  totalSessions: number;
  sessionLabel: string;
  progressLabel: string;
  isFinalSession: boolean;
  isPackageCompleted: boolean;
  canValidateCertificate: boolean;
  canIssueCertificate: boolean;
  validationStatus: string;
  validatedByName?: string;
  packageNumericId?: number | null;
  packageCode?: string;
  groupStatus?: string;
  paymentStatus?: string;
  sessions?: AdminTrainingResult[];
  nilaiPraktik: number | null;
  nilaiSikap: number | null;
  nilaiPemahaman: number | null;
  nilaiAkhir: number | null;
}


export interface AdminTrainingResultFormValues {
  participantId: string;
  attendance: AdminTrainingAttendance;
  evaluation: string;
  instructorNote: string;
  graduationStatus: AdminTrainingGraduationStatus;
}

export interface AdminTrainingVerificationFormValues {
  graduationStatus: AdminTrainingGraduationStatus;
  adminNote: string;
}

export interface AdminTrainingResultStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "amber" | "emerald";
}

export const adminTrainingResultHeader = {
  title: "Hasil Latihan",
  description:
    "Pantau hasil latihan yang diinput instruktur dan validasi kelulusan final peserta sebelum masuk proses penerbitan sertifikat.",
};

export const adminTrainingResultInitialData: AdminTrainingResult[] = [];

export const trainingResultAttendanceOptions = [
  { label: "Semua Kehadiran", value: "all" },
  { label: "Hadir", value: "Hadir" },
  { label: "Tidak Hadir", value: "Tidak Hadir" },
  { label: "Izin", value: "Izin" },
  { label: "Belum Diisi", value: "Belum Diisi" },
];

export const trainingResultInstructorOptions = [
  { label: "Semua Instruktur", value: "all" },
];

export const trainingResultWorkflowOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Dalam Proses", value: "Dalam Proses" },
  { label: "Siap Validasi Sertifikat", value: "Siap Validasi Sertifikat" },
  { label: "Siap Sertifikat", value: "Siap Sertifikat" },
  { label: "Sertifikat Terbit", value: "Sertifikat Terbit" },
  { label: "Tidak Lulus", value: "Tidak Lulus" },
  { label: "Tidak Hadir", value: "Tidak Hadir" },
  { label: "Belum Dinilai", value: "Belum Dinilai" },
];

export const trainingResultGraduationOptions = [
  { label: "Menunggu", value: "Menunggu" },
  { label: "Lulus", value: "Lulus" },
  { label: "Tidak Lulus", value: "Tidak Lulus" },
];


export const emptyTrainingResultFormValues: AdminTrainingResultFormValues = {
  participantId: "",
  attendance: "Hadir",
  evaluation: "",
  instructorNote: "",
  graduationStatus: "Menunggu",
};

export const emptyTrainingVerificationFormValues: AdminTrainingVerificationFormValues =
  {
    graduationStatus: "Menunggu",
    adminNote: "",
  };

export const adminTrainingResultMessages = {
  inputSuccess: "Input hasil latihan hanya dilakukan oleh instruktur.",
  verifySuccess: "Kelulusan peserta berhasil divalidasi. Jika lulus, peserta masuk kandidat penerbitan sertifikat.",
  certificateSuccess: "Validasi kelulusan berhasil disimpan.",
  emptyTitle: "Data hasil latihan tidak ditemukan",
  emptyDescription:
    "Coba ubah kata kunci pencarian, tanggal, instruktur, atau status kehadiran.",
};

export const adminTrainingResultProgressStages = [
  {
    id: "stage-1",
    label: "Input Instruktur",
    icon: ClipboardCheck,
  },
  {
    id: "stage-2",
    label: "Verifikasi Admin",
    icon: ShieldCheck,
  },
  {
    id: "stage-3",
    label: "Kandidat Sertifikat",
    icon: Award,
  },
  {
    id: "stage-4",
    label: "Sertifikat",
    icon: GraduationCap,
  },
];

export function buildAdminTrainingResultStats(
  results: AdminTrainingResult[],
): AdminTrainingResultStat[] {
  const total = results.length;
  const present = results.filter((item) => item.attendance === "Hadir").length;
  const pendingVerification = results.filter(
    (item) => item.workflowStatus === "Siap Validasi Sertifikat",
  ).length;
  const readyCertificate = results.filter(
    (item) => item.workflowStatus === "Siap Sertifikat" || item.workflowStatus === "Sertifikat Terbit",
  ).length;

  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  return [
    {
      id: "total",
      label: "Total Hasil Latihan",
      value: String(total).padStart(2, "0"),
      description: "Dari backend",
      icon: ClipboardCheck,
      tone: "blue",
    },
    {
      id: "present",
      label: "Peserta Hadir",
      value: String(present).padStart(2, "0"),
      description: `${attendanceRate}% tingkat kehadiran`,
      icon: UserCheck,
      tone: "green",
    },
    {
      id: "pending",
      label: "Siap Validasi",
      value: String(pendingVerification).padStart(2, "0"),
      description: "Paket selesai & lulus",
      icon: CalendarCheck,
      tone: "amber",
    },
    {
      id: "passed",
      label: "Siap Sertifikat",
      value: String(readyCertificate).padStart(2, "0"),
      description: "Lulus / terbit",
      icon: GraduationCap,
      tone: "emerald",
    },
  ];
}

export function canVerifyAdminTrainingResult(result: AdminTrainingResult): boolean {
  return Boolean(result.canValidateCertificate);
}
