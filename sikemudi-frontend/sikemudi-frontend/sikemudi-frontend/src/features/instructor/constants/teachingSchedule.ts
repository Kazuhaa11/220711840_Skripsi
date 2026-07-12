import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardList,
} from "lucide-react";

export type TeachingScheduleStatus =
  | "BERLANGSUNG"
  | "AKAN DATANG"
  | "MENUNGGU INPUT"
  | "SELESAI";

export type TeachingScheduleAction =
  | "BUKA SESI"
  | "LIHAT DETAIL"
  | "INPUT HASIL";

export interface TeachingScheduleStat {
  id: string;
  label: string;
  value: string;
  suffix?: string;
  tone: "blue" | "navy" | "green" | "red";
}

export interface TeachingScheduleParticipant {
  id: string;
  bookingId?: number;
  bookingGroupId?: number | null;
  name: string;
  initials: string;
  packageName: string;
  sessionLabel: string;
  attendanceStatus: "BELUM ABSEN" | "HADIR";
  avatarTone: "blue" | "slate" | "green";
  email?: string;
  phone?: string;
  bookingCode?: string;
  paymentStatus?: string;
  statusBooking?: string | null;
  sesiKe?: number | null;
  totalSesi?: number | null;
}

export interface TeachingScheduleDetail {
  sessionCode: string;
  updatedAt: string;
  focus: string;
  participants: TeachingScheduleParticipant[];
}

export interface TeachingScheduleItem {
  id: string;
  numericId?: number;
  bookingGroupId?: number | null;
  groupCode?: string | null;
  date: string;
  rawDate?: string;
  day: string;
  time: string;
  duration?: string;
  vehicleName: string;
  vehiclePlate: string;
  transmission: string;
  participantName: string;
  participantInitial: string;
  participantSession: string;
  avatarTone: "blue" | "slate" | "green";
  status: TeachingScheduleStatus;
  action: TeachingScheduleAction;
  sessionCount?: number;
  completedSessions?: number;
  detail: TeachingScheduleDetail;
}

export interface UpcomingAgendaItem {
  id: string;
  label: string;
  participantName: string;
  time: string;
  duration: string;
  vehicle: string;
  participantInitials: string[];
  icon: LucideIcon;
  active?: boolean;
}

export const teachingScheduleHeader = {
  title: "Jadwal Mengajar",
  subtitle: "Lihat seluruh jadwal latihan yang menjadi tanggung jawab Anda.",
};

export const teachingScheduleStats: TeachingScheduleStat[] = [
  {
    id: "today",
    label: "Jadwal Hari Ini",
    value: "4",
    suffix: "Sesi",
    tone: "blue",
  },
  {
    id: "weekly",
    label: "Sesi Minggu Ini",
    value: "18",
    suffix: "Sesi",
    tone: "navy",
  },
  {
    id: "active",
    label: "Sesi Berlangsung",
    value: "1",
    suffix: "Aktif",
    tone: "green",
  },
  {
    id: "pending",
    label: "Belum Input Hasil",
    value: "2",
    suffix: "Perlu Tindakan",
    tone: "red",
  },
];

export const scheduleStatusOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Berlangsung", value: "BERLANGSUNG" },
  { label: "Akan Datang", value: "AKAN DATANG" },
  { label: "Menunggu Input", value: "MENUNGGU INPUT" },
  { label: "Selesai", value: "SELESAI" },
];

export const scheduleVehicleOptions = [
  { label: "Semua Kendaraan", value: "all" },
  { label: "Toyota Avanza", value: "toyota-avanza" },
  { label: "Honda Brio", value: "honda-brio" },
];

