import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  CircleAlert,
  Timer,
  Users,
} from "lucide-react";

export type AdminTimeSlotStatus = "Aktif" | "Nonaktif";

export interface AdminTimeSlot {
  id: string;
  name: string;
  subtitle: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: AdminTimeSlotStatus;
  usedCount: number;
  relatedInstructors: number;
  weeklyTrainingCount: number;
  occupancyRate: number;
  activeDays: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTimeSlotFormValues {
  name: string;
  subtitle: string;
  startTime: string;
  endTime: string;
  status: AdminTimeSlotStatus;
  activeDays: string;
  note: string;
}

export interface AdminTimeSlotStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "slate" | "red";
}

export const adminTimeSlotHeader = {
  title: "Manajemen Slot Waktu",
  breadcrumb: "Slot Waktu",
};

export const adminTimeSlotInitialData: AdminTimeSlot[] = [
  {
    id: "SLT-001",
    name: "Sesi Pagi I",
    subtitle: "Primetime Reguler",
    startTime: "08:00",
    endTime: "10:00",
    durationMinutes: 120,
    status: "Aktif",
    usedCount: 42,
    relatedInstructors: 12,
    weeklyTrainingCount: 45,
    occupancyRate: 92,
    activeDays: "Setiap Hari (Senin - Minggu)",
    note: "Slot ini digunakan secara intensif untuk Paket Pemula Manual dan Paket Lanjutan.",
    createdAt: "12 Jan 2024",
    updatedAt: "2 jam lalu",
  },
  {
    id: "SLT-002",
    name: "Sesi Pagi II",
    subtitle: "Reguler Siang",
    startTime: "10:30",
    endTime: "12:30",
    durationMinutes: 120,
    status: "Aktif",
    usedCount: 38,
    relatedInstructors: 10,
    weeklyTrainingCount: 39,
    occupancyRate: 86,
    activeDays: "Setiap Hari (Senin - Minggu)",
    note: "Slot reguler kedua untuk jadwal pagi menjelang siang. Cocok untuk peserta dengan jadwal fleksibel.",
    createdAt: "12 Jan 2024",
    updatedAt: "3 jam lalu",
  },
  {
    id: "SLT-003",
    name: "Sesi Sore I",
    subtitle: "Favorit Weekend",
    startTime: "13:30",
    endTime: "15:30",
    durationMinutes: 120,
    status: "Nonaktif",
    usedCount: 0,
    relatedInstructors: 4,
    weeklyTrainingCount: 0,
    occupancyRate: 0,
    activeDays: "Sabtu - Minggu",
    note: "Slot sedang dinonaktifkan sementara karena evaluasi kapasitas instruktur akhir pekan.",
    createdAt: "13 Jan 2024",
    updatedAt: "1 hari lalu",
  },
  {
    id: "SLT-004",
    name: "Sesi Sore II",
    subtitle: "Sunset Session",
    startTime: "16:00",
    endTime: "18:00",
    durationMinutes: 120,
    status: "Aktif",
    usedCount: 29,
    relatedInstructors: 8,
    weeklyTrainingCount: 31,
    occupancyRate: 78,
    activeDays: "Setiap Hari (Senin - Minggu)",
    note: "Slot sore untuk peserta yang mengambil jadwal setelah jam kerja atau sekolah.",
    createdAt: "15 Jan 2024",
    updatedAt: "5 jam lalu",
  },
];

export const adminTimeSlotStats: AdminTimeSlotStat[] = [
  {
    id: "total",
    label: "Total Slot",
    value: "12",
    description: "+2 bulan ini",
    icon: Clock3,
    tone: "blue",
  },
  {
    id: "active",
    label: "Slot Aktif",
    value: "10",
    description: "83.3% rasio",
    icon: CheckCircle2,
    tone: "green",
  },
  {
    id: "usage",
    label: "Total Penggunaan",
    value: "156",
    description: "Jadwal minggu ini",
    icon: Users,
    tone: "slate",
  },
  {
    id: "inactive",
    label: "Nonaktif",
    value: "2",
    description: "Perlu review",
    icon: CircleAlert,
    tone: "red",
  },
];

export const timeSlotStatusOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Aktif", value: "Aktif" },
  { label: "Nonaktif", value: "Nonaktif" },
];

export const timeSlotFormStatusOptions = [
  { label: "Aktif", value: "Aktif" },
  { label: "Nonaktif", value: "Nonaktif" },
];

export const timeSlotEveryDayValue = "Setiap Hari (Senin - Minggu)";
export const timeSlotWeekdaysValue = "Senin - Jumat";
export const timeSlotWeekendValue = "Sabtu - Minggu";

const everyDayCsv = "Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu";
const legacyEveryDayCsv = "Senin, Selasa, Rabu, Kamis, Jumat, Sabtu";
const weekdaysCsv = "Senin, Selasa, Rabu, Kamis, Jumat";
const weekendCsv = "Sabtu, Minggu";

export const timeSlotActiveDayOptions = [
  {
    label: timeSlotEveryDayValue,
    value: timeSlotEveryDayValue,
  },
  { label: timeSlotWeekdaysValue, value: timeSlotWeekdaysValue },
  { label: timeSlotWeekendValue, value: timeSlotWeekendValue },
  { label: "Hari Tertentu", value: "Hari Tertentu" },
];

export function normalizeTimeSlotActiveDays(value?: string | null): string {
  const normalized = String(value ?? "").trim();
  const lowerValue = normalized.toLowerCase();

  if (!normalized) return timeSlotEveryDayValue;

  if (
    lowerValue === timeSlotEveryDayValue.toLowerCase() ||
    lowerValue === everyDayCsv.toLowerCase() ||
    lowerValue === legacyEveryDayCsv.toLowerCase() ||
    lowerValue.includes("senin - minggu") ||
    lowerValue.includes("setiap hari")
  ) {
    return timeSlotEveryDayValue;
  }

  if (
    lowerValue === timeSlotWeekdaysValue.toLowerCase() ||
    lowerValue === weekdaysCsv.toLowerCase()
  ) {
    return timeSlotWeekdaysValue;
  }

  if (
    lowerValue === timeSlotWeekendValue.toLowerCase() ||
    lowerValue === weekendCsv.toLowerCase()
  ) {
    return timeSlotWeekendValue;
  }

  return normalized;
}

export const emptyTimeSlotFormValues: AdminTimeSlotFormValues = {
  name: "",
  subtitle: "",
  startTime: "",
  endTime: "",
  status: "Aktif",
  activeDays: timeSlotEveryDayValue,
  note: "",
};

export const adminTimeSlotMessages = {
  addSuccess: "Slot waktu berhasil ditambahkan.",
  editSuccess: "Slot waktu berhasil diperbarui.",
  deactivateSuccess: "Slot waktu berhasil dinonaktifkan.",
  activateSuccess: "Slot waktu berhasil diaktifkan kembali.",
  emptyTitle: "Data slot waktu tidak ditemukan",
  emptyDescription:
    "Coba ubah kata kunci pencarian atau filter status slot waktu.",
};

export const adminTimeSlotDetailIcons = {
  time: Timer,
  calendar: CalendarCheck,
};
