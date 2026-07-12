import type {
  AvailableScheduleApiItem,
  BookingHistoryRecordApiItem,
  BookingPaymentApiItem,
  ScheduleCoursePackageApiItem,
  TrainingResultApiItem,
} from "@/types/booking";
import type { PaginatedApiData } from "@/types/api";

export interface AdminBookingParticipantApiItem {
  id: number;
  kode_peserta: string;
  nama_peserta: string | null;
  email: string | null;
  no_telepon: string | null;
}

export interface AdminBookingSessionApiItem {
  id: number;
  kode_booking: string;
  sesi_ke: number;
  total_sesi: number;
  status: string;
  status_label?: string;
  tanggal_booking: string | null;
  training_schedule: AvailableScheduleApiItem | null;
  training_result?: TrainingResultApiItem | null;
}

export interface AdminBookingApiItem {
  id: number;
  kode_booking: string;
  kode_group?: string;
  booking_group_id?: number | null;
  status: string;
  status_label?: string;
  total_sesi?: number;
  jumlah_sesi_selesai?: number;
  progress_label?: string;
  tanggal_booking: string | null;
  tanggal_dikonfirmasi: string | null;
  tanggal_dibatalkan: string | null;
  alasan_pembatalan: string | null;
  catatan: string | null;
  pakai_antar_jemput: boolean;
  pakai_sim: boolean;
  alamat_jemput: string | null;
  harga_paket: number;
  peserta: AdminBookingParticipantApiItem | null;
  course_package: ScheduleCoursePackageApiItem | null;
  training_schedule: AvailableScheduleApiItem | null;
  payment: (BookingPaymentApiItem & {
    metode_pembayaran?: AdminBookingPaymentMethod | string | null;
    metode_pembayaran_label?: string | null;
    booking_id?: number | null;
    booking_group_id?: number | null;
    verifier?: {
      id: number;
      name: string;
      email: string;
    } | null;
  }) | null;
  sessions?: AdminBookingSessionApiItem[];
  histories?: BookingHistoryRecordApiItem[];
  training_result?: TrainingResultApiItem | null;
  created_at: string | null;
  updated_at: string | null;
}

export type AdminBookingListData = PaginatedApiData<AdminBookingApiItem>;

export interface AdminBookingItemData {
  item: AdminBookingApiItem;
}

export type AdminBookingPaymentMethod = "Transfer" | "Cash";

export interface AdminBookingListQuery {
  q?: string;
  status?: string;
  payment_status?: string;
  metode_pembayaran?: AdminBookingPaymentMethod;
  course_package_id?: string | number;
  tanggal?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  per_page?: number;
  page?: number;
}

export interface ConfirmAdminBookingPaymentPayload {
  catatan_admin?: string | null;
}

export interface RejectAdminBookingPaymentPayload {
  alasan_penolakan: string;
  catatan_admin?: string | null;
}

export interface ChangeAdminBookingSchedulePayload {
  training_schedule_id: number;
  catatan?: string | null;
}

export interface CancelAdminBookingPayload {
  alasan_pembatalan?: string | null;
}

export interface AdminBookingRowItem {
  id: string;
  numericId: number;
  code: string;
  participantName: string;
  participantCode: string;
  participantEmail: string;
  participantPhone: string;
  packageName: string;
  packageId: number | null;
  scheduleId: number | null;
  scheduleCode: string;
  dateLabel: string;
  timeLabel: string;
  instructorName: string;
  vehicleName: string;
  priceLabel: string;
  bookingStatus: string;
  bookingStatusLabel: string;
  paymentStatus: string;
  paymentMethod: AdminBookingPaymentMethod;
  paymentMethodLabel: string;
  isCashPayment: boolean;
  hasPaymentProof: boolean;
  paymentProofName: string;
  paymentAmountLabel: string;
  pickupLabel: string;
  simLabel: string;
  createdAtLabel: string;
  isPackageBooking: boolean;
  progressLabel: string;
  totalSessions: number;
}

export interface AdminBookingStatsItem {
  label: string;
  value: string;
  helper: string;
  accent: "blue" | "green" | "amber" | "red" | "slate";
}

export interface AdminReplacementScheduleItem {
  id: string;
  numericId: number;
  title: string;
  dateLabel: string;
  timeLabel: string;
  instructorName: string;
  vehicleName: string;
  quotaLabel: string;
  raw: AvailableScheduleApiItem;
}

export interface AdminBookingDetailItem extends AdminBookingRowItem {
  raw: AdminBookingApiItem;
  note: string;
  pickupAddress: string;
  paymentSender: string;
  paymentBank: string;
  paymentUploadedAt: string;
  paymentVerifiedAt: string;
  paymentAdminNote: string;
  paymentParticipantNote: string;
  paymentRejectionReason: string;
  paymentMethod: AdminBookingPaymentMethod;
  paymentMethodLabel: string;
  isCashPayment: boolean;
  cancellationReason: string;
  confirmedAtLabel: string;
  canceledAtLabel: string;
  sessions: Array<{
    id: number;
    code: string;
    sessionLabel: string;
    dateLabel: string;
    timeLabel: string;
    status: string;
    resultStatus: string;
  }>;
  histories: Array<{
    id: number;
    action: string;
    statusBefore: string;
    statusAfter: string;
    note: string;
    changedBy: string;
    createdAt: string;
  }>;
}

export interface AdminBookingFiltersValue {
  q: string;
  status: string;
  paymentStatus: string;
  paymentMethod: "all" | AdminBookingPaymentMethod;
}

export type AdminBookingStatusFilter = "all" | string;
export type AdminBookingPaymentStatusFilter = "all" | string;
export type { ScheduleCoursePackageApiItem };

export interface AdminBookingRefundApiItem {
  id: number;
  booking_group_id: number;
  booking_payment_id: number | null;
  kode_group: string | null;
  participant: AdminBookingParticipantApiItem | null;
  course_package: ScheduleCoursePackageApiItem | null;
  payment: {
    id: number;
    nominal_bayar: number;
    status: string;
    ada_bukti_bayar?: boolean;
    bukti_bayar_url?: string | null;
    tanggal_upload?: string | null;
    tanggal_verifikasi: string | null;
  } | null;
  nominal_refund: number;
  tipe_refund: string;
  status_refund: string;
  bank_tujuan: string;
  nomor_rekening: string;
  nama_penerima: string;
  alasan_refund: string | null;
  catatan_peserta: string | null;
  catatan_admin: string | null;
  tanggal_pengajuan: string | null;
  tanggal_diproses: string | null;
  tanggal_refund: string | null;
  requested_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
  processed_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at: string | null;
  updated_at: string | null;
}

export type AdminBookingRefundListData = PaginatedApiData<AdminBookingRefundApiItem>;

export interface AdminBookingRefundItemData {
  item: AdminBookingRefundApiItem;
}

export interface AdminBookingRefundListQuery {
  q?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
  page?: number;
}

export interface ProcessAdminBookingRefundPayload {
  catatan_admin?: string | null;
}

export interface CompleteAdminBookingRefundPayload {
  nominal_refund?: number | null;
  tipe_refund?: "Penuh" | "Sebagian" | null;
  catatan_admin?: string | null;
}

export interface RejectAdminBookingRefundPayload {
  catatan_admin: string;
}
