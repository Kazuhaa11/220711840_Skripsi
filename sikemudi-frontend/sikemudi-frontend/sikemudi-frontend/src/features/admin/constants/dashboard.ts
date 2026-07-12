import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  Car,
  ClipboardCheck,
  Clock3,
  FileText,
  GraduationCap,
  Package,
  ScrollText,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";

export type AdminScheduleStatus = "Selesai" | "Berlangsung" | "Akan Datang";
export type AdminBookingStatus = "Dikonfirmasi" | "Pending";

export interface AdminDashboardStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "slate" | "blue" | "green" | "red";
}

export interface AdminTodaySchedule {
  id: string;
  time: string;
  instructor: string;
  vehicle: string;
  participantCount: number;
  status: AdminScheduleStatus;
}

export interface AdminRecentBooking {
  id: string;
  participantName: string;
  packageName: string;
  date: string;
  status: AdminBookingStatus;
  time: string;
}

export interface AdminOperationalStatus {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "green" | "blue" | "red" | "slate";
}

export interface AdminQuickAction {
  id: string;
  label: string;
  to: string;
  icon: LucideIcon;
}

export const adminDashboardHeader = {
  title: "Dashboard Admin",
  description: "Pantau aktivitas operasional kursus mengemudi secara terpusat.",
};

export const adminDashboardStats: AdminDashboardStat[] = [
  {
    id: "participants",
    label: "Peserta",
    value: "150",
    description: "Total Peserta Aktif",
    icon: Users,
    tone: "slate",
  },
  {
    id: "instructors",
    label: "Instruktur",
    value: "12",
    description: "Ready di Lapangan",
    icon: GraduationCap,
    tone: "blue",
  },
  {
    id: "vehicles",
    label: "Kendaraan",
    value: "8",
    description: "Unit Siap Digunakan",
    icon: Car,
    tone: "green",
  },
  {
    id: "schedules",
    label: "Jadwal",
    value: "24",
    description: "Sesi Terdaftar",
    icon: CalendarDays,
    tone: "blue",
  },
  {
    id: "bookings",
    label: "Booking",
    value: "45",
    description: "Menunggu Konfirmasi",
    icon: ClipboardCheck,
    tone: "slate",
  },
  {
    id: "certificates",
    label: "Sertifikat Terbit",
    value: "89",
    description: "Sertifikat Terbit",
    icon: BadgeCheck,
    tone: "green",
  },
];

export const adminTodaySchedules: AdminTodaySchedule[] = [
  {
    id: "schedule-1",
    time: "08:00 - 10:00",
    instructor: "Budi Santoso",
    vehicle: "Toyota Avanza (B 1234 ABC)",
    participantCount: 1,
    status: "Selesai",
  },
  {
    id: "schedule-2",
    time: "10:30 - 12:30",
    instructor: "Siti Aminah",
    vehicle: "Honda Brio (B 5678 XYZ)",
    participantCount: 1,
    status: "Berlangsung",
  },
  {
    id: "schedule-3",
    time: "13:30 - 15:30",
    instructor: "Joko Susilo",
    vehicle: "Toyota Avanza (B 9012 DEF)",
    participantCount: 2,
    status: "Akan Datang",
  },
];

export const adminRecentBookings: AdminRecentBooking[] = [
  {
    id: "booking-1",
    participantName: "Rian Ardianto",
    packageName: "Paket Pemula Pro",
    date: "21 Mei 2024",
    status: "Dikonfirmasi",
    time: "10:45 AM",
  },
  {
    id: "booking-2",
    participantName: "Linda Sari",
    packageName: "Paket Kilat SIM A",
    date: "22 Mei 2024",
    status: "Pending",
    time: "09:30 AM",
  },
];

export const adminOperationalStatuses: AdminOperationalStatus[] = [
  {
    id: "slot",
    title: "Slot Hampir Penuh",
    description: "Sesi siang (13:00 - 15:00) tersisa 1 slot",
    icon: Clock3,
    tone: "green",
  },
  {
    id: "vehicle",
    title: "Kendaraan Sedang Digunakan",
    description: "6 dari 8 unit aktif di lapangan",
    icon: Car,
    tone: "blue",
  },
  {
    id: "schedule",
    title: "Jadwal Perlu Perhatian",
    description: "2 instruktur berhalangan hari ini",
    icon: AlertTriangle,
    tone: "red",
  },
  {
    id: "certificate",
    title: "Sertifikat Menunggu",
    description: "5 peserta telah menyelesaikan kursus",
    icon: ShieldCheck,
    tone: "slate",
  },
];

export const adminQuickActions: AdminQuickAction[] = [
  {
    id: "participant",
    label: "Tambah Peserta",
    to: "/admin/peserta",
    icon: UserPlus,
  },
  {
    id: "instructor",
    label: "Tambah Instruktur",
    to: "/admin/instruktur",
    icon: GraduationCap,
  },
  {
    id: "vehicle",
    label: "Tambah Kendaraan",
    to: "/admin/kendaraan",
    icon: Car,
  },
  {
    id: "package",
    label: "Tambah Paket",
    to: "/admin/paket-kursus",
    icon: Package,
  },
  {
    id: "schedule",
    label: "Buat Jadwal",
    to: "/admin/jadwal-latihan",
    icon: CalendarDays,
  },
  {
    id: "certificate",
    label: "Kelola Sertifikat",
    to: "/admin/sertifikat",
    icon: BadgeCheck,
  },
];

export const adminReportPreviews = [
  { id: "report-1", label: "Laporan Peserta Bulanan", to: "/admin/report" },
  { id: "report-2", label: "Analisis Jadwal & Slot", to: "/admin/report" },
  { id: "report-3", label: "Statistik Booking", to: "/admin/report" },
  { id: "report-4", label: "Hasil Latihan & Lulusan", to: "/admin/report" },
  { id: "report-5", label: "Arsip Sertifikat Terbit", to: "/admin/report" },
];

export const adminDashboardDate = "Senin, 20 Mei 2024";

export const adminDashboardIcons = {
  report: FileText,
  scroll: ScrollText,
};
