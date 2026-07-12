import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardEdit,
  Clock3,
  FileCheck2,
  Users,
} from "lucide-react";

export type TrainingResultStatus =
  | "BERLANGSUNG"
  | "MENUNGGU EVALUASI"
  | "DRAFT"
  | "SELESAI"
  | "BELUM DINILAI"
  | "BELUM SAATNYA"
  | "MELEWATI BATAS"
  | "LULUS"
  | "TIDAK LULUS";

export interface TrainingResultStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "red" | "amber" | "green";
}

export interface TrainingResultParticipant {
  id: string;
  bookingId?: number;
  resultId?: number;
  participantCode: string;
  name: string;
  initials: string;
  packageName: string;
  sessionLabel: string;
  attendance: "HADIR" | "TIDAK HADIR" | "BELUM DITANDAI";
  resultStatus: "MENUNGGU EVALUASI" | "DRAFT" | "SUDAH DINILAI";
}

export interface TrainingResultItem {
  id: string;
  numericId?: number;
  source?: "candidate" | "result" | "group";
  bookingGroupId?: number | null;
  groupCode?: string | null;
  totalSesi?: number | null;
  completedSessions?: number | null;
  sessions?: TrainingResultItem[];
  bookingId?: number;
  resultId?: number;
  sessionCode: string;
  sessionLabel?: string;
  isFinalSession?: boolean;
  canInputResult?: boolean;
  inputUnavailableReason?: string | null;
  date: string;
  rawDate?: string;
  day: string;
  time: string;
  vehicleName: string;
  vehiclePlate: string;
  location: string;
  focus: string;
  status: TrainingResultStatus;
  participantCount: number;
  evaluatedCount: number;
  participants: TrainingResultParticipant[];
  lastUpdated: string;
  score?: number | null;
  graduationStatus?: string | null;
}

export const trainingResultHeader = {
  title: "Hasil Latihan",
  subtitle:
    "Kelola evaluasi sesi latihan peserta yang sudah berlangsung atau membutuhkan penilaian.",
};

export const trainingResultStats: TrainingResultStat[] = [
  {
    id: "waiting",
    label: "Menunggu Evaluasi",
    value: "3",
    description: "Sesi perlu dinilai",
    icon: ClipboardEdit,
    tone: "red",
  },
  {
    id: "active",
    label: "Sesi Berlangsung",
    value: "1",
    description: "Bisa ditindaklanjuti",
    icon: Clock3,
    tone: "blue",
  },
  {
    id: "draft",
    label: "Draft Hasil",
    value: "2",
    description: "Belum disimpan final",
    icon: AlertTriangle,
    tone: "amber",
  },
  {
    id: "completed",
    label: "Selesai",
    value: "8",
    description: "Hasil sudah tersimpan",
    icon: CheckCircle2,
    tone: "green",
  },
];

export const trainingResultStatusOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Bisa Diinput", value: "MENUNGGU EVALUASI" },
  { label: "Belum Saatnya", value: "BELUM SAATNYA" },
  { label: "Melewati Batas", value: "MELEWATI BATAS" },
  { label: "Sudah Disimpan", value: "SELESAI" },
  { label: "Lulus", value: "LULUS" },
  { label: "Tidak Lulus", value: "TIDAK LULUS" },
];

