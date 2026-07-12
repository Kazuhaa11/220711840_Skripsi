import type { PaginatedApiData } from "@/types/api";

export type BookingPaymentMethod = "Transfer" | "Cash";


export interface CoursePackageApiItem {
  id: number;
  kode_paket: string;
  nama_paket: string;
  durasi_jam: number;
  deskripsi: string | null;
  harga_antar_jemput: number;
  harga_tidak_antar_jemput: number;
  harga_dengan_sim_antar_jemput: number;
  harga_dengan_sim_tidak_antar_jemput: number;
  termasuk_sertifikat: boolean;
  fasilitas: string[];
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CoursePackageListData {
  items: CoursePackageApiItem[];
}

export interface TimeSlotApiItem {
  id: number;
  kode_slot: string;
  nama_slot: string;
  subtitle: string | null;
  jam_mulai: string | null;
  jam_selesai: string | null;
  durasi_menit: number;
  durasi_label?: string | null;
  status?: string | null;
  hari_aktif?: string | null;
  catatan?: string | null;
}

export interface TimeSlotListData {
  items: TimeSlotApiItem[];
}

export interface InstructorApiItem {
  id: number;
  kode_instruktur: string;
  nama_instruktur: string | null;
  spesialisasi: string | null;
}

export interface VehicleApiItem {
  id: number;
  kode_kendaraan: string;
  nama_kendaraan: string;
  model: string | null;
  nomor_plat: string;
  transmisi: string;
}

export interface ScheduleCoursePackageApiItem {
  id: number;
  kode_paket: string;
  nama_paket: string;
  durasi_jam: number;
}

export interface AvailableScheduleApiItem {
  id: number;
  kode_jadwal: string;
  tanggal_latihan: string | null;
  time_slot: TimeSlotApiItem | null;
  instructor: InstructorApiItem | null;
  vehicle: VehicleApiItem | null;
  course_package: ScheduleCoursePackageApiItem | null;
  kapasitas: number;
  jumlah_booking: number;
  sisa_kapasitas: number;
  status: string;
  catatan: string | null;
}

export type AvailableScheduleListData = PaginatedApiData<AvailableScheduleApiItem>;

export interface BookingPaymentApiItem {
  id: number;
  nominal_bayar: number;
  metode_pembayaran?: BookingPaymentMethod | null;
  metode_pembayaran_label?: string | null;
  bukti_bayar: string | null;
  bukti_bayar_url: string | null;
  bukti_bayar_original_name: string | null;
  bukti_bayar_mime: string | null;
  bukti_bayar_size: number | null;
  ada_bukti_bayar: boolean;
  bukti_bayar_legacy: boolean;
  nama_pengirim: string | null;
  bank_pengirim: string | null;
  tanggal_upload: string | null;
  tanggal_verifikasi: string | null;
  status: string;
  catatan_peserta: string | null;
  catatan_admin: string | null;
  alasan_penolakan: string | null;
}

export interface BookingHistoryRecordApiItem {
  id: number;
  aksi: string;
  status_sebelum: string | null;
  status_sesudah: string | null;
  catatan: string | null;
  changed_by: {
    id: number;
    name: string;
    email: string;
  } | null;
  created_at: string | null;
}

export interface TrainingResultApiItem {
  id: number;
  tanggal_latihan?: string | null;
  status_kehadiran: string | null;
  nilai_praktik?: number | null;
  nilai_sikap?: number | null;
  nilai_pemahaman?: number | null;
  nilai_akhir: number | null;
  status_kelulusan: string | null;
  catatan_instruktur?: string | null;
  catatan_admin?: string | null;
  instructor?: InstructorApiItem | null;
}

export interface BookingApiItem {
  id: number;
  kode_booking: string;
  status: string;
  tanggal_booking: string | null;
  tanggal_dikonfirmasi: string | null;
  tanggal_dibatalkan: string | null;
  alasan_pembatalan: string | null;
  catatan: string | null;
  pakai_antar_jemput: boolean;
  pakai_sim: boolean;
  alamat_jemput: string | null;
  harga_paket: number;
  course_package: ScheduleCoursePackageApiItem | null;
  training_schedule: AvailableScheduleApiItem | null;
  payment: BookingPaymentApiItem | null;
  created_at: string | null;
  updated_at: string | null;
  histories?: BookingHistoryRecordApiItem[];
  status_label?: string;
  training_result?: TrainingResultApiItem | null;
}

export interface ParticipantBookingHistoryApiItem {
  id: number;
  kode_booking: string;
  status: string;
  status_label: string;
  tanggal_booking: string | null;
  tanggal_dikonfirmasi: string | null;
  tanggal_dibatalkan: string | null;
  tanggal_latihan: string | null;
  time_slot: (TimeSlotApiItem & { jam_label?: string | null }) | null;
  instructor: InstructorApiItem | null;
  vehicle: VehicleApiItem | null;
  course_package: ScheduleCoursePackageApiItem | null;
  harga_paket: number;
  pakai_antar_jemput: boolean;
  pakai_sim: boolean;
  payment: Pick<
    BookingPaymentApiItem,
    | "id"
    | "status"
    | "nominal_bayar"
    | "metode_pembayaran"
    | "metode_pembayaran_label"
    | "bukti_bayar_url"
    | "tanggal_upload"
    | "tanggal_verifikasi"
  > | null;
  training_result: TrainingResultApiItem | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BookingItemData {
  item: BookingApiItem;
}

export interface BookingPackagePreviewPayload {
  course_package_id: number;
  tanggal_mulai: string;
  time_slot_id: number;
  pakai_antar_jemput: boolean;
  pakai_sim: boolean;
}

export interface BookingPackagePreviewSessionData {
  sesi_ke: number;
  total_sesi: number;
  tanggal_latihan: string;
  target_tanggal_latihan: string;
  is_adjusted: boolean;
  adjustment_note: string | null;
  time_slot: TimeSlotApiItem;
  target_time_slot: TimeSlotApiItem;
  instructor: InstructorApiItem;
  vehicle: VehicleApiItem;
  existing_schedule_id: number | null;
  schedule_mode: string;
}

export interface BookingPackagePreviewData {
  course_package: ScheduleCoursePackageApiItem & { termasuk_sertifikat?: boolean };
  total_sesi: number;
  durasi_sesi_menit: number;
  harga_paket: number;
  pakai_antar_jemput: boolean;
  pakai_sim: boolean;
  instructor: InstructorApiItem;
  vehicle: VehicleApiItem;
  sessions: BookingPackagePreviewSessionData[];
}

export interface CreateParticipantPackageBookingPayload extends BookingPackagePreviewPayload {
  alamat_jemput?: string | null;
  catatan?: string | null;
  metode_pembayaran?: BookingPaymentMethod;
  sessions?: BookingPackageCustomSessionPayload[];
}

export interface BookingGroupCertificateApiItem {
  id: number;
  nomor_sertifikat: string;
  kode_verifikasi: string;
  status: string;
  tanggal_terbit: string | null;
}

export interface BookingRefundApiItem {
  id: number;
  booking_group_id: number;
  booking_payment_id: number | null;
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
  processed_by?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface BookingGroupPaymentApiItem {
  id: number;
  booking_id: number;
  booking_group_id: number;
  nominal_bayar: number;
  metode_pembayaran?: BookingPaymentMethod | null;
  metode_pembayaran_label?: string | null;
  status: string;
  ada_bukti_bayar: boolean;
  bukti_bayar_url?: string | null;
  nama_pengirim?: string | null;
  bank_pengirim?: string | null;
  tanggal_upload: string | null;
  tanggal_verifikasi: string | null;
  catatan_peserta?: string | null;
  catatan_admin?: string | null;
  alasan_penolakan?: string | null;
}

export interface BookingGroupSessionApiItem {
  id: number;
  kode_booking: string;
  sesi_ke: number;
  total_sesi: number;
  status: string;
  status_label?: string;
  tanggal_booking: string | null;
  can_change_or_cancel?: boolean;
  change_deadline_date?: string | null;
  change_window_message?: string | null;
  training_schedule: AvailableScheduleApiItem;
  training_result?: TrainingResultApiItem | null;
}

export interface BookingGroupApiItem {
  id: number;
  kode_group: string;
  status: string;
  status_label?: string;
  total_sesi: number;
  jumlah_sesi_selesai: number;
  progress_label: string;
  tanggal_booking: string | null;
  tanggal_dikonfirmasi: string | null;
  tanggal_dibatalkan: string | null;
  alasan_pembatalan: string | null;
  catatan: string | null;
  pakai_antar_jemput: boolean;
  pakai_sim: boolean;
  alamat_jemput: string | null;
  harga_paket: number;
  course_package: ScheduleCoursePackageApiItem | null;
  instructor: InstructorApiItem | null;
  vehicle: VehicleApiItem | null;
  payment: BookingGroupPaymentApiItem | null;
  refund?: BookingRefundApiItem | null;
  certificate?: BookingGroupCertificateApiItem | null;
  sessions: BookingGroupSessionApiItem[];
  created_at: string | null;
  updated_at: string | null;
}

export interface BookingGroupItemData {
  item: BookingGroupApiItem;
}

export type ParticipantBookingGroupListData = PaginatedApiData<BookingGroupApiItem>;

export interface BookingPackageCustomSessionPayload {
  sesi_ke: number;
  tanggal_latihan: string;
  time_slot_id: number;
  target_tanggal_latihan?: string | null;
  target_time_slot_id?: number | null;
}

export interface BookingPackageSessionPreviewPayload extends BookingPackageCustomSessionPayload {
  course_package_id: number;
  instructor_id: number;
  vehicle_id: number;
  total_sesi: number;
}

export interface BookingPackageSessionPreviewData {
  item: BookingPackagePreviewSessionData;
}

export interface BookingRescheduleRecommendationApiItem {
  tanggal_latihan: string;
  sesi_ke: number;
  total_sesi: number;
  recommended_label: string;
  existing_schedule_id: number | null;
  schedule_mode: string;
  time_slot: TimeSlotApiItem;
  instructor: InstructorApiItem;
  vehicle: VehicleApiItem;
}

export interface BookingRescheduleRecommendationListData {
  items: BookingRescheduleRecommendationApiItem[];
  fixed_resource?: {
    instructor_id: number | null;
    vehicle_id: number | null;
  };
}

export interface BookingRescheduleRecommendationPayload {
  tanggal_latihan: string;
  time_slot_id?: number | null;
  limit?: number;
}

export interface ChangeBookingSchedulePayload {
  training_schedule_id?: number | null;
  tanggal_latihan?: string | null;
  time_slot_id?: number | null;
  catatan?: string | null;
}

export interface CancelBookingPayload {
  alasan_pembatalan?: string | null;
  bank_tujuan?: string | null;
  nomor_rekening?: string | null;
  nama_penerima?: string | null;
  catatan_refund?: string | null;
}


export interface UploadPaymentProofPayload {
  nominal_bayar: number;
  metode_pembayaran?: BookingPaymentMethod | null;
  metode_pembayaran_label?: string | null;
  bukti_bayar: File;
  nama_pengirim?: string | null;
  bank_pengirim?: string | null;
  catatan_peserta?: string | null;
}

export interface ParticipantBookingListQuery {
  status?: string;
  per_page?: number;
  page?: number;
}

export interface ParticipantBookingHistoryQuery {
  q?: string;
  status?: string;
  payment_status?: string;
  tanggal?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  per_page?: number;
  page?: number;
}
