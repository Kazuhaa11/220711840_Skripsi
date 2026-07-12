export interface CertificateParticipantResponse {
  id: number;
  kode_peserta?: string | null;
  nama_peserta?: string | null;
  email?: string | null;
  no_telepon?: string | null;
}

export interface CertificateCoursePackageResponse {
  id: number;
  kode_paket?: string | null;
  nama_paket?: string | null;
  durasi_jam?: number | null;
}

export interface CertificateInstructorResponse {
  id: number;
  kode_instruktur?: string | null;
  nama_instruktur?: string | null;
}

export interface CertificateTimeSlotResponse {
  id: number;
  nama_slot?: string | null;
  jam_mulai?: string | null;
  jam_selesai?: string | null;
}

export interface CertificateVehicleResponse {
  id: number;
  nama_kendaraan?: string | null;
  nomor_plat?: string | null;
  transmisi?: string | null;
}

export interface CertificateTrainingScheduleResponse {
  id: number;
  kode_jadwal?: string | null;
  tanggal_latihan?: string | null;
  time_slot?: CertificateTimeSlotResponse | null;
  vehicle?: CertificateVehicleResponse | null;
}

export interface CertificateTrainingResultResponse {
  id: number;
  tanggal_latihan?: string | null;
  status_kehadiran?: string | null;
  nilai_praktik?: number | null;
  nilai_sikap?: number | null;
  nilai_pemahaman?: number | null;
  nilai_akhir?: number | null;
  status_kelulusan?: string | null;
  catatan_instruktur?: string | null;
  catatan_admin?: string | null;
  instructor?: CertificateInstructorResponse | null;
  training_schedule?: CertificateTrainingScheduleResponse | null;
}

export interface CertificateTemplateResponse {
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
  background_type?: string | null;
  background_color?: string | null;
  border_color?: string | null;
  accent_color?: string | null;
  background_image?: string | null;
  background_image_url?: string | null;
  background_image_original_name?: string | null;
  ttd_digital?: string | null;
  ttd_digital_url?: string | null;
  ttd_digital_original_name?: string | null;
  status?: string | null;
  is_default?: boolean | null;
  certificates_count?: number | null;
}

export interface CertificateResponseItem {
  id: number;
  nomor_sertifikat: string;
  kode_verifikasi: string;
  tanggal_terbit?: string | null;
  status: string;
  qr_code?: string | null;
  qr_code_path?: string | null;
  qr_code_url?: string | null;
  qr_code_mime?: string | null;
  qr_code_size?: number | null;
  verification_url?: string | null;
  pdf_url?: string | null;
  pdf_path?: string | null;
  pdf_original_name?: string | null;
  pdf_mime?: string | null;
  pdf_size?: number | null;
  pdf_download_url?: string | null;
  catatan?: string | null;
  peserta?: CertificateParticipantResponse | null;
  course_package?: CertificateCoursePackageResponse | null;
  training_result?: CertificateTrainingResultResponse | null;
  template?: CertificateTemplateResponse | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ParticipantCertificateListData {
  items: CertificateResponseItem[];
}

export interface ParticipantCertificateItemData {
  item: CertificateResponseItem;
}
