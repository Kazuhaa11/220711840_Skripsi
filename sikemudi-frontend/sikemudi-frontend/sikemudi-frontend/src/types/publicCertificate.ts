export interface PublicCertificateParticipantData {
  id: number | string;
  kode_peserta?: string | null;
  nama_peserta?: string | null;
}

export interface PublicCertificateCoursePackageData {
  id: number | string;
  kode_paket?: string | null;
  nama_paket?: string | null;
  durasi_jam?: number | null;
}

export interface PublicCertificateInstructorData {
  id: number | string;
  kode_instruktur?: string | null;
  nama_instruktur?: string | null;
}

export interface PublicCertificateTimeSlotData {
  id: number | string;
  nama_slot?: string | null;
  jam_mulai?: string | null;
  jam_selesai?: string | null;
}

export interface PublicCertificateVehicleData {
  id: number | string;
  nama_kendaraan?: string | null;
  nomor_plat?: string | null;
  transmisi?: string | null;
}

export interface PublicCertificateTrainingScheduleData {
  id: number | string;
  kode_jadwal?: string | null;
  tanggal_latihan?: string | null;
  time_slot?: PublicCertificateTimeSlotData | null;
  vehicle?: PublicCertificateVehicleData | null;
}

export interface PublicCertificateTrainingResultData {
  id: number | string;
  tanggal_latihan?: string | null;
  status_kehadiran?: string | null;
  nilai_akhir?: number | null;
  status_kelulusan?: string | null;
  instructor?: PublicCertificateInstructorData | null;
  training_schedule?: PublicCertificateTrainingScheduleData | null;
}

export interface PublicCertificateTemplateData {
  id: number | string;
  nama_template?: string | null;
  judul_sertifikat?: string | null;
  subjudul?: string | null;
  kalimat_pembuka?: string | null;
  kalimat_penutup?: string | null;
  nama_penyelenggara?: string | null;
  nama_penandatangan?: string | null;
  jabatan_penandatangan?: string | null;
  background_type?: string | null;
  background_color?: string | null;
  background_image?: string | null;
  border_color?: string | null;
}

export interface PublicCertificateData {
  id: number | string;
  nomor_sertifikat?: string | null;
  kode_verifikasi?: string | null;
  tanggal_terbit?: string | null;
  status?: string | null;
  verification_url?: string | null;
  peserta?: PublicCertificateParticipantData | null;
  course_package?: PublicCertificateCoursePackageData | null;
  training_result?: PublicCertificateTrainingResultData | null;
  template?: PublicCertificateTemplateData | null;
}

export interface PublicCertificateVerificationData {
  is_valid: boolean;
  status?: string | null;
  nomor_sertifikat?: string | null;
  kode_verifikasi?: string | null;
  certificate?: PublicCertificateData | null;
}

export interface PublicCertificateVerificationResult {
  success: boolean;
  message: string;
  data: PublicCertificateVerificationData;
  statusCode: number;
}
