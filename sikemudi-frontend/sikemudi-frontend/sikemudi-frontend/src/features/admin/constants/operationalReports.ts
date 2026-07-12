import type { LucideIcon } from "lucide-react";
import {
  Banknote,
  CalendarCheck,
  Car,
  ClipboardCheck,
  FileSpreadsheet,
  GraduationCap,
  LineChart,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

export type AdminOperationalReportTab =
  | "revenue"
  | "bookingPackages"
  | "vehicleUsage"
  | "instructorSchedules"
  | "participantProgress"
  | "trainingOutcomes";

export type AdminOperationalReportCellValue = string | number;

export interface AdminOperationalReportColumn {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  isStatus?: boolean;
  isCurrency?: boolean;
}

export interface AdminOperationalReportRow {
  id: string;
  [key: string]: AdminOperationalReportCellValue;
}

export interface AdminOperationalReportDefinition {
  id: AdminOperationalReportTab;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  columns: AdminOperationalReportColumn[];
  rows: AdminOperationalReportRow[];
}

export interface AdminOperationalReportStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "slate" | "emerald" | "amber";
}

export interface AdminReportFilterValues {
  search: string;
  startDate: string;
  endDate: string;
  periodType: string;
  status: string;
  instructor: string;
  packageName: string;
  paymentMethod: string;
}

export const adminOperationalReportHeader = {
  eyebrow: "Laporan Operasional",
  title: "Report Operasional SIKEMUDI",
  description:
    "Pantau pendapatan, booking paket, pemakaian kendaraan, beban instruktur, progres peserta, dan hasil kelulusan dalam satu halaman.",
};

export const adminOperationalReportStats: AdminOperationalReportStat[] = [
  {
    id: "gross-revenue",
    label: "Pendapatan Masuk",
    value: "Rp 9.750.000",
    description: "Pembayaran terkonfirmasi",
    icon: Banknote,
    tone: "green",
  },
  {
    id: "active-booking",
    label: "Booking Aktif",
    value: "18 Paket",
    description: "Dikonfirmasi dan berjalan",
    icon: CalendarCheck,
    tone: "blue",
  },
  {
    id: "finished-session",
    label: "Sesi Selesai",
    value: "42 Sesi",
    description: "Akumulasi periode aktif",
    icon: ClipboardCheck,
    tone: "slate",
  },
  {
    id: "graduation-rate",
    label: "Kelulusan",
    value: "86%",
    description: "Peserta final yang lulus",
    icon: TrendingUp,
    tone: "emerald",
  },
];

