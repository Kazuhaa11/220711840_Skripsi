import { apiRequest } from "@/services/api";
import type { ApiQueryParams, PaginationMeta } from "@/types/api";

export interface PaginatedApiResponse<TItem> {
  items: TItem[];
  pagination: PaginationMeta | null;
}

export interface AdminCoursePackageApiItem {
  id: number;
  kode_paket: string | null;
  nama_paket: string;
  durasi_jam: number;
  deskripsi: string | null;
  harga_antar_jemput: number;
  harga_tidak_antar_jemput: number;
  harga_dengan_sim_antar_jemput: number;
  harga_dengan_sim_tidak_antar_jemput: number;
  termasuk_sertifikat: boolean;
  fasilitas: string[] | null;
  status: "Aktif" | "Nonaktif";
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminCoursePackagePayload {
  kode_paket?: string | null;
  nama_paket: string;
  durasi_jam: number;
  deskripsi?: string | null;
  harga_antar_jemput: number;
  harga_tidak_antar_jemput: number;
  harga_dengan_sim_antar_jemput: number;
  harga_dengan_sim_tidak_antar_jemput: number;
  termasuk_sertifikat: boolean;
  fasilitas: string[];
  status: "Aktif" | "Nonaktif";
}

export interface AdminTimeSlotApiItem {
  id: number;
  kode_slot: string | null;
  nama_slot: string;
  subtitle: string | null;
  jam_mulai: string;
  jam_selesai: string;
  durasi_menit: number;
  durasi_label?: string | null;
  status: "Aktif" | "Nonaktif";
  hari_aktif: string | null;
  catatan: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminTimeSlotPayload {
  kode_slot?: string | null;
  nama_slot: string;
  subtitle?: string | null;
  jam_mulai: string;
  jam_selesai: string;
  status: "Aktif" | "Nonaktif";
  hari_aktif?: string | null;
  catatan?: string | null;
}

export interface AdminVehicleApiItem {
  id: number;
  kode_kendaraan: string | null;
  nama_kendaraan: string;
  model: string | null;
  nomor_plat: string;
  transmisi: "Manual" | "Otomatis";
  status: "Aktif" | "Servis" | "Nonaktif";
  ketersediaan: "Tersedia" | "Maintenance" | "Sedang Latihan";
  digunakan_hari_ini: number;
  kilometer_servis_terakhir: number;
  status_asuransi: string | null;
  status_stnk: string | null;
  catatan: string | null;
  foto_kendaraan?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminVehiclePayload {
  kode_kendaraan?: string | null;
  nama_kendaraan: string;
  model?: string | null;
  nomor_plat: string;
  transmisi: "Manual" | "Otomatis";
  status: "Aktif" | "Servis" | "Nonaktif";
  ketersediaan: "Tersedia" | "Maintenance" | "Sedang Latihan";
  catatan?: string | null;
}

export interface AdminParticipantApiItem {
  id: number;
  kode_peserta: string | null;
  nama_peserta: string | null;
  email: string | null;
  no_telepon: string | null;
  alamat: string | null;
  status_akun: "Aktif" | "Verifikasi" | "Nonaktif" | null;
  tanggal_lahir: string | null;
  gender: "Laki-laki" | "Perempuan" | null;
  tanggal_bergabung: string | null;
  jumlah_sesi_selesai: number;
  jumlah_sesi_total: number;
  jumlah_absen: number;
  rating_rata_rata: number;
  status_sertifikat: "Terbit" | "Dalam Proses" | "Belum Ada";
  paket_aktif: {
    id: number;
    kode_paket: string | null;
    nama_paket: string;
    durasi_jam: number;
  } | null;
  user?: {
    id: number;
    name: string;
    email: string;
    no_telepon: string | null;
    alamat: string | null;
    status_akun: "Aktif" | "Verifikasi" | "Nonaktif";
    foto_profil?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminParticipantPayload {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  no_telepon: string;
  alamat?: string | null;
  status_akun: "Aktif" | "Verifikasi" | "Nonaktif";
  kode_peserta?: string | null;
  paket_aktif_id?: number | null;
  tanggal_lahir?: string | null;
  gender?: "Laki-laki" | "Perempuan" | null;
  tanggal_bergabung?: string | null;
  jumlah_sesi_selesai?: number;
  jumlah_sesi_total?: number;
  jumlah_absen?: number;
  rating_rata_rata?: number;
  status_sertifikat: "Terbit" | "Dalam Proses" | "Belum Ada";
}

export interface AdminInstructorApiItem {
  id: number;
  kode_instruktur: string | null;
  nama_instruktur: string | null;
  email: string | null;
  no_telepon: string | null;
  alamat: string | null;
  status_akun: "Aktif" | "Verifikasi" | "Nonaktif" | null;
  jabatan: string | null;
  spesialisasi: string | null;
  status: "Aktif" | "Nonaktif" | "Cuti";
  status_jadwal: "Mengajar" | "Terjadwal" | "Libur / Cuti";
  tanggal_bergabung: string | null;
  rating: number;
  total_sesi: number;
  tingkat_kelulusan: number;
  user?: {
    id: number;
    name: string;
    email: string;
    no_telepon: string | null;
    alamat: string | null;
    status_akun: "Aktif" | "Verifikasi" | "Nonaktif";
    foto_profil?: string | null;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminInstructorPayload {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  no_telepon: string;
  alamat?: string | null;
  status_akun?: "Aktif" | "Verifikasi" | "Nonaktif";
  kode_instruktur?: string | null;
  jabatan?: string | null;
  spesialisasi?: string | null;
  status: "Aktif" | "Nonaktif" | "Cuti";
  status_jadwal: "Mengajar" | "Terjadwal" | "Libur / Cuti";
  tanggal_bergabung?: string | null;
  rating?: number;
  total_sesi?: number;
  tingkat_kelulusan?: number;
}

export interface AdminInstructorSlotAssignmentInstructorApiItem {
  id: number;
  kode_instruktur: string | null;
  nama_instruktur: string | null;
  email: string | null;
  no_telepon: string | null;
  status: "Aktif" | "Nonaktif" | "Cuti" | string | null;
  status_jadwal: "Mengajar" | "Terjadwal" | "Libur / Cuti" | string | null;
}

export interface AdminInstructorSlotAssignmentTimeSlotApiItem {
  id: number;
  kode_slot: string | null;
  nama_slot: string;
  subtitle: string | null;
  jam_mulai: string;
  jam_selesai: string;
  durasi_menit: number;
  status: "Aktif" | "Nonaktif" | string;
  hari_aktif: string | null;
}

export interface AdminInstructorSlotAssignmentApiItem {
  id: number;
  day_of_week: string;
  status: "Aktif" | "Nonaktif";
  catatan: string | null;
  instructor: AdminInstructorSlotAssignmentInstructorApiItem | null;
  time_slot: AdminInstructorSlotAssignmentTimeSlotApiItem | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminInstructorSlotAssignmentMatrixSlotApiItem {
  time_slot: AdminInstructorSlotAssignmentTimeSlotApiItem;
  instructors: AdminInstructorSlotAssignmentInstructorApiItem[];
  assignment_count: number;
}

export interface AdminInstructorSlotAssignmentMatrixRowApiItem {
  day_of_week: string;
  slots: AdminInstructorSlotAssignmentMatrixSlotApiItem[];
}

export interface AdminInstructorSlotAssignmentMatrixApiResponse {
  days: string[];
  time_slots: AdminInstructorSlotAssignmentTimeSlotApiItem[];
  items: AdminInstructorSlotAssignmentMatrixRowApiItem[];
}

export interface AdminInstructorSlotAssignmentPayload {
  day_of_week: string;
  time_slot_id: number;
  instructor_id?: number | null;
  instructor_ids?: number[];
  status: "Aktif" | "Nonaktif";
  catatan?: string | null;
}

function getPagination(payload: { pagination?: PaginationMeta | null }) {
  return payload.pagination ?? null;
}

function ensureData<TData>(data: TData | undefined, fallbackMessage: string): TData {
  if (!data) {
    throw new Error(fallbackMessage);
  }

  return data;
}

function jsonBody<TPayload extends object>(payload: TPayload): Record<string, unknown> {
  return payload as unknown as Record<string, unknown>;
}

export async function getAdminCoursePackages(query?: ApiQueryParams) {
  const response = await apiRequest<PaginatedApiResponse<AdminCoursePackageApiItem>>(
    "/admin/paket-kursus",
    { query: { per_page: 100, ...query } },
  );
  const data = ensureData(response.data, "Response paket kursus tidak valid.");

  return {
    items: data.items ?? [],
    pagination: getPagination(data),
  };
}

export async function createAdminCoursePackage(payload: AdminCoursePackagePayload) {
  const response = await apiRequest<{ item: AdminCoursePackageApiItem }>(
    "/admin/paket-kursus",
    { method: "POST", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response tambah paket kursus tidak valid.").item;
}

export async function updateAdminCoursePackage(id: number | string, payload: AdminCoursePackagePayload) {
  const response = await apiRequest<{ item: AdminCoursePackageApiItem }>(
    `/admin/paket-kursus/${id}`,
    { method: "PUT", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response ubah paket kursus tidak valid.").item;
}

export async function deleteAdminCoursePackage(id: number | string) {
  await apiRequest(`/admin/paket-kursus/${id}`, { method: "DELETE" });
}

export async function activateAdminCoursePackage(id: number | string) {
  const response = await apiRequest<{ item: AdminCoursePackageApiItem }>(
    `/admin/paket-kursus/${id}/aktifkan`,
    { method: "PATCH" },
  );

  return ensureData(response.data, "Response aktifkan paket kursus tidak valid.").item;
}

export async function getAdminTimeSlots(query?: ApiQueryParams) {
  const response = await apiRequest<PaginatedApiResponse<AdminTimeSlotApiItem>>(
    "/admin/slot-waktu",
    { query: { per_page: 100, ...query } },
  );
  const data = ensureData(response.data, "Response slot waktu tidak valid.");

  return {
    items: data.items ?? [],
    pagination: getPagination(data),
  };
}

export async function createAdminTimeSlot(payload: AdminTimeSlotPayload) {
  const response = await apiRequest<{ item: AdminTimeSlotApiItem }>(
    "/admin/slot-waktu",
    { method: "POST", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response tambah slot waktu tidak valid.").item;
}

export async function updateAdminTimeSlot(id: number | string, payload: AdminTimeSlotPayload) {
  const response = await apiRequest<{ item: AdminTimeSlotApiItem }>(
    `/admin/slot-waktu/${id}`,
    { method: "PUT", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response ubah slot waktu tidak valid.").item;
}

export async function deleteAdminTimeSlot(id: number | string) {
  await apiRequest(`/admin/slot-waktu/${id}`, { method: "DELETE" });
}

export async function activateAdminTimeSlot(id: number | string) {
  const response = await apiRequest<{ item: AdminTimeSlotApiItem }>(
    `/admin/slot-waktu/${id}/aktifkan`,
    { method: "PATCH" },
  );

  return ensureData(response.data, "Response aktifkan slot waktu tidak valid.").item;
}

export async function getAdminVehicles(query?: ApiQueryParams) {
  const response = await apiRequest<PaginatedApiResponse<AdminVehicleApiItem>>(
    "/admin/kendaraan",
    { query: { per_page: 100, ...query } },
  );
  const data = ensureData(response.data, "Response kendaraan tidak valid.");

  return {
    items: data.items ?? [],
    pagination: getPagination(data),
  };
}

export async function createAdminVehicle(payload: AdminVehiclePayload) {
  const response = await apiRequest<{ item: AdminVehicleApiItem }>(
    "/admin/kendaraan",
    { method: "POST", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response tambah kendaraan tidak valid.").item;
}

export async function updateAdminVehicle(id: number | string, payload: AdminVehiclePayload) {
  const response = await apiRequest<{ item: AdminVehicleApiItem }>(
    `/admin/kendaraan/${id}`,
    { method: "PUT", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response ubah kendaraan tidak valid.").item;
}

export async function deleteAdminVehicle(id: number | string) {
  await apiRequest(`/admin/kendaraan/${id}`, { method: "DELETE" });
}

export async function activateAdminVehicle(id: number | string) {
  const response = await apiRequest<{ item: AdminVehicleApiItem }>(
    `/admin/kendaraan/${id}/aktifkan`,
    { method: "PATCH" },
  );

  return ensureData(response.data, "Response aktifkan kendaraan tidak valid.").item;
}

export async function getAdminParticipants(query?: ApiQueryParams) {
  const response = await apiRequest<PaginatedApiResponse<AdminParticipantApiItem>>(
    "/admin/peserta",
    { query: { per_page: 10, ...query } },
  );
  const data = ensureData(response.data, "Response peserta tidak valid.");

  return {
    items: data.items ?? [],
    pagination: getPagination(data),
  };
}

export async function createAdminParticipant(payload: AdminParticipantPayload) {
  const response = await apiRequest<{ item: AdminParticipantApiItem }>(
    "/admin/peserta",
    { method: "POST", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response tambah peserta tidak valid.").item;
}

export async function updateAdminParticipant(id: number | string, payload: AdminParticipantPayload) {
  const response = await apiRequest<{ item: AdminParticipantApiItem }>(
    `/admin/peserta/${id}`,
    { method: "PUT", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response ubah peserta tidak valid.").item;
}

export async function deleteAdminParticipant(id: number | string) {
  await apiRequest(`/admin/peserta/${id}`, { method: "DELETE" });
}

export async function activateAdminParticipant(id: number | string) {
  const response = await apiRequest<{ item: AdminParticipantApiItem }>(
    `/admin/peserta/${id}/aktifkan`,
    { method: "PATCH" },
  );

  return ensureData(response.data, "Response aktifkan peserta tidak valid.").item;
}

export async function getAdminInstructors(query?: ApiQueryParams) {
  const response = await apiRequest<PaginatedApiResponse<AdminInstructorApiItem>>(
    "/admin/instruktur",
    { query: { per_page: 10, ...query } },
  );
  const data = ensureData(response.data, "Response instruktur tidak valid.");

  return {
    items: data.items ?? [],
    pagination: getPagination(data),
  };
}

export async function createAdminInstructor(payload: AdminInstructorPayload) {
  const response = await apiRequest<{ item: AdminInstructorApiItem }>(
    "/admin/instruktur",
    { method: "POST", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response tambah instruktur tidak valid.").item;
}

export async function updateAdminInstructor(id: number | string, payload: AdminInstructorPayload) {
  const response = await apiRequest<{ item: AdminInstructorApiItem }>(
    `/admin/instruktur/${id}`,
    { method: "PUT", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response ubah instruktur tidak valid.").item;
}

export async function deleteAdminInstructor(id: number | string) {
  await apiRequest(`/admin/instruktur/${id}`, { method: "DELETE" });
}

export async function activateAdminInstructor(id: number | string) {
  const response = await apiRequest<{ item: AdminInstructorApiItem }>(
    `/admin/instruktur/${id}/aktifkan`,
    { method: "PATCH" },
  );

  return ensureData(response.data, "Response aktifkan instruktur tidak valid.").item;
}


export async function getAdminInstructorSlotAssignments(query?: ApiQueryParams) {
  const response = await apiRequest<PaginatedApiResponse<AdminInstructorSlotAssignmentApiItem>>(
    "/admin/instruktur-slot",
    { query: { per_page: 100, ...query } },
  );
  const data = ensureData(response.data, "Response assignment slot instruktur tidak valid.");

  return {
    items: data.items ?? [],
    pagination: getPagination(data),
  };
}

export async function getAdminInstructorSlotAssignmentMatrix() {
  const response = await apiRequest<AdminInstructorSlotAssignmentMatrixApiResponse>(
    "/admin/instruktur-slot/matriks",
  );

  return ensureData(response.data, "Response matriks assignment slot instruktur tidak valid.");
}

export async function createAdminInstructorSlotAssignment(payload: AdminInstructorSlotAssignmentPayload) {
  const response = await apiRequest<{ items: AdminInstructorSlotAssignmentApiItem[] }>(
    "/admin/instruktur-slot",
    { method: "POST", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response tambah assignment slot instruktur tidak valid.").items ?? [];
}

export async function deleteAdminInstructorSlotAssignment(id: number | string) {
  await apiRequest(`/admin/instruktur-slot/${id}`, { method: "DELETE" });
}


export interface AdminTrainingScheduleAvailableInstructorApiItem {
  id: number;
  kode_instruktur: string | null;
  nama_instruktur: string | null;
  email: string | null;
  no_telepon: string | null;
  status: string | null;
  status_jadwal: string | null;
}

export interface AdminTrainingScheduleAvailableInstructorsApiResponse {
  day_of_week: string;
  time_slot: AdminInstructorSlotAssignmentTimeSlotApiItem | null;
  items: AdminTrainingScheduleAvailableInstructorApiItem[];
  auto_select: boolean;
  selected_instructor_id: number | null;
}

export interface AdminTrainingScheduleApiItem {
  id: number;
  kode_jadwal: string | null;
  tanggal_latihan: string;
  time_slot: {
    id: number;
    kode_slot: string | null;
    nama_slot: string;
    jam_mulai: string;
    jam_selesai: string;
    durasi_menit: number;
  } | null;
  instructor: {
    id: number;
    kode_instruktur: string | null;
    nama_instruktur: string | null;
    email: string | null;
    no_telepon: string | null;
    status: string | null;
  } | null;
  vehicle: {
    id: number;
    kode_kendaraan: string | null;
    nama_kendaraan: string;
    model: string | null;
    nomor_plat: string;
    transmisi: string;
    status: string | null;
    ketersediaan: string | null;
  } | null;
  course_package: {
    id: number;
    kode_paket: string | null;
    nama_paket: string;
    durasi_jam: number;
  } | null;
  kapasitas: number;
  jumlah_booking: number;
  sisa_kapasitas: number;
  status: "Tersedia" | "Penuh" | "Berlangsung" | "Selesai" | "Dibatalkan";
  catatan: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminTrainingSchedulePayload {
  kode_jadwal?: string | null;
  tanggal_latihan: string;
  time_slot_id: number;
  instructor_id: number;
  vehicle_id: number;
  course_package_id?: number | null;
  kapasitas: number;
  status: "Tersedia" | "Penuh" | "Berlangsung" | "Selesai" | "Dibatalkan";
  catatan?: string | null;
}


export async function getAdminTrainingScheduleAvailableInstructors(query: {
  tanggal_latihan: string;
  time_slot_id: number | string;
  exclude_schedule_id?: number | string | null;
}) {
  const response = await apiRequest<AdminTrainingScheduleAvailableInstructorsApiResponse>(
    "/admin/jadwal-latihan/instruktur-tersedia",
    {
      query: {
        tanggal_latihan: query.tanggal_latihan,
        time_slot_id: query.time_slot_id,
        exclude_schedule_id: query.exclude_schedule_id ?? undefined,
      },
    },
  );

  return ensureData(response.data, "Response instruktur tersedia tidak valid.");
}

export async function getAdminTrainingSchedules(query?: ApiQueryParams) {
  const response = await apiRequest<PaginatedApiResponse<AdminTrainingScheduleApiItem>>(
    "/admin/jadwal-latihan",
    { query: { per_page: 10, ...query } },
  );
  const data = ensureData(response.data, "Response jadwal latihan tidak valid.");

  return {
    items: data.items ?? [],
    pagination: getPagination(data),
  };
}

export async function getAdminTrainingScheduleDetail(id: number | string) {
  const response = await apiRequest<{ item: AdminTrainingScheduleApiItem }>(
    `/admin/jadwal-latihan/${id}`,
  );

  return ensureData(response.data, "Response detail jadwal latihan tidak valid.").item;
}

export async function createAdminTrainingSchedule(payload: AdminTrainingSchedulePayload) {
  const response = await apiRequest<{ item: AdminTrainingScheduleApiItem }>(
    "/admin/jadwal-latihan",
    { method: "POST", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response tambah jadwal latihan tidak valid.").item;
}

export async function updateAdminTrainingSchedule(
  id: number | string,
  payload: AdminTrainingSchedulePayload,
) {
  const response = await apiRequest<{ item: AdminTrainingScheduleApiItem }>(
    `/admin/jadwal-latihan/${id}`,
    { method: "PUT", body: jsonBody(payload) },
  );

  return ensureData(response.data, "Response ubah jadwal latihan tidak valid.").item;
}

export async function deleteAdminTrainingSchedule(id: number | string) {
  await apiRequest(`/admin/jadwal-latihan/${id}`, { method: "DELETE" });
}
