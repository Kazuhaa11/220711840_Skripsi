import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LayoutGrid,
  TrendingUp,
} from "lucide-react";

export type AdminTrainingScheduleStatus =
  | "Tersedia"
  | "Penuh"
  | "Berlangsung"
  | "Selesai"
  | "Dibatalkan";

export interface AdminTrainingParticipant {
  id: string;
  name: string;
  packageName: string;
  attendanceStatus: "Hadir" | "Belum Hadir" | "Tidak Hadir";
}

export interface AdminTrainingSchedule {
  id: string;
  apiId?: number | string;
  code?: string | null;
  date: string;
  dayName: string;
  slotId: string;
  slotName: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  instructorId: string;
  instructorName: string;
  instructorRole: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  vehicleTransmission: string;
  coursePackageId: string;
  coursePackageName: string;
  quota: number;
  participantCount: number;
  remainingQuota: number;
  status: AdminTrainingScheduleStatus;
  location: string;
  note: string;
  participants: AdminTrainingParticipant[];
}

export interface AdminTrainingScheduleFormValues {
  date: string;
  slotId: string;
  instructorId: string;
  vehicleId: string;
  coursePackageId: string;
  quota: string;
  status: AdminTrainingScheduleStatus;
  location: string;
  note: string;
}

export interface AdminTrainingScheduleStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "red" | "slate";
}

export const adminTrainingScheduleHeader = {
  eyebrow: "Operasional & Logistik",
  title: "Manajemen Jadwal Latihan",
  description:
    "Kelola jadwal sesi latihan berdasarkan paket kursus, instruktur, kendaraan, dan slot waktu untuk optimisasi kapasitas kursus.",
};

export const adminTrainingScheduleInitialData: AdminTrainingSchedule[] = [];

export const adminTrainingScheduleStats: AdminTrainingScheduleStat[] = [
  {
    id: "total",
    label: "Total Jadwal",
    value: "0",
    description: "Sesi",
    icon: CalendarDays,
    tone: "blue",
  },
  {
    id: "available",
    label: "Tersedia",
    value: "0",
    description: "Sesi aktif",
    icon: Clock3,
    tone: "slate",
  },
  {
    id: "capacity",
    label: "Slot Terisi",
    value: "0%",
    description: "Kapasitas",
    icon: LayoutGrid,
    tone: "green",
  },
  {
    id: "attention",
    label: "Penuh/Batal",
    value: "0",
    description: "Perlu perhatian",
    icon: AlertTriangle,
    tone: "red",
  },
];

export const trainingScheduleStatusOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Tersedia", value: "Tersedia" },
  { label: "Penuh", value: "Penuh" },
  { label: "Berlangsung", value: "Berlangsung" },
  { label: "Selesai", value: "Selesai" },
  { label: "Dibatalkan", value: "Dibatalkan" },
];

export const trainingScheduleFormStatusOptions = [
  { label: "Tersedia", value: "Tersedia" },
  { label: "Penuh", value: "Penuh" },
  { label: "Berlangsung", value: "Berlangsung" },
  { label: "Selesai", value: "Selesai" },
  { label: "Dibatalkan", value: "Dibatalkan" },
];

export const emptyTrainingScheduleFormValues: AdminTrainingScheduleFormValues = {
  date: "",
  slotId: "",
  instructorId: "",
  vehicleId: "",
  coursePackageId: "",
  quota: "",
  status: "Tersedia",
  location: "Pool Pusat SIKEMUDI",
  note: "",
};

export const adminTrainingScheduleMessages = {
  addSuccess: "Jadwal latihan berhasil dibuat.",
  editSuccess: "Jadwal latihan berhasil diperbarui.",
  deleteSuccess: "Jadwal latihan berhasil dihapus.",
  emptyTitle: "Data jadwal latihan tidak ditemukan",
  emptyDescription:
    "Coba ubah kata kunci pencarian, tanggal, instruktur, paket kursus, atau status jadwal.",
};

export const adminTrainingScheduleInsight = {
  title: "Validasi Bentrok Jadwal Aktif",
  description:
    "Backend menolak jadwal jika instruktur atau kendaraan sudah dipakai pada tanggal dan slot waktu yang sama. Pastikan opsi instruktur, kendaraan, paket, dan slot waktu yang dipilih masih aktif.",
  icon: TrendingUp,
};

export const adminTrainingScheduleDownload = {
  title: "Data Real Backend",
  description:
    "Jadwal latihan pada halaman ini sudah tersambung ke API admin dan tidak lagi memakai dummy/local state.",
  icon: CheckCircle2,
};
