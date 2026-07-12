export type DashboardSummaryCardMap = Record<
  string,
  {
    label: string;
    value: string | number;
    unit?: string | null;
    description?: string | null;
    raw_value?: string | number | null;
  }
>;

export interface DashboardTimeSlot {
  id?: number;
  nama_slot?: string | null;
  jam_mulai?: string | null;
  jam_selesai?: string | null;
  label?: string | null;
  jam_label?: string | null;
}

export interface DashboardVehicle {
  id?: number | null;
  kode_kendaraan?: string | null;
  nama_kendaraan?: string | null;
  model?: string | null;
  nomor_plat?: string | null;
  transmisi?: string | null;
  label?: string | null;
}

export interface DashboardInstructor {
  id?: number | null;
  kode_instruktur?: string | null;
  nama_instruktur?: string | null;
  email?: string | null;
}

export interface DashboardParticipant {
  id?: number | null;
  kode_peserta?: string | null;
  nama_peserta?: string | null;
  email?: string | null;
  no_telepon?: string | null;
  inisial?: string | null;
}

export interface DashboardCoursePackage {
  id?: number | null;
  nama_paket?: string | null;
  durasi_jam?: number | null;
}

export interface AdminDashboardTodaySchedule {
  id: number;
  kode_jadwal: string;
  tanggal_latihan: string | null;
  waktu: DashboardTimeSlot | null;
  instruktur: DashboardInstructor | null;
  kendaraan: DashboardVehicle | null;
  paket: DashboardCoursePackage | null;
  peserta: number;
  kapasitas: number;
  sisa_kapasitas: number;
  status: string;
  status_label: string;
}

export interface AdminDashboardOperationalStatusItem {
  title: string;
  description: string;
  count?: number;
  total?: number;
  data?: unknown;
}

export interface AdminDashboardOperationalStatusMap {
  slot_hampir_penuh?: AdminDashboardOperationalStatusItem;
  kendaraan_sedang_digunakan?: AdminDashboardOperationalStatusItem;
  jadwal_perlu_perhatian?: AdminDashboardOperationalStatusItem;
  sertifikat_menunggu?: AdminDashboardOperationalStatusItem;
}

export interface AdminDashboardRecentBooking {
  id: number;
  kode_booking: string;
  status: string;
  status_label: string;
  tanggal_booking: string | null;
  updated_at: string | null;
  peserta: DashboardParticipant | null;
  paket: DashboardCoursePackage | null;
  jadwal: {
    id?: number;
    kode_jadwal?: string | null;
    tanggal_latihan?: string | null;
  } | null;
  payment: {
    id?: number;
    status?: string | null;
  } | null;
}

export interface AdminDashboardData {
  tanggal_hari_ini: string;
  tanggal_hari_ini_label: string;
  summary_cards: DashboardSummaryCardMap;
  jadwal_hari_ini: AdminDashboardTodaySchedule[];
  status_operasional: AdminDashboardOperationalStatusMap;
  aktivitas_booking_terbaru: AdminDashboardRecentBooking[];
}

export interface ParticipantDashboardProfile {
  id: number;
  kode_peserta: string;
  nama_peserta: string | null;
  email: string | null;
  no_telepon: string | null;
  alamat: string | null;
  foto_profil: string | null;
  status_akun: string | null;
  status_sertifikat: string | null;
  tanggal_bergabung: string | null;
  role: "peserta";
}

export interface ParticipantDashboardBookingCard {
  id: number;
  kode_booking: string;
  status: string;
  status_label: string;
  tanggal_booking?: string | null;
  tanggal_latihan?: string | null;
  tanggal_latihan_label?: string | null;
  time_slot: DashboardTimeSlot | null;
  instruktur: DashboardInstructor | null;
  kendaraan: DashboardVehicle | null;
  paket: DashboardCoursePackage | null;
  payment?: {
    id?: number;
    status?: string | null;
    nominal_bayar?: number | null;
  } | null;
}

