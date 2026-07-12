import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  CircleAlert,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

export type AdminParticipantStatus = "Aktif" | "Verifikasi" | "Nonaktif";
export type AdminParticipantCertificateStatus =
  | "Terbit"
  | "Dalam Proses"
  | "Belum Ada";

export interface AdminParticipant {
  id: string;
  apiId?: number;
  fullName: string;
  email: string;
  phone: string;
  address?: string | null;
  birthDate?: string | null;
  gender?: "Laki-laki" | "Perempuan" | "" | null;
  activePackage: string;
  activePackageId?: number | null;
  packageCode: string;
  accountStatus: AdminParticipantStatus;
  certificateStatus: AdminParticipantCertificateStatus;
  joinedAt: string;
  initials: string;
  avatarTone: "blue" | "purple" | "green" | "slate";
  completedSessions: number;
  totalSessions: number;
  rating: number;
  absenceCount: number;
  remainingSessions: number;
  lastSessionTitle: string;
  lastSessionDate: string;
  lastInstructor: string;
}

export interface AdminParticipantFormValues {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  gender: "Laki-laki" | "Perempuan" | "";
  password: string;
  passwordConfirmation: string;
  activePackage: string;
  accountStatus: AdminParticipantStatus;
  certificateStatus: AdminParticipantCertificateStatus;
}

export interface AdminParticipantStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "navy" | "blue" | "green" | "amber";
}

export const adminParticipantHeader = {
  eyebrow: "Operasional & Database",
  title: "Manajemen Peserta",
  description:
    "Kelola data seluruh peserta kursus mengemudi, pantau status sertifikasi, dan atur paket aktif dalam satu dasbor terpadu.",
};

export const adminParticipantsInitialData: AdminParticipant[] = [
  {
    id: "ID-202309001",
    fullName: "Aditya Maulana",
    email: "aditya.m@gmail.com",
    phone: "+62 812-3456-7890",
    activePackage: "Paket Mahir",
    packageCode: "B",
    accountStatus: "Aktif",
    certificateStatus: "Terbit",
    joinedAt: "12 Sep 2023",
    initials: "AM",
    avatarTone: "blue",
    completedSessions: 14,
    totalSessions: 20,
    rating: 4.8,
    absenceCount: 0,
    remainingSessions: 6,
    lastSessionTitle: "Praktik Jalan Raya",
    lastSessionDate: "Kamis, 12 Sep 2024 • 14:00 - 16:00",
    lastInstructor: "Bambang Hermawan",
  },
  {
    id: "ID-202309042",
    fullName: "Siti Rahmawati",
    email: "rahmawati.s@outlook.com",
    phone: "+62 856-9988-7711",
    activePackage: "Paket Pemula",
    packageCode: "A",
    accountStatus: "Verifikasi",
    certificateStatus: "Belum Ada",
    joinedAt: "14 Sep 2023",
    initials: "SR",
    avatarTone: "purple",
    completedSessions: 2,
    totalSessions: 10,
    rating: 4.5,
    absenceCount: 1,
    remainingSessions: 8,
    lastSessionTitle: "Pengenalan Kendaraan",
    lastSessionDate: "Rabu, 11 Sep 2024 • 08:00 - 10:00",
    lastInstructor: "Budi Santoso",
  },
  {
    id: "ID-202309105",
    fullName: "Budi Pratama",
    email: "budi.pratama@gmail.com",
    phone: "+62 821-1234-5678",
    activePackage: "Paket Intensif",
    packageCode: "C",
    accountStatus: "Aktif",
    certificateStatus: "Terbit",
    joinedAt: "15 Sep 2023",
    initials: "BP",
    avatarTone: "green",
    completedSessions: 10,
    totalSessions: 12,
    rating: 4.9,
    absenceCount: 0,
    remainingSessions: 2,
    lastSessionTitle: "Simulasi Ujian Praktik",
    lastSessionDate: "Jumat, 13 Sep 2024 • 10:00 - 12:00",
    lastInstructor: "Siti Aminah",
  },
];

export const adminParticipantStats: AdminParticipantStat[] = [
  {
    id: "total",
    label: "Total Peserta",
    value: "1.240",
    description: "+12% bulan ini",
    icon: Users,
    tone: "navy",
  },
  {
    id: "active",
    label: "Akun Aktif",
    value: "1.182",
    description: "95.3% dari total database",
    icon: UserCheck,
    tone: "blue",
  },
  {
    id: "certificate",
    label: "Sertifikat Terbit",
    value: "856",
    description: "Peserta lulus uji kompetensi",
    icon: BadgeCheck,
    tone: "green",
  },
  {
    id: "verification",
    label: "Menunggu Verifikasi",
    value: "58",
    description: "Perlu tindakan segera",
    icon: CircleAlert,
    tone: "amber",
  },
];

export const participantStatusOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Aktif", value: "Aktif" },
  { label: "Verifikasi", value: "Verifikasi" },
  { label: "Nonaktif", value: "Nonaktif" },
];

export const participantPackageOptions = [
  { label: "Semua Paket", value: "all" },
  { label: "Paket Pemula", value: "Paket Pemula" },
  { label: "Paket Mahir", value: "Paket Mahir" },
  { label: "Paket Intensif", value: "Paket Intensif" },
];

export const participantFormPackageOptions = [
  { label: "Tanpa Paket Aktif", value: "" },
  { label: "Paket Pemula", value: "Paket Pemula" },
  { label: "Paket Mahir", value: "Paket Mahir" },
  { label: "Paket Intensif", value: "Paket Intensif" },
];

export const participantGenderOptions = [
  { label: "Pilih Gender", value: "" },
  { label: "Laki-laki", value: "Laki-laki" },
  { label: "Perempuan", value: "Perempuan" },
];

export const participantFormStatusOptions = [
  { label: "Aktif", value: "Aktif" },
  { label: "Verifikasi", value: "Verifikasi" },
  { label: "Nonaktif", value: "Nonaktif" },
];

export const participantCertificateStatusOptions = [
  { label: "Terbit", value: "Terbit" },
  { label: "Dalam Proses", value: "Dalam Proses" },
  { label: "Belum Ada", value: "Belum Ada" },
];

export const emptyParticipantFormValues: AdminParticipantFormValues = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  birthDate: "",
  gender: "",
  password: "",
  passwordConfirmation: "",
  activePackage: "",
  accountStatus: "Aktif",
  certificateStatus: "Belum Ada",
};

export const adminParticipantMessages = {
  addSuccess: "Data peserta berhasil ditambahkan.",
  editSuccess: "Data peserta berhasil diperbarui.",
  deleteSuccess: "Peserta berhasil dinonaktifkan.",
  emptyTitle: "Data peserta tidak ditemukan",
  emptyDescription:
    "Coba ubah kata kunci pencarian, status akun, atau filter paket aktif.",
};

export const adminParticipantIcons = {
  detail: ShieldCheck,
  package: GraduationCap,
};
