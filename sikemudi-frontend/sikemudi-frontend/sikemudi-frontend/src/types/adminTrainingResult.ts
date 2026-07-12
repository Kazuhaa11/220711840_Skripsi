import type { PaginatedApiData } from "@/types/api";

export interface AdminTrainingResultUserApi {
  id: number;
  name?: string | null;
  email?: string | null;
}

export interface AdminTrainingResultParticipantApi {
  id: number;
  kode_peserta?: string | null;
  nama_peserta?: string | null;
  email?: string | null;
  no_telepon?: string | null;
  alamat?: string | null;
  tanggal_lahir?: string | null;
  gender?: string | null;
  status_sertifikat?: string | null;
  jumlah_sesi_selesai?: number | null;
  jumlah_sesi_total?: number | null;
  jumlah_absen?: number | null;
}

export interface AdminTrainingResultInstructorApi {
  id: number;
  kode_instruktur?: string | null;
  nama_instruktur?: string | null;
  email?: string | null;
  no_telepon?: string | null;
}

export interface AdminTrainingResultCoursePackageApi {
  id: number;
  kode_paket?: string | null;
  nama_paket?: string | null;
  durasi_jam?: number | null;
}

export interface AdminTrainingResultTimeSlotApi {
  id: number;
  nama_slot?: string | null;
  jam_mulai?: string | null;
  jam_selesai?: string | null;
  durasi_menit?: number | null;
}

export interface AdminTrainingResultVehicleApi {
  id: number;
  kode_kendaraan?: string | null;
  nama_kendaraan?: string | null;
  nomor_plat?: string | null;
  transmisi?: string | null;
}

export interface AdminTrainingResultBookingGroupApi {
  id: number;
  kode_group?: string | null;
  status?: string | null;
  total_sesi?: number | null;
  jumlah_sesi_selesai?: number | null;
  progress_label?: string | null;
}

export interface AdminTrainingResultBookingApi {
  id: number;
  kode_booking?: string | null;
  status?: string | null;
  harga_paket?: number | null;
  pakai_antar_jemput?: boolean | null;
  pakai_sim?: boolean | null;
  alamat_jemput?: string | null;
  course_package?: AdminTrainingResultCoursePackageApi | null;
  booking_group_id?: number | null;
  sesi_ke?: number | null;
  total_sesi?: number | null;
  booking_group?: AdminTrainingResultBookingGroupApi | null;
}

export interface AdminTrainingScheduleResultApi {
  id: number;
  kode_jadwal?: string | null;
  tanggal_latihan?: string | null;
  status?: string | null;
  time_slot?: AdminTrainingResultTimeSlotApi | null;
  vehicle?: AdminTrainingResultVehicleApi | null;
  course_package?: AdminTrainingResultCoursePackageApi | null;
}

export interface AdminTrainingResultApi {
  id: number;
  booking_id?: number | null;
  booking_group_id?: number | null;
  sesi_ke?: number | null;
  total_sesi?: number | null;
  session_label?: string | null;
  is_final_session?: boolean | null;
  jumlah_sesi_selesai?: number | null;
  progress_label?: string | null;
  is_package_completed?: boolean | null;
  can_validate_certificate?: boolean | null;
  can_issue_certificate?: boolean | null;
  validation_status?: string | null;
  validated_at?: string | null;
  tanggal_latihan?: string | null;
  status_kehadiran?: string | null;
  nilai_praktik?: number | null;
  nilai_sikap?: number | null;
  nilai_pemahaman?: number | null;
  nilai_akhir?: number | null;
  status_kelulusan?: string | null;
  catatan_instruktur?: string | null;
  catatan_admin?: string | null;
  booking?: AdminTrainingResultBookingApi | null;
  peserta?: AdminTrainingResultParticipantApi | null;
  training_schedule?: AdminTrainingScheduleResultApi | null;
  instructor?: AdminTrainingResultInstructorApi | null;
  created_by?: AdminTrainingResultUserApi | null;
  updated_by?: AdminTrainingResultUserApi | null;
  validated_by?: AdminTrainingResultUserApi | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminTrainingResultPackageApi {
  id: number;
  booking_group_id?: number | null;
  kode_group?: string | null;
  status?: string | null;
  total_sesi?: number | null;
  jumlah_sesi_selesai?: number | null;
  progress_label?: string | null;
  tanggal_booking?: string | null;
  tanggal_dikonfirmasi?: string | null;
  tanggal_dibatalkan?: string | null;
  tanggal_mulai?: string | null;
  tanggal_selesai?: string | null;
  tanggal_range?: string | null;
  payment_status?: string | null;
  status_kehadiran?: string | null;
  status_kelulusan?: string | null;
  nilai_akhir?: number | null;
  can_validate_certificate?: boolean | null;
  can_issue_certificate?: boolean | null;
  validation_status?: string | null;
  is_package_completed?: boolean | null;
  validated_at?: string | null;
  participant?: AdminTrainingResultParticipantApi | null;
  course_package?: AdminTrainingResultCoursePackageApi | null;
  instructor?: AdminTrainingResultInstructorApi | null;
  vehicle?: AdminTrainingResultVehicleApi | null;
  final_result?: AdminTrainingResultApi | null;
  sessions?: AdminTrainingResultApi[] | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type AdminTrainingResultListData = PaginatedApiData<AdminTrainingResultApi>;

export type AdminTrainingResultPackageListData = PaginatedApiData<AdminTrainingResultPackageApi>;

export interface AdminTrainingResultItemData {
  item: AdminTrainingResultApi;
}

export interface AdminTrainingResultQuery {
  q?: string;
  status_kehadiran?: string;
  status_kelulusan?: string;
  participant_id?: string | number;
  instructor_id?: string | number;
  training_schedule_id?: string | number;
  tanggal?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  page?: number;
  per_page?: number;
}

export interface ValidateAdminTrainingResultPayload {
  status_kelulusan?: "Lulus" | null;
  catatan_admin?: string | null;
}
