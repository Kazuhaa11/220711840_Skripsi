import type { LucideIcon } from "lucide-react";
import {
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Star,
  UserCheck,
} from "lucide-react";

export type AdminInstructorStatus = "Aktif" | "Nonaktif" | "Cuti";
export type AdminInstructorScheduleStatus =
  | "Mengajar"
  | "Terjadwal"
  | "Libur / Cuti";

export interface AdminInstructor {
  id: string;
  apiId?: number;
  fullName: string;
  email: string;
  phone: string;
  address?: string | null;
  accountStatus?: "Aktif" | "Verifikasi" | "Nonaktif";
  role: string;
  specialization: string;
  status: AdminInstructorStatus;
  scheduleStatus: AdminInstructorScheduleStatus;
  todaySchedule: string;
  remainingSlots: string;
  joinedAt: string;
  rating: number;
  totalSessions: number;
  graduationRate: number;
  initials: string;
  avatarTone: "blue" | "green" | "amber" | "slate";
  todaySessions: {
    id: string;
    time: string;
    title: string;
    status: "Selesai" | "Berlangsung" | "Mendatang";
  }[];
}

export interface AdminInstructorFormValues {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  passwordConfirmation: string;
  accountStatus: "Aktif" | "Verifikasi" | "Nonaktif";
  role: string;
  specialization: string;
  status: AdminInstructorStatus;
  scheduleStatus: AdminInstructorScheduleStatus;
  todaySchedule: string;
}

export interface AdminInstructorStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "slate";
}

export const adminInstructorHeader = {
  eyebrow: "Manajemen Sumber Daya",
  title: "Daftar Instruktur",
  description:
    "Kelola tim instruktur profesional, pantau ketersediaan jadwal, sertifikasi keahlian, dan performa pelatihan dalam satu dasbor terpadu.",
};

export const adminInstructorInitialData: AdminInstructor[] = [
  {
    id: "#INS-001",
    fullName: "Bambang Pamungkas",
    email: "bambang.p@sikemudi.id",
    phone: "+62 812-3456-7890",
    role: "Senior Instructor",
    specialization: "Manual & Matic",
    status: "Aktif",
    scheduleStatus: "Mengajar",
    todaySchedule: "08:00 - 10:00 (Sesi 1)",
    remainingSlots: "4 sesi tersisa",
    joinedAt: "14 Januari 2021",
    rating: 4.9,
    totalSessions: 120,
    graduationRate: 94,
    initials: "BP",
    avatarTone: "blue",
    todaySessions: [
      {
        id: "session-1",
        time: "08:00 - 10:00",
        title: "Sesi Dasar - Andi Pratama",
        status: "Selesai",
      },
      {
        id: "session-2",
        time: "11:00 - 13:00",
        title: "Parkir Paralel - Siti Aminah",
        status: "Berlangsung",
      },
      {
        id: "session-3",
        time: "15:00 - 17:00",
        title: "Evaluasi Akhir - Budi Hartono",
        status: "Mendatang",
      },
    ],
  },
  {
    id: "#INS-002",
    fullName: "Siti Rahmawati",
    email: "siti.r@sikemudi.id",
    phone: "+62 821-9876-5432",
    role: "Lead Technical Coach",
    specialization: "Safety Driving",
    status: "Aktif",
    scheduleStatus: "Terjadwal",
    todaySchedule: "13:00 - 15:00 (Sesi 3)",
    remainingSlots: "Terjadwal",
    joinedAt: "22 Maret 2022",
    rating: 4.8,
    totalSessions: 98,
    graduationRate: 91,
    initials: "SR",
    avatarTone: "green",
    todaySessions: [
      {
        id: "session-1",
        time: "13:00 - 15:00",
        title: "Safety Driving - Linda Sari",
        status: "Mendatang",
      },
    ],
  },
  {
    id: "#INS-003",
    fullName: "Agus Setiawan",
    email: "agus.s@sikemudi.id",
    phone: "+62 857-1122-3344",
    role: "Fleet Specialist",
    specialization: "SIM A & C",
    status: "Nonaktif",
    scheduleStatus: "Libur / Cuti",
    todaySchedule: "Libur / Cuti",
    remainingSlots: "-",
    joinedAt: "5 Juni 2020",
    rating: 4.7,
    totalSessions: 140,
    graduationRate: 90,
    initials: "AS",
    avatarTone: "amber",
    todaySessions: [],
  },
];

