export type SlotStatus = "TERSEDIA" | "HAMPIR_PENUH" | "PENUH";

export interface AvailableScheduleSlot {
  id: string;
  date: string;
  dayLabel: string;
  dayNumber: string;
  monthYearLabel: string;
  dateLabel: string;
  timeRange: string;
  timeCategory: "pagi" | "siang" | "sore";
  instructorName: string;
  vehicleName: string;
  remainingQuota: number;
  status: SlotStatus;
}

export interface ScheduleFiltersValue {
  date: string;
  time: string;
  instructor: string;
  vehicle: string;
}

export type BookingHistoryStatus =
  | "SELESAI"
  | "TERKONFIRMASI"
  | "DIBATALKAN"
  | "DITOLAK"
  | "RESCHEDULED";

export interface BookingHistoryItem {
  id: string;
  bookingId: number;
  code: string;
  dateISO: string;
  monthKey: string;
  monthLabel: string;
  dateLabel: string;
  timeRange: string;
  instructorName: string;
  vehicleName: string;
  packageName: string;
  status: BookingHistoryStatus;
  statusLabel: string;
  paymentStatus: string;
  paymentMethod: "Transfer" | "Cash";
  paymentMethodLabel: string;
  priceLabel: string;
  pickupLabel: string;
  simLabel: string;
  notes: string;
}

export type CertificateGraduationStatus = "DALAM_PROSES" | "LULUS";

export interface CertificateRequirement {
  id: string;
  label: string;
  completed: boolean;
}

export interface ParticipantDigitalCertificate {
  id: string;
  backendId?: number | null;
  participantName: string;
  participantTier: string;
  packageName: string;
  isAvailable: boolean;
  graduationStatus: CertificateGraduationStatus;
  verificationLabel: string;
  issueDate: string | null;
  certificateNumber: string | null;
  verificationCode?: string | null;
  certificateStatus?: string | null;
  averageScore: string;
  completedSessions: number;
  totalSessions: number;
  progressPercent: number;
  achievementText: string;
  shareUrl: string;
  qrCode?: string | null;
  qrCodeImageUrl?: string | null;
  pdfAvailable?: boolean;
  pdfOriginalName?: string | null;
  pdfSizeLabel?: string | null;
  instructorName?: string | null;
  trainingDate?: string | null;
  attendanceStatus?: string | null;
  practiceScore?: string;
  attitudeScore?: string;
  understandingScore?: string;
  instructorNote?: string | null;
  adminNote?: string | null;
  requirements: CertificateRequirement[];
  importantNote: string;
}

export interface ParticipantProfileData {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  joinDate: string;
  address: string;
  statusLabel: string;
  packageName: string;
  progressPercent: number;
  completedSessions: number;
  totalSessions: number;
  avatarUrl?: string;
  participantRoleLabel: string;
  participantCode: string;
  isVerified: boolean;
}