export interface ParticipantDashboardCertificateCard {
  is_verified: boolean;
  title: string;
  status: string | null;
  progress: {
    percentage: number;
    label: string;
    step_label: string;
    completed: number;
    total: number;
  };
  certificate: {
    id: number;
    nomor_sertifikat: string;
    kode_verifikasi: string;
    tanggal_terbit: string | null;
    verification_url: string | null;
    pdf_url: string | null;
  } | null;
}

export interface ParticipantDashboardAvailableSchedule {
  id: number;
  kode_jadwal: string;
  tanggal_latihan: string | null;
  tanggal_latihan_label: string | null;
  slot: DashboardTimeSlot | null;
  instruktur: DashboardInstructor | null;
  kendaraan: DashboardVehicle | null;
  kapasitas: number;
  jumlah_booking: number;
  sisa_kapasitas: number;
  button_label: string;
}

export interface ParticipantDashboardBookingHistoryItem {
  id: number;
  kode_booking: string;
  tanggal: string | null;
  tanggal_label: string | null;
  sesi: string;
  instruktur: string;
  status: string;
  status_label: string;
  paket: DashboardCoursePackage | null;
}

export interface ParticipantDashboardAccountInfo {
  nama_lengkap: string | null;
  tipe_pelatihan: string | null;
  kontak: string | null;
  email: string | null;
  alamat: string | null;
  status_akun: string | null;
}

export interface ParticipantDashboardData {
  tanggal_hari_ini: string;
  tanggal_hari_ini_label: string;
  profile: ParticipantDashboardProfile;
  summary_cards: DashboardSummaryCardMap;
  jadwal_aktif_terdekat: ParticipantDashboardBookingCard | null;
  sertifikat_digital: ParticipantDashboardCertificateCard;
  jadwal_tersedia: {
    course_package_id: number | null;
    items: ParticipantDashboardAvailableSchedule[];
  };
  riwayat_booking_terbaru: ParticipantDashboardBookingHistoryItem[];
  informasi_akun: ParticipantDashboardAccountInfo;
}

export interface InstructorDashboardProfile {
  id: number;
  kode_instruktur: string;
  nama_instruktur: string | null;
  email: string | null;
  role: "instruktur";
  jabatan: string | null;
  spesialisasi: string | null;
  status: string | null;
  status_jadwal: string | null;
}

export interface InstructorDashboardTodaySchedule {
  id: number;
  kode_jadwal: string;
  tanggal_latihan: string | null;
  jam: DashboardTimeSlot | null;
  kendaraan: DashboardVehicle | null;
  paket: DashboardCoursePackage | null;
  peserta: number;
  kapasitas: number;
  status: string;
  status_label: string;
  aksi: {
    can_view_detail: boolean;
    can_open_session: boolean;
    can_input_result: boolean;
  };
}

export interface InstructorDashboardNextSession {
  id: number;
  kode_jadwal: string;
  tanggal_latihan: string | null;
  status: string;
  jam: DashboardTimeSlot | null;
  timezone_label: string;
  kendaraan: DashboardVehicle | null;
  lokasi_start: string;
  button_label: string;
}

export interface InstructorDashboardActiveParticipantItem {
  booking_id: number;
  kode_booking: string;
  status_booking: string;
  peserta: DashboardParticipant;
  paket: DashboardCoursePackage | null;
  sesi_label: string | null;
  sudah_input_hasil: boolean;
}

export interface InstructorDashboardActiveParticipants {
  schedule: {
    id: number;
    kode_jadwal: string;
    tanggal_latihan: string | null;
    jam_label: string | null;
  } | null;
  items: InstructorDashboardActiveParticipantItem[];
}

export interface InstructorDashboardReminder {
  type: "warning" | "info" | string;
  title: string;
  description: string;
  count: number;
  schedule_id?: number;
}

export interface InstructorDashboardData {
  tanggal_hari_ini: string;
  tanggal_hari_ini_label: string;
  profile: InstructorDashboardProfile;
  summary_cards: DashboardSummaryCardMap;
  jadwal_hari_ini: InstructorDashboardTodaySchedule[];
  sesi_berikutnya: InstructorDashboardNextSession | null;
  peserta_sesi_aktif: InstructorDashboardActiveParticipants;
  tugas_pengingat: InstructorDashboardReminder[];
}