export const trainingResultItems: TrainingResultItem[] = [
  {
    id: "sk-2024-001",
    sessionCode: "SK-2024-001",
    date: "24 Mei 2024",
    day: "Senin",
    time: "08:00 - 10:00",
    vehicleName: "Toyota Avanza",
    vehiclePlate: "B 1234 SIK",
    location: "Pool Sudirman Hub",
    focus:
      "Latihan dasar pengereman, pengenalan instrumen dashboard, dan kontrol kendaraan.",
    status: "MENUNGGU EVALUASI",
    participantCount: 4,
    evaluatedCount: 0,
    lastUpdated: "Sesi selesai 20 menit lalu",
    participants: [
      {
        id: "p-001",
        participantCode: "#SK-2024001",
        name: "Budi Pratama",
        initials: "BP",
        packageName: "Paket 10 Jam",
        sessionLabel: "Sesi ke-3",
        attendance: "HADIR",
        resultStatus: "MENUNGGU EVALUASI",
      },
      {
        id: "p-002",
        participantCode: "#SK-2024002",
        name: "Siti Aminah",
        initials: "SA",
        packageName: "Paket 20 Jam",
        sessionLabel: "Sesi ke-1",
        attendance: "HADIR",
        resultStatus: "MENUNGGU EVALUASI",
      },
    ],
  },
  {
    id: "sk-2024-002",
    sessionCode: "SK-2024-002",
    date: "24 Mei 2024",
    day: "Senin",
    time: "10:30 - 12:30",
    vehicleName: "Honda Brio",
    vehiclePlate: "B 5678 SIK",
    location: "Pool Seturan Hub",
    focus:
      "Latihan menjaga jarak aman, penggunaan spion, dan perpindahan jalur.",
    status: "BERLANGSUNG",
    participantCount: 3,
    evaluatedCount: 0,
    lastUpdated: "Sedang berlangsung",
    participants: [
      {
        id: "p-003",
        participantCode: "#SK-2024003",
        name: "Dewi Lestari",
        initials: "DL",
        packageName: "Paket 10 Jam",
        sessionLabel: "Sesi ke-5",
        attendance: "BELUM DITANDAI",
        resultStatus: "MENUNGGU EVALUASI",
      },
    ],
  },
  {
    id: "sk-2024-003",
    sessionCode: "SK-2024-003",
    date: "23 Mei 2024",
    day: "Minggu",
    time: "13:00 - 15:00",
    vehicleName: "Toyota Avanza",
    vehiclePlate: "B 1234 SIK",
    location: "Pool Sudirman Hub",
    focus:
      "Evaluasi akhir penguasaan kopling, parkir paralel, dan rute jalan raya.",
    status: "DRAFT",
    participantCount: 2,
    evaluatedCount: 1,
    lastUpdated: "Draft disimpan kemarin",
    participants: [
      {
        id: "p-004",
        participantCode: "#SK-2024004",
        name: "Rahmat Mahendra",
        initials: "RM",
        packageName: "Paket 10 Jam",
        sessionLabel: "Sesi ke-12",
        attendance: "HADIR",
        resultStatus: "DRAFT",
      },
    ],
  },
  {
    id: "sk-2024-004",
    sessionCode: "SK-2024-004",
    date: "22 Mei 2024",
    day: "Sabtu",
    time: "08:00 - 10:00",
    vehicleName: "Honda Brio",
    vehiclePlate: "B 5678 SIK",
    location: "Pool Seturan Hub",
    focus:
      "Latihan kontrol kecepatan, etika berkendara, dan simulasi kemacetan.",
    status: "SELESAI",
    participantCount: 3,
    evaluatedCount: 3,
    lastUpdated: "Hasil sudah disimpan",
    participants: [
      {
        id: "p-005",
        participantCode: "#SK-2024005",
        name: "Siti Pertiwi",
        initials: "SP",
        packageName: "Paket 20 Jam",
        sessionLabel: "Sesi ke-8",
        attendance: "HADIR",
        resultStatus: "SUDAH DINILAI",
      },
    ],
  },
];

export const trainingResultEmptyMessage = {
  title: "Data hasil latihan tidak ditemukan",
  description:
    "Tidak ada sesi yang sesuai dengan pencarian atau filter yang dipilih.",
};

export const trainingResultNotFoundMessage = {
  title: "Data sesi tidak ditemukan",
  description:
    "Sesi latihan yang akan dinilai tidak tersedia atau sudah dihapus dari sistem.",
};

export const trainingResultIndicators = [
  "Penguasaan Dasar",
  "Kendali Kendaraan",
  "Kedisiplinan",
  "Kepercayaan Diri",
];

export const trainingResultStatusAfterSubmitOptions = [
  { label: "Sesi Selesai", value: "Sesi Selesai" },
  { label: "Perlu Latihan Tambahan", value: "Perlu Latihan Tambahan" },
  { label: "Siap Ujian Praktik", value: "Siap Ujian Praktik" },
];

export const trainingResultSuccessMessage =
  "Hasil latihan berhasil disimpan. Data evaluasi peserta sudah diperbarui.";

export const trainingResultSubmitErrorMessage =
  "Gagal menyimpan hasil latihan. Pastikan kehadiran, indikator, dan catatan evaluasi sudah diisi.";

export const trainingResultIcons = {
  empty: FileCheck2,
  participants: Users,
};
