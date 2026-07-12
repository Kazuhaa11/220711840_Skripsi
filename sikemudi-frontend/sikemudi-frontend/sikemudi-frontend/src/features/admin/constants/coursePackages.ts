import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BookOpen,
  Car,
  Clock3,
  GraduationCap,
  PackageCheck,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

export type AdminCoursePackageStatus = "Aktif" | "Nonaktif";
export type AdminCoursePackageCategory =
  | "Mobil Manual"
  | "Mobil Matic"
  | "Motor"
  | "Lainnya";
export type AdminCoursePackageService =
  | "Reguler"
  | "Tanpa Antar Jemput"
  | "Antar Jemput"
  | "VIP"
  | "Akhir Pekan";

export interface AdminCoursePackage {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  durationHours: number;
  categories: AdminCoursePackageCategory[];
  service: AdminCoursePackageService;
  price: number;
  priceNoPickup?: number;
  pricePickup?: number;
  priceSimNoPickup?: number;
  priceSimPickup?: number;
  certificateIncluded: boolean;
  status: AdminCoursePackageStatus;
  registrantsThisWeek: number;
  totalRegistrants: number;
  popularity: number;
  facilities: {
    id: string;
    title: string;
    description: string;
    icon: LucideIcon;
  }[];
}

export interface AdminCoursePackageFormValues {
  name: string;
  shortDescription: string;
  description: string;
  durationHours: string;
  priceNoPickup: string;
  pricePickup: string;
  priceSimNoPickup: string;
  priceSimPickup: string;
  certificateIncluded: boolean;
  status: AdminCoursePackageStatus;
}

export interface AdminCoursePackageStat {
  id: string;
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "slate";
}

export const adminCoursePackageHeader = {
  title: "Manajemen Paket Kursus",
  description:
    "Kelola daftar paket kursus mengemudi untuk seluruh peserta dan cabang.",
};

export const adminCoursePackageInitialData: AdminCoursePackage[] = [
  {
    id: "PK-001",
    name: "Intensif Manual A",
    shortDescription: "Lengkap dengan teori",
    description:
      "Paket intensif untuk peserta yang ingin menguasai mobil manual dalam waktu terstruktur. Materi mencakup pengenalan kendaraan, kontrol kopling, pengereman, parkir, dan simulasi jalan raya.",
    durationHours: 12,
    categories: ["Mobil Manual"],
    service: "Reguler",
    price: 1500000,
    certificateIncluded: true,
    status: "Aktif",
    registrantsThisWeek: 42,
    totalRegistrants: 320,
    popularity: 65,
    facilities: [
      {
        id: "facility-1",
        title: "Mobil Transmisi Manual",
        description:
          "Latihan menggunakan kendaraan manual untuk persiapan SIM A.",
        icon: Car,
      },
      {
        id: "facility-2",
        title: "Sertifikat Kelulusan",
        description: "Diberikan setelah peserta menyelesaikan seluruh sesi.",
        icon: BadgeCheck,
      },
      {
        id: "facility-3",
        title: "Modul Teori Dasar",
        description:
          "Materi pendukung untuk memahami etika dan aturan berkendara.",
        icon: BookOpen,
      },
    ],
  },
  {
    id: "PK-002",
    name: "VIP Matic Express",
    shortDescription: "Antar jemput rumah",
    description:
      "Paket VIP untuk peserta yang membutuhkan layanan latihan matic dengan jadwal fleksibel dan fasilitas antar jemput.",
    durationHours: 8,
    categories: ["Mobil Matic"],
    service: "VIP",
    price: 2250000,
    certificateIncluded: true,
    status: "Aktif",
    registrantsThisWeek: 28,
    totalRegistrants: 210,
    popularity: 28,
    facilities: [
      {
        id: "facility-1",
        title: "Mobil Transmisi Matic",
        description: "Latihan dengan kendaraan matic terbaru dan nyaman.",
        icon: Car,
      },
      {
        id: "facility-2",
        title: "Layanan Antar Jemput",
        description:
          "Peserta dapat dijemput sesuai area layanan yang tersedia.",
        icon: Users,
      },
      {
        id: "facility-3",
        title: "Sertifikat Kelulusan",
        description:
          "Sertifikat digital dan fisik setelah menyelesaikan kursus.",
        icon: BadgeCheck,
      },
    ],
  },
  {
    id: "PK-003",
    name: "Basic Weekend",
    shortDescription: "Hanya Sabtu & Minggu",
    description:
      "Paket akhir pekan untuk peserta dengan jadwal kerja atau kuliah padat. Cocok untuk latihan bertahap setiap akhir pekan.",
    durationHours: 10,
    categories: ["Mobil Manual"],
    service: "Akhir Pekan",
    price: 1800000,
    certificateIncluded: false,
    status: "Nonaktif",
    registrantsThisWeek: 6,
    totalRegistrants: 86,
    popularity: 7,
    facilities: [
      {
        id: "facility-1",
        title: "Jadwal Akhir Pekan",
        description: "Latihan hanya dilakukan pada Sabtu dan Minggu.",
        icon: Clock3,
      },
      {
        id: "facility-2",
        title: "Latihan Dasar",
        description: "Fokus pada dasar berkendara dan pengenalan rambu.",
        icon: GraduationCap,
      },
    ],
  },
  {
    id: "PK-004",
    name: "Motor Bebas SIM C",
    shortDescription: "Lengkap pengurusan SIM",
    description:
      "Paket latihan motor untuk peserta yang ingin mempersiapkan ujian praktik SIM C dengan pendampingan instruktur.",
    durationHours: 6,
    categories: ["Motor"],
    service: "Reguler",
    price: 750000,
    certificateIncluded: true,
    status: "Aktif",
    registrantsThisWeek: 18,
    totalRegistrants: 156,
    popularity: 14,
    facilities: [
      {
        id: "facility-1",
        title: "Latihan Motor",
        description: "Latihan menggunakan unit motor pelatihan.",
        icon: Car,
      },
      {
        id: "facility-2",
        title: "Pendampingan SIM C",
        description: "Materi disesuaikan dengan kebutuhan ujian praktik SIM C.",
        icon: ShieldCheck,
      },
    ],
  },
];

