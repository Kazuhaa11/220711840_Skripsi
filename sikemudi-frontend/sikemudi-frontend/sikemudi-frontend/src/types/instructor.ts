import type { PaginatedApiData } from "@/types/api";

export interface InstructorTimeSlotApi {
  id: number;
  kode_slot?: string | null;
  nama_slot?: string | null;
  subtitle?: string | null;
  jam_mulai?: string | null;
  jam_selesai?: string | null;
  durasi_menit?: number | null;
}


export interface InstructorSlotAssignmentInstructorApi {
  id: number;
  kode_instruktur?: string | null;
  nama_instruktur?: string | null;
  email?: string | null;
  status?: string | null;
  status_jadwal?: string | null;
}

export interface InstructorSlotAssignmentApi {
  id: number;
  day_of_week: string;
  status?: string | null;
  catatan?: string | null;
  time_slot?: InstructorTimeSlotApi | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface InstructorSlotAssignmentMatrixCellApi {
  time_slot: InstructorTimeSlotApi;
  is_assigned: boolean;
  assignment?: InstructorSlotAssignmentApi | null;
}

export interface InstructorSlotAssignmentMatrixRowApi {
  day_of_week: string;
  slots: InstructorSlotAssignmentMatrixCellApi[];
}

export interface InstructorSlotAssignmentSummaryApi {
  active_assignment_count: number;
  active_slot_count: number;
}

export interface InstructorSlotAssignmentListData {
  instructor: InstructorSlotAssignmentInstructorApi | null;
  days: string[];
  time_slots: InstructorTimeSlotApi[];
  assignments: InstructorSlotAssignmentApi[];
  items: InstructorSlotAssignmentMatrixRowApi[];
  summary: InstructorSlotAssignmentSummaryApi;
}

export interface InstructorVehicleApi {
  id: number;
  kode_kendaraan?: string | null;
  nama_kendaraan?: string | null;
  model?: string | null;
  nomor_plat?: string | null;
  transmisi?: string | null;
}

export interface InstructorCoursePackageApi {
  id: number;
  kode_paket?: string | null;
  nama_paket?: string | null;
  durasi_jam?: number | null;
}

export interface InstructorParticipantApi {
  id: number;
  kode_peserta?: string | null;
  nama_peserta?: string | null;
  email?: string | null;
  no_telepon?: string | null;
  alamat?: string | null;
  status_sertifikat?: string | null;
}

export interface InstructorBookingPaymentApi {
  id: number;
  status?: string | null;
  tanggal_verifikasi?: string | null;
}

export interface InstructorBookingGroupApi {
  id: number;
  kode_group?: string | null;
  status?: string | null;
  total_sesi?: number | null;
  jumlah_sesi_selesai?: number | null;
  progress_label?: string | null;
}

export interface InstructorTeachingScheduleParticipantApi {
  booking_id: number;
  kode_booking?: string | null;
  booking_group_id?: number | null;
  sesi_ke?: number | null;
  total_sesi?: number | null;
  status_booking?: string | null;
  tanggal_booking?: string | null;
  booking_group?: InstructorBookingGroupApi | null;
  peserta?: InstructorParticipantApi | null;
  course_package?: InstructorCoursePackageApi | null;
  pakai_antar_jemput?: boolean | null;
  pakai_sim?: boolean | null;
  alamat_jemput?: string | null;
  payment?: InstructorBookingPaymentApi | null;
}

export interface InstructorTeachingScheduleApi {
  id: number;
  kode_jadwal?: string | null;
  tanggal_latihan?: string | null;
  time_slot?: InstructorTimeSlotApi | null;
  vehicle?: InstructorVehicleApi | null;
  course_package?: InstructorCoursePackageApi | null;
  kapasitas?: number | null;
  jumlah_booking?: number | null;
  jumlah_peserta_valid?: number | null;
  sisa_kapasitas?: number | null;
  status?: string | null;
  catatan?: string | null;
  peserta?: InstructorTeachingScheduleParticipantApi[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface InstructorTeachingScheduleDetailApi extends InstructorTeachingScheduleApi {
  peserta?: InstructorTeachingScheduleParticipantApi[];
}

export type InstructorTeachingScheduleListData = PaginatedApiData<InstructorTeachingScheduleApi>;

export interface InstructorTeachingScheduleDetailData {
  item: InstructorTeachingScheduleDetailApi;
}

export interface InstructorTeachingSchedulePackageSessionApi {
  booking_id: number;
  kode_booking?: string | null;
  status_booking?: string | null;
  tanggal_booking?: string | null;
  sesi_ke?: number | null;
  total_sesi?: number | null;
  training_schedule?: InstructorTeachingScheduleApi | null;
  training_result?: {
    id: number;
    status_kehadiran?: string | null;
    nilai_akhir?: number | null;
    status_kelulusan?: string | null;
    catatan_instruktur?: string | null;
  } | null;
}

export interface InstructorTeachingSchedulePackageDetailApi {
  id: number;
  kode_group?: string | null;
  status?: string | null;
  total_sesi?: number | null;
  jumlah_sesi_selesai?: number | null;
  progress_label?: string | null;
  participant?: InstructorParticipantApi | null;
  course_package?: InstructorCoursePackageApi | null;
  vehicle?: InstructorVehicleApi | null;
  payment?: InstructorBookingPaymentApi | null;
  sessions: InstructorTeachingSchedulePackageSessionApi[];
}

export interface InstructorTeachingSchedulePackageDetailData {
  item: InstructorTeachingSchedulePackageDetailApi;
}

export interface InstructorTeachingScheduleQuery {
  q?: string;
  status?: string;
  tanggal?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  page?: number;
  per_page?: number;
}

export interface InstructorTrainingResultCandidateApi {
  id: number;
  kode_booking?: string | null;
  status?: string | null;
  tanggal_booking?: string | null;
  booking_group_id?: number | null;
  sesi_ke?: number | null;
  total_sesi?: number | null;
  session_label?: string | null;
  is_final_session?: boolean | null;
  can_input_result?: boolean | null;
  input_unavailable_reason?: string | null;
  input_available_from?: string | null;
  input_available_until?: string | null;
  booking_group?: InstructorBookingGroupApi | null;
  peserta?: InstructorParticipantApi | null;
  course_package?: InstructorCoursePackageApi | null;
  training_schedule?: {
    id: number;
    kode_jadwal?: string | null;
    tanggal_latihan?: string | null;
    time_slot?: InstructorTimeSlotApi | null;
    vehicle?: InstructorVehicleApi | null;
  } | null;
  payment?: InstructorBookingPaymentApi | null;
}

export type InstructorTrainingResultCandidateListData = PaginatedApiData<InstructorTrainingResultCandidateApi>;

export interface InstructorTrainingResultApi {
  id: number;
  booking_id: number;
  booking_group_id?: number | null;
  sesi_ke?: number | null;
  total_sesi?: number | null;
  session_label?: string | null;
  is_final_session?: boolean | null;
  tanggal_latihan?: string | null;
  status_kehadiran?: string | null;
  nilai_praktik?: number | null;
  nilai_sikap?: number | null;
  nilai_pemahaman?: number | null;
  nilai_akhir?: number | null;
  status_kelulusan?: string | null;
  catatan_instruktur?: string | null;
  catatan_admin?: string | null;
  booking?: {
    id: number;
    kode_booking?: string | null;
    booking_group_id?: number | null;
    sesi_ke?: number | null;
    total_sesi?: number | null;
    status?: string | null;
    harga_paket?: number | null;
    pakai_antar_jemput?: boolean | null;
    pakai_sim?: boolean | null;
    course_package?: InstructorCoursePackageApi | null;
  } | null;
  peserta?: InstructorParticipantApi | null;
  training_schedule?: {
    id: number;
    kode_jadwal?: string | null;
    tanggal_latihan?: string | null;
    time_slot?: InstructorTimeSlotApi | null;
    vehicle?: InstructorVehicleApi | null;
  } | null;
  instructor?: {
    id: number;
    kode_instruktur?: string | null;
    nama_instruktur?: string | null;
  } | null;
  created_by?: {
    id: number;
    name?: string | null;
    email?: string | null;
  } | null;
  updated_by?: {
    id: number;
    name?: string | null;
    email?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type InstructorTrainingResultListData = PaginatedApiData<InstructorTrainingResultApi>;

export interface InstructorTrainingResultItemData {
  item: InstructorTrainingResultApi;
}

export interface InstructorTrainingResultQuery {
  q?: string;
  status_kehadiran?: string;
  status_kelulusan?: string;
  tanggal?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  page?: number;
  per_page?: number;
}

export interface InstructorTrainingResultCandidateQuery {
  q?: string;
  tanggal?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  page?: number;
  per_page?: number;
}

export interface SaveInstructorTrainingResultPayload {
  booking_id?: number;
  status_kehadiran: "Hadir" | "Tidak Hadir" | "Izin";
  nilai_praktik?: number | null;
  nilai_sikap?: number | null;
  nilai_pemahaman?: number | null;
  nilai_akhir?: number | null;
  status_kelulusan?: "Belum Dinilai" | "Lulus" | "Tidak Lulus";
  catatan_instruktur?: string | null;
}
