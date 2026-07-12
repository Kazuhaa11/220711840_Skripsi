import type { PaginationMeta } from "@/types/api";

export type AdminCertificateStatusApi = "Draft" | "Terbit" | "Dicabut" | string;
export type AdminCertificateCandidateStatusApi = "Lulus" | string;
export type AdminCertificateTemplateStatusApi = "Aktif" | "Nonaktif" | string;
export type AdminCertificateTemplateBackgroundTypeApi = "Warna" | "Gambar" | string;

export interface AdminCertificateParticipantApi {
  id: number;
  kode_peserta?: string | null;
  nama_peserta?: string | null;
  email?: string | null;
  no_telepon?: string | null;
  alamat?: string | null;
  status_sertifikat?: string | null;
  jumlah_sesi_selesai?: number | null;
  jumlah_sesi_total?: number | null;
  progress_selesai?: boolean | null;
}

export interface AdminCertificateCoursePackageApi {
  id: number;
  kode_paket?: string | null;
  nama_paket?: string | null;
  durasi_jam?: number | null;
}

export interface AdminCertificateInstructorApi {
  id: number;
  kode_instruktur?: string | null;
  nama_instruktur?: string | null;
}

export interface AdminCertificateBookingApi {
  id: number;
  kode_booking?: string | null;
  status?: string | null;
  pakai_antar_jemput?: boolean | null;
  pakai_sim?: boolean | null;
  course_package?: AdminCertificateCoursePackageApi | null;
  booking_group?: {
    id: number;
    kode_group?: string | null;
    status?: string | null;
    total_sesi?: number | null;
    jumlah_sesi_selesai?: number | null;
    progress_label?: string | null;
  } | null;
}

export interface AdminCertificateTrainingScheduleApi {
  id: number;
  kode_jadwal?: string | null;
  tanggal_latihan?: string | null;
  time_slot?: {
    id: number;
    nama_slot?: string | null;
    jam_mulai?: string | null;
    jam_selesai?: string | null;
  } | null;
  vehicle?: {
    id: number;
    nama_kendaraan?: string | null;
    nomor_plat?: string | null;
    transmisi?: string | null;
  } | null;
}

export interface AdminCertificateCandidateApi {
  id: number;
  hasil_latihan_id?: number;
  booking_group_id?: number | null;
  sesi_ke?: number | null;
  total_sesi?: number | null;
  session_label?: string | null;
  progress_label?: string | null;
  is_final_session?: boolean | null;
  is_package_completed?: boolean | null;
  can_issue_certificate?: boolean | null;
  validation_status?: string | null;
  tanggal_latihan?: string | null;
  status_kehadiran?: string | null;
  nilai_akhir?: number | null;
  status_kelulusan?: AdminCertificateCandidateStatusApi;
  catatan_instruktur?: string | null;
  catatan_admin?: string | null;
  peserta?: AdminCertificateParticipantApi | null;
  booking?: AdminCertificateBookingApi | null;
  training_schedule?: AdminCertificateTrainingScheduleApi | null;
  instructor?: AdminCertificateInstructorApi | null;
}

export interface AdminCertificateTemplateApi {
  id: number;
  nama_template?: string | null;
  judul_sertifikat?: string | null;
  subjudul?: string | null;
  recipient_label?: string | null;
  program_prefix?: string | null;
  kalimat_pembuka?: string | null;
  kalimat_penutup?: string | null;
  nama_penyelenggara?: string | null;
  institution_address?: string | null;
  nama_penandatangan?: string | null;
  jabatan_penandatangan?: string | null;
  ttd_digital?: string | null;
  ttd_digital_path?: string | null;
  ttd_digital_url?: string | null;
  ttd_digital_original_name?: string | null;
  ttd_digital_mime?: string | null;
  ttd_digital_size?: number | null;
  background_type?: AdminCertificateTemplateBackgroundTypeApi | null;
  background_color?: string | null;
  background_image?: string | null;
  background_image_path?: string | null;
  background_image_url?: string | null;
  background_image_original_name?: string | null;
  background_image_mime?: string | null;
  background_image_size?: number | null;
  border_color?: string | null;
  accent_color?: string | null;
  is_default?: boolean | null;
  status?: AdminCertificateTemplateStatusApi | null;
  certificates_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminCertificateApi {
  id: number;
  nomor_sertifikat?: string | null;
  kode_verifikasi?: string | null;
  tanggal_terbit?: string | null;
  status?: AdminCertificateStatusApi;
  qr_code?: string | null;
  verification_url?: string | null;
  pdf_url?: string | null;
  pdf_path?: string | null;
  pdf_original_name?: string | null;
  pdf_mime?: string | null;
  pdf_size?: number | null;
  pdf_download_url?: string | null;
  catatan?: string | null;
  peserta?: AdminCertificateParticipantApi | null;
  course_package?: AdminCertificateCoursePackageApi | null;
  training_result?: {
    id: number;
    booking_group?: {
      id: number;
      kode_group?: string | null;
      status?: string | null;
      total_sesi?: number | null;
      jumlah_sesi_selesai?: number | null;
      progress_label?: string | null;
    } | null;
    sesi_ke?: number | null;
    total_sesi?: number | null;
    session_label?: string | null;
    progress_label?: string | null;
    tanggal_latihan?: string | null;
    nilai_akhir?: number | null;
    status_kelulusan?: string | null;
    instructor?: AdminCertificateInstructorApi | null;
  } | null;
  template?: AdminCertificateTemplateApi | null;
}

export interface AdminCertificateCandidateListData {
  items: AdminCertificateCandidateApi[];
  pagination?: PaginationMeta;
}

export interface AdminCertificateListData {
  items: AdminCertificateApi[];
  pagination?: PaginationMeta;
}

export interface AdminCertificateItemData {
  item: AdminCertificateApi;
}

export interface AdminCertificateTemplateListData {
  items: AdminCertificateTemplateApi[];
  pagination?: PaginationMeta;
}

export interface AdminCertificateTemplateItemData {
  item: AdminCertificateTemplateApi;
}

export interface AdminIssueCertificatePayload {
  hasil_latihan_id: number;
  template_id?: number | null;
  tanggal_terbit?: string;
  status?: "Draft" | "Terbit";
  catatan?: string;
}

export interface AdminRevokeCertificatePayload {
  catatan?: string | null;
}

export interface AdminCertificateTemplatePayload {
  nama_template: string;
  judul_sertifikat: string;
  subjudul?: string | null;
  recipient_label?: string | null;
  program_prefix?: string | null;
  kalimat_pembuka?: string | null;
  kalimat_penutup?: string | null;
  nama_penyelenggara?: string | null;
  institution_address?: string | null;
  nama_penandatangan?: string | null;
  jabatan_penandatangan?: string | null;
  background_type: "Warna" | "Gambar";
  background_color: string;
  border_color: string;
  accent_color: string;
  status: "Aktif" | "Nonaktif";
  is_default?: boolean;
  background_image_file?: File | null;
  ttd_digital_file?: File | null;
  remove_background_image?: boolean;
  remove_ttd_digital?: boolean;
}

export interface AdminCertificateQuery {
  q?: string;
  status?: string;
  per_page?: number;
  page?: number;
  all?: boolean;
}
