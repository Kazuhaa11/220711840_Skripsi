import {
  BookOpen,
  CalendarCheck,
  FileCheck2,
  type LucideIcon,
} from "lucide-react";

export interface LandingFeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface LandingStepItem {
  number: string;
  title: string;
  description: string;
}

export const landingFeatures: LandingFeatureItem[] = [
  {
    icon: CalendarCheck,
    title: "Penjadwalan Terintegrasi",
    description:
      "Pengelolaan jadwal belajar kursus untuk instruktur dan kendaraan dengan sistem monitoring cerdas.",
  },
  {
    icon: BookOpen,
    title: "Booking Jadwal Online",
    description:
      "Peserta bisa memilih sesi latihan sesuai ketersediaan slot waktu yang tersedia secara real-time.",
  },
  {
    icon: FileCheck2,
    title: "Sertifikat Digital QR",
    description:
      "Verifikasi keaslian dokumen kelulusan Anda dengan cepat melalui pemindaian kode unik.",
  },
];

export const landingSteps: LandingStepItem[] = [
  {
    number: "1",
    title: "Daftar Akun",
    description:
      "Buat profil Anda dan lengkapi data untuk memulai proses kursus secara online.",
  },
  {
    number: "2",
    title: "Pilih Jadwal Tersedia",
    description:
      "Cek slot waktu kosong instruktur dan pilih jadwal yang sesuai dengan aktivitas Anda.",
  },
  {
    number: "3",
    title: "Ikuti Sesi Latihan",
    description:
      "Lakukan praktik berkendara dengan instruktur profesional di LPK Yuzza.",
  },
  {
    number: "4",
    title: "Dapatkan Sertifikat",
    description:
      "Selesaikan seluruh sesi dan terima sertifikat digital yang dapat diverifikasi.",
  },
];

export const landingBenefits: string[] = [
  "Anti-Pemalsuan Dokumen",
  "Aksesibilitas Cloud 24/7",
  "Integrasi Data Terpusat",
];