export const teachingScheduleItems: TeachingScheduleItem[] = [
  {
    id: "schedule-1",
    date: "24 Okt 2023",
    day: "Selasa",
    time: "08:00 - 10:00",
    vehicleName: "Toyota Avanza",
    vehiclePlate: "B 1234 ABC",
    transmission: "Manual",
    participantName: "Andi Nasution",
    participantInitial: "AN",
    participantSession: "Sesi 4 dari 12",
    avatarTone: "blue",
    status: "BERLANGSUNG",
    action: "BUKA SESI",
    detail: {
      sessionCode: "SK-2024-001",
      updatedAt: "Diperbarui 5 menit yang lalu",
      focus:
        "Sesi latihan dasar teknik pengereman dan pengenalan instrumen dashboard untuk pemula tahap awal.",
      participants: [
        {
          id: "participant-1",
          name: "Aditya Pratama",
          initials: "AD",
          packageName: "Paket 10 Jam",
          sessionLabel: "Sesi ke-3",
          attendanceStatus: "BELUM ABSEN",
          avatarTone: "blue",
        },
        {
          id: "participant-2",
          name: "Siti Nurhaliza",
          initials: "SN",
          packageName: "Paket Intensif",
          sessionLabel: "Sesi ke-1",
          attendanceStatus: "BELUM ABSEN",
          avatarTone: "blue",
        },
        {
          id: "participant-3",
          name: "Rizky Wijaya",
          initials: "RW",
          packageName: "Paket 10 Jam",
          sessionLabel: "Sesi ke-5",
          attendanceStatus: "BELUM ABSEN",
          avatarTone: "green",
        },
        {
          id: "participant-4",
          name: "Budi Pamungkas",
          initials: "BP",
          packageName: "Paket 10 Jam",
          sessionLabel: "Sesi ke-2",
          attendanceStatus: "BELUM ABSEN",
          avatarTone: "slate",
        },
      ],
    },
  },
  {
    id: "schedule-2",
    date: "24 Okt 2023",
    day: "Selasa",
    time: "13:00 - 15:00",
    vehicleName: "Honda Brio",
    vehiclePlate: "B 5678 XYZ",
    transmission: "Matic",
    participantName: "Siti Pertiwi",
    participantInitial: "SP",
    participantSession: "Sesi 1 dari 10",
    avatarTone: "slate",
    status: "AKAN DATANG",
    action: "LIHAT DETAIL",
    detail: {
      sessionCode: "SK-2024-002",
      updatedAt: "Diperbarui 12 menit yang lalu",
      focus:
        "Sesi pengenalan kontrol kendaraan matic, posisi duduk, pengaturan spion, serta simulasi start dan berhenti.",
      participants: [
        {
          id: "participant-5",
          name: "Siti Pertiwi",
          initials: "SP",
          packageName: "Paket 10 Jam",
          sessionLabel: "Sesi ke-1",
          attendanceStatus: "BELUM ABSEN",
          avatarTone: "slate",
        },
      ],
    },
  },
  {
    id: "schedule-3",
    date: "23 Okt 2023",
    day: "Senin",
    time: "10:00 - 12:00",
    vehicleName: "Toyota Avanza",
    vehiclePlate: "B 1234 ABC",
    transmission: "Manual",
    participantName: "Rahmat Mahendra",
    participantInitial: "RM",
    participantSession: "Sesi 12 dari 12",
    avatarTone: "green",
    status: "MENUNGGU INPUT",
    action: "INPUT HASIL",
    detail: {
      sessionCode: "SK-2024-003",
      updatedAt: "Diperbarui 1 jam yang lalu",
      focus:
        "Sesi akhir untuk evaluasi penguasaan rute, penggunaan kopling, parkir, dan kesiapan peserta mengikuti ujian praktik.",
      participants: [
        {
          id: "participant-6",
          name: "Rahmat Mahendra",
          initials: "RM",
          packageName: "Paket 10 Jam",
          sessionLabel: "Sesi ke-12",
          attendanceStatus: "HADIR",
          avatarTone: "green",
        },
      ],
    },
  },
  {
    id: "schedule-4",
    date: "23 Okt 2023",
    day: "Senin",
    time: "08:00 - 10:00",
    vehicleName: "Honda Brio",
    vehiclePlate: "B 5678 XYZ",
    transmission: "Matic",
    participantName: "Dewi Lestari",
    participantInitial: "DL",
    participantSession: "Sesi 8 dari 10",
    avatarTone: "slate",
    status: "SELESAI",
    action: "LIHAT DETAIL",
    detail: {
      sessionCode: "SK-2024-004",
      updatedAt: "Diperbarui 2 jam yang lalu",
      focus:
        "Sesi latihan pengendalian kendaraan di area padat, menjaga jarak aman, dan penerapan etika berkendara.",
      participants: [
        {
          id: "participant-7",
          name: "Dewi Lestari",
          initials: "DL",
          packageName: "Paket 10 Jam",
          sessionLabel: "Sesi ke-8",
          attendanceStatus: "HADIR",
          avatarTone: "slate",
        },
      ],
    },
  },
];

export const upcomingAgendaItems: UpcomingAgendaItem[] = [
  {
    id: "agenda-1",
    label: "Besok • 25 Okt",
    participantName: "Andi Nasution",
    time: "08:00 - 10:00",
    duration: "2 Jam",
    vehicle: "Toyota Avanza (B 1234 ABC)",
    participantInitials: ["BS", "AN"],
    icon: CalendarDays,
    active: true,
  },
  {
    id: "agenda-2",
    label: "Kamis • 26 Okt",
    participantName: "Siti Pertiwi",
    time: "10:00 - 12:00",
    duration: "2 Jam",
    vehicle: "Honda Brio (B 5678 XYZ)",
    participantInitials: ["BS", "SP"],
    icon: Clock3,
  },
  {
    id: "agenda-3",
    label: "Kamis • 26 Okt",
    participantName: "Dewi Lestari",
    time: "14:00 - 16:00",
    duration: "2 Jam",
    vehicle: "Toyota Avanza (B 1234 ABC)",
    participantInitials: ["BS", "DL"],
    icon: CheckCircle2,
  },
];

export const teachingScheduleFooter =
  "© 2026 SIKEMUDI DRIVING SCHOOL";

export const teachingScheduleEmptyMessage = {
  title: "Jadwal tidak ditemukan",
  description: "Coba ubah kata kunci pencarian atau filter jadwal mengajar.",
};

export const teachingScheduleIcons = {
  section: ClipboardList,
};
