import {
  Award,
//   BookOpen,
//   CalendarClock,
//   Clock3,
  Phone,
  User,
  type LucideIcon,
} from "lucide-react";

export interface DashboardStatItem {
  label: string;
  value: string;
  suffix: string;
  highlighted?: boolean;
}

export interface AvailableSlotItem {
  label: string;
  time: string;
}

export interface BookingHistoryItem {
  date: string;
  session: string;
  instructor: string;
  status: "SELESAI" | "DIBATALKAN" | "DIJADWALKAN ULANG";
}

export interface AccountInfoItem {
  icon: LucideIcon;
  label: string;
  value: string;
  secondary?: string;
}

export const dashboardStats: DashboardStatItem[] = [
  {
    label: "JADWAL AKTIF",
    value: "1",
    suffix: "Sesi",
  },
  {
    label: "TOTAL BOOKING",
    value: "5",
    suffix: "Total",
  },
  {
    label: "RIWAYAT LATIHAN",
    value: "4",
    suffix: "Selesai",
  },
  {
    label: "STATUS SERTIFIKAT",
    value: "Belum Lulus",
    suffix: "",
    highlighted: true,
  },
];

export const availableSlots: AvailableSlotItem[] = [
  { label: "Pagi", time: "08:00" },
  { label: "Siang", time: "10:00" },
  { label: "Siang", time: "13:00" },
];

export const bookingHistory: BookingHistoryItem[] = [
  {
    date: "20 Okt 2024",
    session: "08:00 - 10:00",
    instructor: "Bpk. Budi",
    status: "SELESAI",
  },
  {
    date: "18 Okt 2024",
    session: "14:00 - 16:00",
    instructor: "Ibu Siti",
    status: "DIBATALKAN",
  },
  {
    date: "15 Okt 2024",
    session: "10:00 - 12:00",
    instructor: "Bpk. Agus",
    status: "DIJADWALKAN ULANG",
  },
];

export const accountInfo: AccountInfoItem[] = [
  {
    icon: User,
    label: "NAMA LENGKAP",
    value: "Ahmad Sulaiman",
  },
  {
    icon: Award,
    label: "TIPE PELATIHAN",
    value: "SIM A (Mobil Penumpang)",
  },
  {
    icon: Phone,
    label: "KONTAK",
    value: "+62 812-3456-7890",
  },
];

export const dailyTip = {
  title: "Tips Hari Ini",
  description:
    "Selalu periksa kaca spion setiap 5-8 detik saat berkendara untuk menjaga kesadaran situasional di jalan raya.",
};

export const nearestSession = {
  badge: "TERKONFIRMASI",
  title: "Sesi Latihan Terdekat",
  dateLabel: "TANGGAL & WAKTU",
  dateValue: "25 Okt 2024",
  dateSecondary: "09:00 - 11:00",
  instructorLabel: "INSTRUKTUR",
  instructorValue: "Bpk. Budi",
  instructorSecondary: "Senior",
  vehicleLabel: "KENDARAAN",
  vehicleValue: "Toyota Avanza",
  vehicleSecondary: "Manual",
};

export const certificateProgress = {
  title: "Sertifikat Digital Terverifikasi",
  description:
    "Sertifikat digital akan tersedia setelah Anda dinyatakan lulus dari semua modul pelatihan dan ujian praktik.",
  progressLabel: "PROGRES KELULUSAN",
  progressText: "65% Selesai",
  progressStage: "Tahap 3/5",
  percentage: 65,
};

export const welcomeInfo = {
  greeting: "Selamat Datang, Ahmad",
  description:
    "Kelola jadwal latihan, booking sesi, dan lihat status pelatihan Anda di sini. Pantau progress Anda menuju pengemudi yang kompeten.",
  participantId: "SK-2024",
};
