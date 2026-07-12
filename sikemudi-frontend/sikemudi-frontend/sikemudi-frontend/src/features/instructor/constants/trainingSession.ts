import type { LucideIcon } from "lucide-react";
import { CalendarClock, ClipboardList, Clock3, UserCheck } from "lucide-react";

export type TrainingSessionViewMode = "table" | "calendar";

export interface TrainingSessionIconMap {
  schedule: LucideIcon;
  assignment: LucideIcon;
}

export const trainingSessionHeader = {
  title: "Sesi Latihan",
  subtitle:
    "Lihat slot latihan yang ditugaskan admin untuk akun instruktur Anda.",
};

export const trainingSessionDayOptions = [
  { label: "Semua Hari", value: "all" },
  { label: "Senin", value: "Senin" },
  { label: "Selasa", value: "Selasa" },
  { label: "Rabu", value: "Rabu" },
  { label: "Kamis", value: "Kamis" },
  { label: "Jumat", value: "Jumat" },
  { label: "Sabtu", value: "Sabtu" },
  { label: "Minggu", value: "Minggu" },
];

export const trainingSessionEmptyMessage = {
  title: "Slot sesi belum ditemukan",
  description:
    "Belum ada slot aktif yang ditugaskan kepada akun instruktur ini, atau filter yang digunakan terlalu spesifik.",
};

export const trainingSessionPageInfo = {
  tableLabel: "Tabel menampilkan slot sesi khusus instruktur yang sedang login.",
  calendarLabel: "Kalender menampilkan slot sesi yang ditugaskan admin.",
};

export const trainingSessionIconMap: TrainingSessionIconMap = {
  schedule: CalendarClock,
  assignment: UserCheck,
};

export const trainingSessionViewModeOptions = [
  { label: "Tabel", value: "table", icon: ClipboardList },
  { label: "Kalender", value: "calendar", icon: Clock3 },
] as const;

// Tipe legacy dipertahankan agar komponen lama yang sudah tidak dipakai langsung
// tidak memutus typecheck saat patch kecil ini diterapkan.
export type TrainingSessionStatus =
  | "AKAN DATANG"
  | "BERLANGSUNG"
  | "MENUNGGU INPUT"
  | "SELESAI"
  | "DIBATALKAN";

export interface TrainingSessionItem {
  id: string;
  numericId?: number;
  sessionCode: string;
  date: string;
  rawDate?: string;
  day: string;
  time: string;
  duration: string;
  vehicleName: string;
  vehiclePlate: string;
  transmission: string;
  location: string;
  participantCount: number;
  participantNames: string[];
  packageName: string;
  status: TrainingSessionStatus;
  lastUpdated: string;
}