export const adminCoursePackageStats: AdminCoursePackageStat[] = [
  {
    id: "total",
    label: "Total Paket",
    value: "24",
    description: "+2 bulan ini",
    icon: PackageCheck,
    tone: "blue",
  },
  {
    id: "popular",
    label: "Paket Populer",
    value: "Intensif Manual A",
    description: "42 pendaftar minggu ini",
    icon: Star,
    tone: "slate",
  },
  {
    id: "active",
    label: "Status Aktif",
    value: "22",
    description: "Paket aktif vs draft",
    icon: TrendingUp,
    tone: "green",
  },
];

export const coursePackageCategoryOptions = [
  { label: "Semua Kategori", value: "all" },
  { label: "Mobil Manual", value: "Mobil Manual" },
  { label: "Mobil Matic", value: "Mobil Matic" },
  { label: "Motor", value: "Motor" },
  { label: "Lainnya", value: "Lainnya" },
];

export const coursePackageServiceOptions = [
  { label: "Semua Layanan", value: "all" },
  { label: "Reguler", value: "Reguler" },
  { label: "VIP", value: "VIP" },
  { label: "Akhir Pekan", value: "Akhir Pekan" },
  { label: "Antar Jemput", value: "Antar Jemput" },
];

export const coursePackageFormCategoryOptions = [
  { label: "Mobil Manual", value: "Mobil Manual" },
  { label: "Mobil Matic", value: "Mobil Matic" },
  { label: "Motor", value: "Motor" },
  { label: "Lainnya", value: "Lainnya" },
];

export const coursePackageFormServiceOptions = [
  { label: "Reguler", value: "Reguler" },
  { label: "VIP", value: "VIP" },
  { label: "Akhir Pekan", value: "Akhir Pekan" },
  { label: "Antar Jemput", value: "Antar Jemput" },
];

export const coursePackageFormStatusOptions = [
  { label: "Aktif", value: "Aktif" },
  { label: "Nonaktif", value: "Nonaktif" },
];

export const emptyCoursePackageFormValues: AdminCoursePackageFormValues = {
  name: "",
  shortDescription: "",
  description: "",
  durationHours: "",
  priceNoPickup: "",
  pricePickup: "",
  priceSimNoPickup: "",
  priceSimPickup: "",
  certificateIncluded: true,
  status: "Aktif",
};

export const adminCoursePackageMessages = {
  addSuccess: "Paket kursus berhasil ditambahkan.",
  editSuccess: "Paket kursus berhasil diperbarui.",
  deactivateSuccess: "Paket kursus berhasil dinonaktifkan.",
  activateSuccess: "Paket kursus berhasil diaktifkan kembali.",
  emptyTitle: "Paket kursus tidak ditemukan",
  emptyDescription:
    "Coba ubah kata kunci pencarian atau status paket.",
};

export const adminCoursePackagePerformance = {
  title: "Kinerja Paket per Kategori",
  items: [
    { label: "Mobil Manual", value: 65 },
    { label: "Mobil Matic", value: 28 },
    { label: "Lainnya", value: 7 },
  ],
};

export const adminCoursePackageGuide = {
  title: "Optimalkan Penjualan Paket Kursus",
  description:
    "Gunakan fitur promo terbatas untuk meningkatkan pendaftaran di akhir pekan.",
};