export const operationalReportDefinitions: AdminOperationalReportDefinition[] = [
  {
    id: "revenue",
    label: "Pendapatan Kursus",
    shortLabel: "Pendapatan",
    description:
      "Rekap uang masuk dari pembayaran paket kursus. Kolom refund disiapkan untuk scope refund berikutnya.",
    icon: Banknote,
    columns: [
      { key: "date", label: "Tanggal" },
      { key: "bookingCode", label: "Kode Booking" },
      { key: "participant", label: "Peserta" },
      { key: "packageName", label: "Paket" },
      { key: "paymentStatus", label: "Status", isStatus: true },
      { key: "paymentMethod", label: "Metode Bayar", isStatus: true },
      { key: "paymentAmount", label: "Uang Masuk", align: "right", isCurrency: true },
      { key: "refundAmount", label: "Refund", align: "right", isCurrency: true },
      { key: "netAmount", label: "Pendapatan Bersih", align: "right", isCurrency: true },
    ],
    rows: [
      {
        id: "REV-001",
        date: "14 Mei 2026",
        bookingCode: "BGP-20260514-0001",
        participant: "Rizky Darmawan",
        packageName: "Paket 6 Jam",
        paymentStatus: "Terkonfirmasi",
        paymentMethod: "Transfer Bank",
        paymentAmount: 810000,
        refundAmount: 0,
        netAmount: 810000,
      },
      {
        id: "REV-002",
        date: "15 Mei 2026",
        bookingCode: "BGP-20260515-0002",
        participant: "Anisa Septiani",
        packageName: "Paket 10 Jam",
        paymentStatus: "Terkonfirmasi",
        paymentMethod: "Cash",
        paymentAmount: 1200000,
        refundAmount: 0,
        netAmount: 1200000,
      },
      {
        id: "REV-003",
        date: "16 Mei 2026",
        bookingCode: "BGP-20260516-0003",
        participant: "Budi Pratama",
        packageName: "Paket 20 Jam",
        paymentStatus: "Menunggu Konfirmasi",
        paymentMethod: "Transfer Bank",
        paymentAmount: 0,
        refundAmount: 0,
        netAmount: 0,
      },
    ],
  },
  {
    id: "bookingPackages",
    label: "Booking Paket Kursus",
    shortLabel: "Booking Paket",
    description:
      "Rekap booking paket yang berisi total sesi, status pembayaran, sesi pertama, dan sesi terakhir.",
    icon: CalendarCheck,
    columns: [
      { key: "bookingCode", label: "Kode Booking" },
      { key: "participant", label: "Peserta" },
      { key: "packageName", label: "Paket" },
      { key: "totalSessions", label: "Total Sesi", align: "center" },
      { key: "bookingStatus", label: "Status Booking", isStatus: true },
      { key: "paymentStatus", label: "Status Bayar", isStatus: true },
      { key: "paymentMethod", label: "Metode Bayar", isStatus: true },
      { key: "firstSession", label: "Sesi Pertama" },
      { key: "lastSession", label: "Sesi Terakhir" },
    ],
    rows: [
      {
        id: "BGP-20260514-0001",
        bookingCode: "BGP-20260514-0001",
        participant: "Rizky Darmawan",
        packageName: "Paket 6 Jam",
        totalSessions: 3,
        bookingStatus: "Dikonfirmasi",
        paymentStatus: "Terkonfirmasi",
        paymentMethod: "Transfer Bank",
        firstSession: "22 Mei 2026",
        lastSession: "05 Juni 2026",
      },
      {
        id: "BGP-20260515-0002",
        bookingCode: "BGP-20260515-0002",
        participant: "Anisa Septiani",
        packageName: "Paket 10 Jam",
        totalSessions: 5,
        bookingStatus: "Dalam Proses",
        paymentStatus: "Terkonfirmasi",
        paymentMethod: "Cash",
        firstSession: "23 Mei 2026",
        lastSession: "20 Juni 2026",
      },
      {
        id: "BGP-20260516-0003",
        bookingCode: "BGP-20260516-0003",
        participant: "Budi Pratama",
        packageName: "Paket 20 Jam",
        totalSessions: 10,
        bookingStatus: "Menunggu Pembayaran",
        paymentStatus: "Menunggu Konfirmasi",
        paymentMethod: "Transfer Bank",
        firstSession: "24 Mei 2026",
        lastSession: "26 Juli 2026",
      },
    ],
  },
  {
    id: "vehicleUsage",
    label: "Pemakaian Kendaraan",
    shortLabel: "Kendaraan",
    description:
      "Rekap utilisasi kendaraan berdasarkan sesi yang digunakan, total jam, sesi selesai, dan pembatalan.",
    icon: Car,
    columns: [
      { key: "vehicle", label: "Kendaraan" },
      { key: "plateNumber", label: "Plat Nomor" },
      { key: "transmission", label: "Transmisi" },
      { key: "usedSessions", label: "Sesi Digunakan", align: "center" },
      { key: "usedHours", label: "Total Jam", align: "center" },
      { key: "finishedSessions", label: "Selesai", align: "center" },
      { key: "cancelledSessions", label: "Dibatalkan", align: "center" },
      { key: "status", label: "Status", isStatus: true },
    ],
    rows: [
      {
        id: "VEH-001",
        vehicle: "Toyota Avanza",
        plateNumber: "B 1234 ABC",
        transmission: "Manual",
        usedSessions: 14,
        usedHours: 28,
        finishedSessions: 10,
        cancelledSessions: 1,
        status: "Aktif",
      },
      {
        id: "VEH-002",
        vehicle: "Honda Brio RS",
        plateNumber: "B 5678 XYZ",
        transmission: "Matic",
        usedSessions: 11,
        usedHours: 22,
        finishedSessions: 8,
        cancelledSessions: 0,
        status: "Aktif",
      },
      {
        id: "VEH-003",
        vehicle: "Daihatsu Xenia",
        plateNumber: "F 2024 DTI",
        transmission: "Manual",
        usedSessions: 7,
        usedHours: 14,
        finishedSessions: 4,
        cancelledSessions: 2,
        status: "Servis",
      },
    ],
  },
  {
    id: "instructorSchedules",
    label: "Jadwal Instruktur",
    shortLabel: "Instruktur",
    description:
      "Rekap beban mengajar instruktur berdasarkan jumlah sesi, total jam mengajar, dan status sesi.",
    icon: GraduationCap,
    columns: [
      { key: "instructor", label: "Instruktur" },
      { key: "totalSessions", label: "Total Sesi", align: "center" },
      { key: "teachingHours", label: "Total Jam", align: "center" },
      { key: "finishedSessions", label: "Selesai", align: "center" },
      { key: "absentSessions", label: "Peserta Tidak Hadir", align: "center" },
      { key: "cancelledSessions", label: "Dibatalkan", align: "center" },
      { key: "status", label: "Status", isStatus: true },
    ],
    rows: [
      {
        id: "INS-001",
        instructor: "Bambang Pamungkas",
        totalSessions: 18,
        teachingHours: 36,
        finishedSessions: 12,
        absentSessions: 1,
        cancelledSessions: 0,
        status: "Aktif",
      },
      {
        id: "INS-002",
        instructor: "Siti Rahmawati",
        totalSessions: 15,
        teachingHours: 30,
        finishedSessions: 9,
        absentSessions: 2,
        cancelledSessions: 1,
        status: "Aktif",
      },
      {
        id: "INS-003",
        instructor: "Agus Setiawan",
        totalSessions: 9,
        teachingHours: 18,
        finishedSessions: 6,
        absentSessions: 0,
        cancelledSessions: 2,
        status: "Nonaktif",
      },
    ],
  },
  {
    id: "participantProgress",
    label: "Progres Peserta",
    shortLabel: "Progres",
    description:
      "Pantauan progres peserta berdasarkan sesi selesai, persentase penyelesaian, status kelulusan, dan status sertifikat.",
    icon: Users,
    columns: [
      { key: "participant", label: "Peserta" },
      { key: "packageName", label: "Paket Aktif" },
      { key: "totalSessions", label: "Total Sesi", align: "center" },
      { key: "finishedSessions", label: "Selesai", align: "center" },
      { key: "progress", label: "Progress" },
      { key: "finalStatus", label: "Status Akhir", isStatus: true },
      { key: "certificateStatus", label: "Sertifikat", isStatus: true },
    ],
    rows: [
      {
        id: "PRG-001",
        participant: "Rizky Darmawan",
        packageName: "Paket 6 Jam",
        totalSessions: 3,
        finishedSessions: 3,
        progress: "100%",
        finalStatus: "Lulus",
        certificateStatus: "Terbit",
      },
      {
        id: "PRG-002",
        participant: "Anisa Septiani",
        packageName: "Paket 10 Jam",
        totalSessions: 5,
        finishedSessions: 2,
        progress: "40%",
        finalStatus: "Dalam Proses",
        certificateStatus: "Dalam Proses",
      },
      {
        id: "PRG-003",
        participant: "Budi Pratama",
        packageName: "Paket 20 Jam",
        totalSessions: 10,
        finishedSessions: 0,
        progress: "0%",
        finalStatus: "Belum Mulai",
        certificateStatus: "Belum Terbit",
      },
    ],
  },
  {
    id: "trainingOutcomes",
    label: "Hasil Latihan dan Kelulusan",
    shortLabel: "Kelulusan",
    description:
      "Rekap hasil latihan final, nilai akhir, status kelulusan, dan validasi admin sebelum sertifikat diterbitkan.",
    icon: ClipboardCheck,
    columns: [
      { key: "participant", label: "Peserta" },
      { key: "packageName", label: "Paket" },
      { key: "instructor", label: "Instruktur" },
      { key: "attendance", label: "Kehadiran", isStatus: true },
      { key: "finalScore", label: "Nilai Akhir", align: "center" },
      { key: "graduationStatus", label: "Kelulusan", isStatus: true },
      { key: "validationStatus", label: "Validasi Admin", isStatus: true },
    ],
    rows: [
      {
        id: "OUT-001",
        participant: "Rizky Darmawan",
        packageName: "Paket 6 Jam",
        instructor: "Bambang Pamungkas",
        attendance: "Hadir",
        finalScore: 86,
        graduationStatus: "Lulus",
        validationStatus: "Tervalidasi",
      },
      {
        id: "OUT-002",
        participant: "Siti Aminah",
        packageName: "Paket 6 Jam",
        instructor: "Siti Rahmawati",
        attendance: "Tidak Hadir",
        finalScore: "-",
        graduationStatus: "Tidak Lulus",
        validationStatus: "Belum Validasi",
      },
      {
        id: "OUT-003",
        participant: "Ahmad Fauzi",
        packageName: "Paket 10 Jam",
        instructor: "Agus Setiawan",
        attendance: "Hadir",
        finalScore: 74,
        graduationStatus: "Lulus",
        validationStatus: "Belum Validasi",
      },
    ],
  },
];

