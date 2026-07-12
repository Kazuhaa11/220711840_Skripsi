export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api";

export const AUTH_ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  me: "/auth/me",
  logout: "/auth/logout",
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
} as const;

export const PUBLIC_ENDPOINTS = {
  packages: "/publik/paket-kursus",
  packageDetail: (id: string | number) => `/publik/paket-kursus/${id}`,
  verifyCertificate: (code: string) =>
    `/publik/sertifikat/verifikasi/${encodeURIComponent(code)}`,
} as const;

export const ADMIN_ENDPOINTS = {
  dashboard: "/admin/dashboard",
  profile: "/admin/profil",
  profilePhoto: "/admin/profil/foto",
  participants: "/admin/peserta",
  participantDetail: (id: string | number) => `/admin/peserta/${id}`,
  instructors: "/admin/instruktur",
  instructorDetail: (id: string | number) => `/admin/instruktur/${id}`,
  vehicles: "/admin/kendaraan",
  vehicleDetail: (id: string | number) => `/admin/kendaraan/${id}`,
  coursePackages: "/admin/paket-kursus",
  coursePackageDetail: (id: string | number) => `/admin/paket-kursus/${id}`,
  timeSlots: "/admin/slot-waktu",
  timeSlotDetail: (id: string | number) => `/admin/slot-waktu/${id}`,
  trainingSchedules: "/admin/jadwal-latihan",
  trainingScheduleDetail: (id: string | number) => `/admin/jadwal-latihan/${id}`,
  bookings: "/admin/booking-paket",
  bookingDetail: (id: string | number) => `/admin/booking-paket/${id}`,
  bookingPaymentProof: (id: string | number) => `/admin/booking-paket/${id}/bukti-bayar`,
  confirmBookingPayment: (id: string | number) =>
    `/admin/booking-paket/${id}/konfirmasi-pembayaran`,
  rejectBookingPayment: (id: string | number) =>
    `/admin/booking-paket/${id}/tolak-pembayaran`,
  cancelBookingPackage: (id: string | number) => `/admin/booking-paket/${id}/batal`,
  bookingRefunds: "/admin/refund-booking",
  bookingRefundDetail: (id: string | number) => `/admin/refund-booking/${id}`,
  processBookingRefund: (id: string | number) => `/admin/refund-booking/${id}/proses`,
  completeBookingRefund: (id: string | number) => `/admin/refund-booking/${id}/selesaikan`,
  rejectBookingRefund: (id: string | number) => `/admin/refund-booking/${id}/tolak`,
  changeBookingSchedule: (id: string | number) =>
    `/admin/booking/${id}/ubah-jadwal`,
  cancelBooking: (id: string | number) => `/admin/booking/${id}/batal`,
  trainingResults: "/admin/hasil-latihan",
  trainingResultDetail: (id: string | number) => `/admin/hasil-latihan/${id}`,
  validateTrainingResult: (id: string | number) =>
    `/admin/hasil-latihan/${id}/validasi-kelulusan`,
  certificateCandidates: "/admin/sertifikat/kandidat",
  certificates: "/admin/sertifikat",
  certificateDetail: (id: string | number) => `/admin/sertifikat/${id}`,
  issueCertificate: "/admin/sertifikat/terbitkan",
  generateCertificatePdf: (id: string | number) =>
    `/admin/sertifikat/${id}/generate-pdf`,
  downloadCertificate: (id: string | number) =>
    `/admin/sertifikat/${id}/download`,
  revokeCertificate: (id: string | number) => `/admin/sertifikat/${id}/cabut`,
  operationalReportSummary: "/admin/laporan-operasional/ringkasan",
  operationalReportFilterOptions: "/admin/laporan-operasional/filter-options",
  operationalReportRevenue: "/admin/laporan-operasional/pendapatan-kursus",
  operationalReportBookingPackages: "/admin/laporan-operasional/booking-paket",
  operationalReportVehicleUsage: "/admin/laporan-operasional/pemakaian-kendaraan",
  operationalReportInstructorSchedules: "/admin/laporan-operasional/jadwal-instruktur",
  operationalReportParticipantProgress: "/admin/laporan-operasional/progres-peserta",
  operationalReportTrainingOutcomes: "/admin/laporan-operasional/hasil-latihan",
  whatsAppNotificationLogs: "/admin/notifikasi-whatsapp/logs",
  whatsAppNotificationLogDetail: (id: string | number) => `/admin/notifikasi-whatsapp/logs/${id}`,
  retryWhatsAppNotificationLog: (id: string | number) => `/admin/notifikasi-whatsapp/logs/${id}/retry`,
} as const;

export const PARTICIPANT_ENDPOINTS = {
  dashboard: "/peserta/dashboard",
  profile: "/peserta/profil",
  profilePhoto: "/peserta/profil/foto",
  timeSlots: "/peserta/slot-waktu",
  previewPackageSchedule: "/peserta/booking/preview-jadwal-paket",
  previewPackageSession: "/peserta/booking/preview-sesi-paket",
  packageBooking: "/peserta/booking/paket",
  bookingGroups: "/peserta/booking-paket",
  bookingPackageHistory: "/peserta/riwayat-booking-paket",
  bookingDetail: (id: string | number) => `/peserta/booking/${id}`,
  recommendBookingSchedule: (id: string | number) => `/peserta/booking/${id}/rekomendasi-jadwal`,
  changeBookingSchedule: (id: string | number) => `/peserta/booking/${id}/ubah-jadwal`,
  cancelBooking: (id: string | number) => `/peserta/booking/${id}/batal`,
  cancelBookingPackage: (id: string | number) => `/peserta/booking-paket/${id}/batal`,
  uploadPaymentProof: (id: string | number) =>
    `/peserta/booking/${id}/upload-bukti-bayar`,
  certificates: "/peserta/sertifikat",
  certificateDetail: (id: string | number) => `/peserta/sertifikat/${id}`,
  downloadCertificate: (id: string | number) =>
    `/peserta/sertifikat/${id}/download`,
} as const;

export const INSTRUCTOR_ENDPOINTS = {
  dashboard: "/instruktur/dashboard",
  profile: "/instruktur/profil",
  profilePhoto: "/instruktur/profil/foto",
  slotAssignments: "/instruktur/slot-assignment",
  teachingSchedules: "/instruktur/jadwal-mengajar",
  teachingScheduleDetail: (id: string | number) => `/instruktur/jadwal-mengajar/${id}`,
  teachingSchedulePackageDetail: (id: string | number) => `/instruktur/jadwal-mengajar/paket/${id}`,
  trainingResultCandidates: "/instruktur/hasil-latihan/kandidat",
  trainingResults: "/instruktur/hasil-latihan",
  trainingResultDetail: (id: string | number) => `/instruktur/hasil-latihan/${id}`,
} as const;
