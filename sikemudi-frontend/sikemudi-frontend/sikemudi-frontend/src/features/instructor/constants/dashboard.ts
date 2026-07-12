import {
  AlertTriangle,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Clock3,
  FileText,
  Flag,
  LifeBuoy,
  ListChecks,
  PlayCircle,
  PlusCircle,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface InstructorDashboardStat {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "emerald" | "indigo" | "red";
}

export interface TodayTeachingScheduleItem {
  id: string;
  time: string;
  date: string;
  vehicleName: string;
  vehiclePlate: string;
  participantCount: number;
  status: "BERLANGSUNG" | "TERJADWAL";
  actionLabel: string;
  actionVariant: "link" | "primary";
}

export interface ActiveParticipantItem {
  id: string;
  name: string;
  packageLabel: string;
  sessionLabel: string;
  avatar: string;
}

export interface TaskReminderItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "danger" | "info";
}

export interface QuickAccessItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const instructorWelcome = {
  eyebrow: "SIKEMUDI DASHBOARD",
  title: "Dashboard Instruktur",
  description:
    "Pantau jadwal mengajar dan aktivitas sesi latihan Anda hari ini.",
};

export const instructorDashboardStats: InstructorDashboardStat[] = [
  {
    label: "Hari Ini",
    value: "4 Sesi",
    description: "Jadwal Mengajar",
    icon: CalendarDays,
    tone: "blue",
  },
  {
    label: "Aktif",
    value: "1 Sesi",
    description: "Sedang Berlangsung",
    icon: PlayCircle,
    tone: "emerald",
  },
  {
    label: "Total",
    value: "12\nPeserta",
    description: "Peserta Hari Ini",
    icon: Users,
    tone: "indigo",
  },
  {
    label: "Pending",
    value: "2 Sesi",
    description: "Menunggu Input Hasil",
    icon: ClipboardList,
    tone: "red",
  },
];

export const todayTeachingSchedules: TodayTeachingScheduleItem[] = [
  {
    id: "schedule-1",
    time: "08:00 - 10:00",
    date: "24 Mei 2024",
    vehicleName: "Toyota Avanza",
    vehiclePlate: "B 1234 SIK",
    participantCount: 4,
    status: "BERLANGSUNG",
    actionLabel: "Lihat Detail",
    actionVariant: "link",
  },
  {
    id: "schedule-2",
    time: "10:30 - 12:30",
    date: "24 Mei 2024",
    vehicleName: "Toyota Avanza",
    vehiclePlate: "B 1234 SIK",
    participantCount: 3,
    status: "TERJADWAL",
    actionLabel: "Lihat Detail",
    actionVariant: "link",
  },
  {
    id: "schedule-3",
    time: "13:00 - 15:00",
    date: "24 Mei 2024",
    vehicleName: "Toyota Vios",
    vehiclePlate: "B 5678 SIK",
    participantCount: 5,
    status: "TERJADWAL",
    actionLabel: "Buka Sesi",
    actionVariant: "primary",
  },
];

export const nextTeachingSession = {
  badge: "Sesi Berikutnya",
  time: "13:00 - 15:00",
  timezone: "Waktu Indonesia Barat",
  vehicleName: "Toyota Vios • B 5678 SIK",
  locationName: "Pool Sudirman Hub",
  actionLabel: "Siapkan Sesi",
};

export const activeSessionParticipants: ActiveParticipantItem[] = [
  {
    id: "participant-1",
    name: "Budi Pratama",
    packageLabel: "Paket 10 Jam",
    sessionLabel: "Sesi 4",
    avatar: "BP",
  },
  {
    id: "participant-2",
    name: "Siti Aminah",
    packageLabel: "Paket 20 Jam",
    sessionLabel: "Sesi 1",
    avatar: "SA",
  },
  {
    id: "participant-3",
    name: "Anto Wijaya",
    packageLabel: "Paket 10 Jam",
    sessionLabel: "Sesi 8",
    avatar: "AW",
  },
  {
    id: "participant-4",
    name: "Dewi Lestari",
    packageLabel: "Paket 20 Jam",
    sessionLabel: "Sesi 12",
    avatar: "DL",
  },
];

export const activeSessionWindow = "08:00 - 10:00";

export const taskReminders: TaskReminderItem[] = [
  {
    id: "reminder-1",
    title: "Input Hasil Pending",
    description:
      "2 sesi hari ini belum diinput hasilnya. Segera lengkapi untuk laporan peserta.",
    icon: AlertTriangle,
    tone: "danger",
  },
  {
    id: "reminder-2",
    title: "Sesi Segera Dimulai",
    description:
      "Sesi jam 13:00 akan dimulai dalam 45 menit. Harap cek kesiapan kendaraan.",
    icon: Clock3,
    tone: "info",
  },
];

export const quickAccessItems: QuickAccessItem[] = [
  { id: "quick-1", label: "Silabus", icon: FileText },
  { id: "quick-2", label: "BBM Log", icon: ClipboardList },
  { id: "quick-3", label: "Bantuan", icon: LifeBuoy },
  { id: "quick-4", label: "Emergency", icon: PlusCircle },
];


export const instructorQuickAction = {
  label: "Mulai Sesi Baru",
  to: "/instruktur/sesi/baru",
  icon: PlusCircle,
};

export const instructorIdentity = {
  name: "Instruktur Utama",
  role: "SIKEMUDI PORTAL",
  avatar: "IU",
};

export const instructorSidebarInfo = {
  title: "",
  subtitle: "Instructor Portal",
};

export const instructorNavigationItems = [
  { label: "Dashboard", to: "/instruktur/dashboard", icon: ListChecks },
  {
    label: "Jadwal Mengajar",
    to: "/instruktur/jadwal-mengajar",
    icon: CalendarDays,
  },
  { label: "Sesi Latihan", to: "/instruktur/sesi/1", icon: Flag },
  {
    label: "Hasil Latihan",
    to: "/instruktur/hasil-latihan/input/1",
    icon: CheckSquare,
  },
  { label: "Profil", to: "/instruktur/profil", icon: UserRound },
];