export const adminOperationalReportTabs = operationalReportDefinitions.map(
  (report) => ({
    id: report.id,
    label: report.shortLabel,
    icon: report.icon,
  }),
);

export const periodTypeOptions = [
  { label: "Harian", value: "daily" },
  { label: "Mingguan", value: "weekly" },
  { label: "Bulanan", value: "monthly" },
  { label: "Tahunan", value: "yearly" },
];

export const reportStatusOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Terkonfirmasi", value: "Terkonfirmasi" },
  { label: "Dalam Proses", value: "Dalam Proses" },
  { label: "Selesai/Lulus/Terbit", value: "completed" },
  { label: "Menunggu", value: "pending" },
  { label: "Dibatalkan/Tidak Lulus", value: "cancelled" },
];

export const reportPaymentMethodOptions = [
  { label: "Semua Metode", value: "all" },
  { label: "Transfer Bank", value: "Transfer" },
  { label: "Cash", value: "Cash" },
];

export const reportInstructorOptions = [
  { label: "Semua Instruktur", value: "all" },
  { label: "Bambang Pamungkas", value: "Bambang Pamungkas" },
  { label: "Siti Rahmawati", value: "Siti Rahmawati" },
  { label: "Agus Setiawan", value: "Agus Setiawan" },
];

export const reportPackageOptions = [
  { label: "Semua Paket", value: "all" },
  { label: "Paket 6 Jam", value: "Paket 6 Jam" },
  { label: "Paket 10 Jam", value: "Paket 10 Jam" },
  { label: "Paket 20 Jam", value: "Paket 20 Jam" },
];

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function createDefaultAdminReportFilterValues(): AdminReportFilterValues {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    search: "",
    startDate: formatDateInputValue(startOfMonth),
    endDate: formatDateInputValue(endOfMonth),
    periodType: "monthly",
    status: "all",
    instructor: "all",
    packageName: "all",
    paymentMethod: "all",
  };
}

export const adminOperationalReportInsight = {
  title: "Fokus Operasional",
  description:
    "Enam laporan ini dipilih supaya report tidak hanya menampilkan data master, tetapi juga membantu evaluasi pendapatan, utilisasi kendaraan, beban instruktur, progres peserta, dan kelulusan.",
};

export const operationalReportSummaryCards = [
  {
    title: "Pendapatan Bersih",
    value: "Rp 2.010.000",
    description: "Uang masuk dikurangi refund. Refund masih disiapkan untuk patch berikutnya.",
    icon: FileSpreadsheet,
  },
  {
    title: "Resource Utama",
    value: "Instruktur & Kendaraan",
    description: "Laporan dibuat untuk melihat pemakaian dua resource utama kursus mengemudi.",
    icon: UserCheck,
  },
  {
    title: "Output Pembelajaran",
    value: "Kelulusan & Sertifikat",
    description: "Progres peserta dan hasil latihan menjadi dasar penerbitan sertifikat.",
    icon: LineChart,
  },
];
