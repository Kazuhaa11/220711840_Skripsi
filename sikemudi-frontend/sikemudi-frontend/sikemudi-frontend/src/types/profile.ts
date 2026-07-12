import type { RoleSlug } from "@/types/auth";

export interface ProfileRole {
  id: number;
  nama_role: string;
  slug: RoleSlug;
}

export interface ProfileActivePackage {
  id: number;
  kode_paket: string;
  nama_paket: string;
  durasi_jam: number;
}

export interface ProfileUser {
  id: number;
  name: string;
  email: string;
  no_telepon: string | null;
  alamat: string | null;
  foto_profil: string | null;
  foto_profil_path: string | null;
  foto_profil_url: string | null;
  foto_profil_original_name: string | null;
  foto_profil_mime: string | null;
  foto_profil_size: number | null;
  status_akun: string;
  role: ProfileRole | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProfileParticipant {
  id: number;
  kode_peserta: string;
  tanggal_lahir: string | null;
  gender: "Laki-laki" | "Perempuan" | null;
  tanggal_bergabung: string | null;
  paket_aktif: ProfileActivePackage | null;
  jumlah_sesi_selesai: number;
  jumlah_sesi_total: number;
  jumlah_absen: number;
  rating_rata_rata: number;
  status_sertifikat: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface ProfileInstructor {
  id: number;
  kode_instruktur: string;
  jabatan: string | null;
  spesialisasi: string | null;
  status: string;
  status_jadwal: string;
  tanggal_bergabung: string | null;
  rating: number;
  total_sesi: number;
  tingkat_kelulusan: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserProfileItem {
  user: ProfileUser;
  peserta: ProfileParticipant | null;
  instruktur: ProfileInstructor | null;
}

export interface ProfileItemData {
  item: UserProfileItem;
}

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  no_telepon?: string;
  alamat?: string | null;
  current_password?: string | null;
  password?: string | null;
  password_confirmation?: string | null;
  tanggal_lahir?: string | null;
  gender?: "Laki-laki" | "Perempuan" | null;
  spesialisasi?: string | null;
}
