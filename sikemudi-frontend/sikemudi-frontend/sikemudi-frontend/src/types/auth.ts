export type RoleSlug = "admin" | "peserta" | "instruktur";

export interface AuthRole {
  id: number;
  nama_role: string;
  slug: RoleSlug;
}

export interface AuthActivePackage {
  id: number;
  kode_paket: string;
  nama_paket: string;
  durasi_jam: number;
}

export interface AuthParticipant {
  id: number;
  kode_peserta: string;
  tanggal_lahir: string | null;
  gender: "Laki-laki" | "Perempuan" | null;
  tanggal_bergabung: string | null;
  jumlah_sesi_selesai: number;
  jumlah_sesi_total: number;
  jumlah_absen: number;
  rating_rata_rata: string | number;
  status_sertifikat: string;
  paket_aktif: AuthActivePackage | null;
}

export interface AuthInstructor {
  id: number;
  kode_instruktur: string;
  jabatan: string | null;
  spesialisasi: string | null;
  status: string;
  status_jadwal: string;
  tanggal_bergabung: string | null;
  rating: string | number;
  total_sesi: number;
  tingkat_kelulusan: string | number;
}

export interface AuthUser {
  id: number;
  role: AuthRole | null;
  name: string;
  email: string;
  no_telepon: string | null;
  alamat: string | null;
  status_akun: string;
  foto_profil: string | null;
  foto_profil_path?: string | null;
  foto_profil_url?: string | null;
  foto_profil_original_name?: string | null;
  foto_profil_mime?: string | null;
  foto_profil_size?: number | null;
  last_login_at: string | null;
  participant: AuthParticipant | null;
  instructor: AuthInstructor | null;
}

export interface LoginPayload {
  email: string;
  password: string;
  device_name?: string;
}

export interface RegisterParticipantPayload {
  name: string;
  email: string;
  no_telepon: string;
  password: string;
  password_confirmation: string;
  alamat?: string | null;
  tanggal_lahir?: string | null;
  gender?: "Laki-laki" | "Perempuan" | null;
  device_name?: string;
}

export interface AuthTokenData {
  user: AuthUser;
  token: string;
  token_type?: string;
  token_expires_at?: string | null;
  token_expires_in_seconds?: number | null;
}

export interface AuthMeData {
  user: AuthUser;
}


export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}
