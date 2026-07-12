export interface ScheduleStatItem {
  label: string;
  value: string;
  accent: "blue" | "green" | "slate";
  highlighted?: boolean;
}

export interface UpcomingSessionItem {
  id: string;
  bookingId: number;
  scheduleId: number | null;
  coursePackageId: number | null;
  status: string;
  paymentStatus: string;
  date: string;
  dateISO: string;
  time: string;
  instructor: string;
  vehicle: string;
  packageName: string;
  pickupLabel: string;
  simLabel: string;
  priceLabel: string;
  note: string;
  canModify: boolean;
  canReschedule: boolean;
  canCancel: boolean;
  canUploadPaymentProof?: boolean;
  accent: "blue" | "slate";
}

export interface CompletedSessionItem {
  id: string;
  bookingId: number;
  date: string;
  time: string;
  instructor: string;
  vehicle: string;
  packageName: string;
  status: string;
}

export interface RescheduleSlotItem {
  id: string;
  scheduleId: number;
  dayLabel: string;
  dayNumber: string;
  title: string;
  time: string;
  instructor: string;
  vehicle: string;
  quotaLabel?: string;
  quotaVariant?: "success" | "danger";
}

export const myScheduleStats: ScheduleStatItem[] = [
  {
    label: "JADWAL AKTIF",
    value: "2 Sesi",
    accent: "blue",
  },
  {
    label: "SESI SELESAI",
    value: "8 Sesi",
    accent: "green",
  },
  {
    label: "MENUNGGU JADWAL",
    value: "0 Sesi",
    accent: "slate",
  },
  {
    label: "STATUS SERTIFIKAT",
    value: "Dalam Proses",
    accent: "blue",
    highlighted: true,
  },
];

export const upcomingSessions: UpcomingSessionItem[] = [];

export const completedSessions: CompletedSessionItem[] = [];

export const scheduleRules = [
  "Jadwal yang berhasil dibooking akan muncul di sini secara real-time.",
  "Perubahan dan pembatalan jadwal harus dilakukan minimal 3 hari sebelum sesi dimulai sesuai aturan sistem.",
  "Sesi yang telah selesai akan otomatis masuk ke riwayat latihan dan berkontribusi pada sertifikat Anda.",
];

export const supportInfo = {
  title: "Butuh Bantuan?",
  description: "Hubungi admin untuk kendala jadwal",
  actionLabel: "WhatsApp Admin",
};

export const rescheduleSlots: RescheduleSlotItem[] = [];