export const adminInstructorStats: AdminInstructorStat[] = [
  {
    id: "total",
    label: "Total Instruktur",
    value: "42",
    description: "+4 bulan ini",
    icon: GraduationCap,
    tone: "blue",
  },
  {
    id: "active",
    label: "Aktif Sekarang",
    value: "28",
    description: "Sedang mengajar",
    icon: UserCheck,
    tone: "slate",
  },
  {
    id: "graduation",
    label: "Tingkat Kelulusan",
    value: "94%",
    description: "Sangat baik",
    icon: CheckCircle2,
    tone: "slate",
  },
  {
    id: "schedule",
    label: "Jadwal Terisi",
    value: "88%",
    description: "Pekan ini",
    icon: CalendarCheck,
    tone: "green",
  },
];

export const instructorStatusOptions = [
  { label: "Aktif", value: "Aktif" },
  { label: "Nonaktif", value: "Nonaktif" },
  { label: "Cuti", value: "Cuti" },
];

export const instructorScheduleStatusOptions = [
  { label: "Mengajar", value: "Mengajar" },
  { label: "Terjadwal", value: "Terjadwal" },
  { label: "Libur / Cuti", value: "Libur / Cuti" },
];

export const instructorSpecializationOptions = [
  { label: "Manual & Matic", value: "Manual & Matic" },
  { label: "Safety Driving", value: "Safety Driving" },
  { label: "SIM A & C", value: "SIM A & C" },
  { label: "Defensive Driving", value: "Defensive Driving" },
];

export const instructorAccountStatusOptions = [
  { label: "Aktif", value: "Aktif" },
  { label: "Verifikasi", value: "Verifikasi" },
  { label: "Nonaktif", value: "Nonaktif" },
];

export const instructorRoleOptions = [
  { label: "Senior Instructor", value: "Senior Instructor" },
  { label: "Lead Technical Coach", value: "Lead Technical Coach" },
  { label: "Fleet Specialist", value: "Fleet Specialist" },
  { label: "Instructor", value: "Instructor" },
];

export const emptyInstructorFormValues: AdminInstructorFormValues = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  passwordConfirmation: "",
  accountStatus: "Aktif",
  role: "Instructor",
  specialization: "Manual & Matic",
  status: "Aktif",
  scheduleStatus: "Terjadwal",
  todaySchedule: "",
};

export const adminInstructorMessages = {
  addSuccess: "Data instruktur berhasil ditambahkan.",
  editSuccess: "Data instruktur berhasil diperbarui.",
  deleteSuccess: "Data instruktur berhasil dihapus.",
  deactivateSuccess: "Instruktur berhasil dinonaktifkan.",
  activateSuccess: "Instruktur berhasil diaktifkan kembali.",
  emptyTitle: "Data instruktur tidak ditemukan",
  emptyDescription:
    "Coba ubah kata kunci pencarian atau pastikan data instruktur sudah tersedia.",
};

export const adminInstructorPerformance = {
  title: "Performa Instruktur Pekan Ini",
  description: "Berdasarkan feedback peserta dan tingkat kehadiran.",
  items: [
    {
      label: "Kepuasan Pengajar",
      value: 98,
      icon: Star,
    },
    {
      label: "Ketepatan Waktu",
      value: 85,
      icon: Clock3,
    },
  ],
};

export const adminInstructorUpcomingSessions = [
  {
    id: "upcoming-1",
    title: "Sesi Teknik Parkir",
    instructor: "Bambang P. • 15:30 WIB",
    icon: Award,
  },
  {
    id: "upcoming-2",
    title: "Evaluasi Jalan Tol",
    instructor: "Siti Rahma • 16:45 WIB",
    icon: CalendarCheck,
  },
];
