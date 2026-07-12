import type {
  AdminTrainingResultApi,
  AdminTrainingResultPackageApi,
} from "@/types/adminTrainingResult";
import type {
  AdminTrainingAttendance,
  AdminTrainingGraduationStatus,
  AdminTrainingResult,
  AdminTrainingResultWorkflowStatus,
} from "@/features/admin/constants/trainingResults";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function fallback(value: unknown, fallbackValue = "-"): string {
  if (value === null || value === undefined || value === "") return fallbackValue;
  return String(value);
}

function formatDate(value?: string | null): string {
  if (!value) return "Tanggal belum tersedia";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatDateTime(value?: string | null): string | undefined {
  if (!value) return undefined;

  const date = new Date(value.replace(" ", "T"));

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}, ${hours}:${minutes}`;
}

function normalizeAttendance(value?: string | null): AdminTrainingAttendance {
  if (value === "Hadir" || value === "Tidak Hadir" || value === "Izin") {
    return value;
  }

  return "Belum Diisi";
}

function normalizeGraduation(value?: string | null): AdminTrainingGraduationStatus {
  if (value === "Lulus" || value === "Tidak Lulus") {
    return value;
  }

  if (value === "Belum Dinilai") {
    return "Menunggu";
  }

  return "Menunggu";
}

function buildWorkflowStatus(item: AdminTrainingResultApi): AdminTrainingResultWorkflowStatus {
  const attendance = normalizeAttendance(item.status_kehadiran);
  const graduationStatus = item.status_kelulusan ?? "Belum Dinilai";
  const validationStatus = item.validation_status ?? "";
  const certificateStatus = item.peserta?.status_sertifikat ?? "";

  if (certificateStatus.toLowerCase().includes("terbit") || validationStatus === "Sertifikat Terbit") {
    return "Sertifikat Terbit";
  }

  if (attendance === "Tidak Hadir") {
    return "Tidak Hadir";
  }

  if (graduationStatus === "Tidak Lulus") {
    return "Tidak Lulus";
  }

  if (item.can_issue_certificate || item.validated_at) {
    return "Siap Sertifikat";
  }

  if (item.can_validate_certificate) {
    return "Siap Validasi Sertifikat";
  }

  if (validationStatus === "Siap Validasi Sertifikat" || validationStatus === "Siap Sertifikat") {
    return validationStatus;
  }

  return "Dalam Proses";
}

function buildPackageWorkflowStatus(
  item: AdminTrainingResultPackageApi,
): AdminTrainingResultWorkflowStatus {
  const validationStatus = item.validation_status ?? "";
  const certificateStatus = item.participant?.status_sertifikat ?? "";
  const attendance = normalizeAttendance(item.status_kehadiran);
  const graduationStatus = item.status_kelulusan ?? "Belum Dinilai";

  if (certificateStatus.toLowerCase().includes("terbit") || validationStatus === "Sertifikat Terbit") {
    return "Sertifikat Terbit";
  }

  if (attendance === "Tidak Hadir") {
    return "Tidak Hadir";
  }

  if (graduationStatus === "Tidak Lulus") {
    return "Tidak Lulus";
  }

  if (item.can_issue_certificate || item.validated_at) {
    return "Siap Sertifikat";
  }

  if (item.can_validate_certificate) {
    return "Siap Validasi Sertifikat";
  }

  if (validationStatus === "Siap Validasi Sertifikat" || validationStatus === "Siap Sertifikat") {
    return validationStatus;
  }

  return "Dalam Proses";
}

function calculateMastery(item: AdminTrainingResultApi): number {
  const nilaiAkhir = item.nilai_akhir;

  if (typeof nilaiAkhir === "number") {
    return Math.max(0, Math.min(100, Math.round(nilaiAkhir)));
  }

  const values = [item.nilai_praktik, item.nilai_sikap, item.nilai_pemahaman].filter(
    (value): value is number => typeof value === "number",
  );

  if (values.length === 0) return 0;

  const average = values.reduce((total, value) => total + value, 0) / values.length;
  return Math.max(0, Math.min(100, Math.round(average)));
}

function buildEvaluation(item: AdminTrainingResultApi): string {
  const scores = [
    typeof item.nilai_praktik === "number" ? `Praktik ${item.nilai_praktik}` : null,
    typeof item.nilai_sikap === "number" ? `Sikap ${item.nilai_sikap}` : null,
    typeof item.nilai_pemahaman === "number" ? `Pemahaman ${item.nilai_pemahaman}` : null,
    typeof item.nilai_akhir === "number" ? `Nilai akhir ${item.nilai_akhir}` : null,
  ].filter(Boolean);

  return scores.length > 0 ? scores.join(" • ") : "Nilai belum tersedia.";
}

export function mapAdminTrainingResult(item: AdminTrainingResultApi): AdminTrainingResult {
  const timeSlot = item.training_schedule?.time_slot;
  const coursePackage = item.booking?.course_package ?? item.training_schedule?.course_package;
  const vehicle = item.training_schedule?.vehicle;
  const attendance = normalizeAttendance(item.status_kehadiran);
  const graduationStatus = normalizeGraduation(item.status_kelulusan);
  const sessionDateRaw = item.training_schedule?.tanggal_latihan ?? item.tanggal_latihan ?? "";
  const sessionTime = timeSlot?.jam_mulai && timeSlot?.jam_selesai
    ? `${timeSlot.jam_mulai} - ${timeSlot.jam_selesai}`
    : timeSlot?.nama_slot ?? "Jam belum tersedia";
  const bookingGroup = item.booking?.booking_group;
  const totalSessions = item.total_sesi ?? item.booking?.total_sesi ?? bookingGroup?.total_sesi ?? 1;
  const sessionNumber = item.sesi_ke ?? item.booking?.sesi_ke ?? 1;

  return {
    id: `#HL-${String(item.id).padStart(5, "0")}`,
    numericId: item.id,
    scheduleId: item.training_schedule?.kode_jadwal ?? `Jadwal #${item.training_schedule?.id ?? "-"}`,
    scheduleNumericId: item.training_schedule?.id ?? null,
    bookingId: item.booking_id ?? item.booking?.id ?? null,
    bookingCode: item.booking?.kode_booking ?? `Booking #${item.booking_id ?? "-"}`,
    participantId: item.peserta?.kode_peserta ?? `PST-${item.peserta?.id ?? "-"}`,
    participantNumericId: item.peserta?.id ?? null,
    participantName: fallback(item.peserta?.nama_peserta, "Peserta tidak diketahui"),
    participantType: fallback(item.peserta?.status_sertifikat, "Status sertifikat belum ada"),
    participantEmail: fallback(item.peserta?.email),
    participantPhone: fallback(item.peserta?.no_telepon),
    packageName: fallback(coursePackage?.nama_paket, "Paket belum tersedia"),
    sessionDate: formatDate(sessionDateRaw),
    sessionDateRaw,
    sessionTime,
    instructorId: item.instructor?.kode_instruktur ?? `INS-${item.instructor?.id ?? "-"}`,
    instructorNumericId: item.instructor?.id ?? null,
    instructorName: fallback(item.instructor?.nama_instruktur, "Instruktur tidak diketahui"),
    vehicleName: fallback(vehicle?.nama_kendaraan, "Kendaraan belum tersedia"),
    vehiclePlate: fallback(vehicle?.nomor_plat, "-"),
    attendance,
    evaluation: buildEvaluation(item),
    instructorNote: item.catatan_instruktur ?? "",
    adminNote: item.catatan_admin ?? "",
    graduationStatus,
    workflowStatus: buildWorkflowStatus(item),
    masteryPercent: calculateMastery(item),
    certificateIssued: (item.peserta?.status_sertifikat ?? "").toLowerCase().includes("terbit"),
    certificateStatus: fallback(item.peserta?.status_sertifikat, "Belum Ada"),
    createdAt: formatDateTime(item.created_at),
    updatedAt: formatDateTime(item.updated_at),
    verifiedAt: item.validated_at ? formatDateTime(item.validated_at) : undefined,
    nilaiPraktik: item.nilai_praktik ?? null,
    nilaiSikap: item.nilai_sikap ?? null,
    nilaiPemahaman: item.nilai_pemahaman ?? null,
    nilaiAkhir: item.nilai_akhir ?? null,
    bookingGroupId: item.booking_group_id ?? item.booking?.booking_group_id ?? bookingGroup?.id ?? null,
    packageNumericId: item.booking_group_id ?? item.booking?.booking_group_id ?? bookingGroup?.id ?? null,
    packageCode: bookingGroup?.kode_group ?? undefined,
    groupStatus: bookingGroup?.status ?? undefined,
    sessionNumber,
    totalSessions,
    sessionLabel: item.session_label ?? `Sesi ${sessionNumber}/${totalSessions}`,
    progressLabel: item.progress_label ?? bookingGroup?.progress_label ?? `${item.jumlah_sesi_selesai ?? bookingGroup?.jumlah_sesi_selesai ?? 0}/${totalSessions} sesi`,
    isFinalSession: Boolean(item.is_final_session ?? sessionNumber >= totalSessions),
    isPackageCompleted: Boolean(item.is_package_completed ?? ((item.jumlah_sesi_selesai ?? bookingGroup?.jumlah_sesi_selesai ?? 0) >= totalSessions)),
    canValidateCertificate: Boolean(item.can_validate_certificate),
    canIssueCertificate: Boolean(item.can_issue_certificate),
    validationStatus: item.validation_status ?? "Dalam Proses",
    validatedByName: item.validated_by?.name ?? undefined,
  };
}

export function mapAdminTrainingResultPackage(
  item: AdminTrainingResultPackageApi,
): AdminTrainingResult {
  const sessions = (item.sessions ?? []).map(mapAdminTrainingResult);
  const finalSession = item.final_result ? mapAdminTrainingResult(item.final_result) : sessions[sessions.length - 1];
  const sessionDateRaw = item.tanggal_mulai ?? finalSession?.sessionDateRaw ?? "";
  const graduationStatus = normalizeGraduation(item.status_kelulusan ?? item.final_result?.status_kelulusan);
  const attendance = normalizeAttendance(item.status_kehadiran ?? item.final_result?.status_kehadiran);
  const workflowStatus = buildPackageWorkflowStatus(item);
  const canValidateCertificate = Boolean(item.can_validate_certificate);
  const canIssueCertificate = Boolean(item.can_issue_certificate);
  const nilaiAkhir = item.nilai_akhir ?? item.final_result?.nilai_akhir ?? null;

  return {
    id: item.kode_group ?? `#BGP-${String(item.id).padStart(5, "0")}`,
    numericId: finalSession?.numericId ?? item.final_result?.id ?? 0,
    scheduleId: item.kode_group ?? `Booking Paket #${item.id}`,
    scheduleNumericId: finalSession?.scheduleNumericId ?? null,
    bookingId: finalSession?.bookingId ?? null,
    bookingCode: item.kode_group ?? `Booking Paket #${item.id}`,
    participantId: item.participant?.kode_peserta ?? `PST-${item.participant?.id ?? "-"}`,
    participantNumericId: item.participant?.id ?? null,
    participantName: fallback(item.participant?.nama_peserta, "Peserta tidak diketahui"),
    participantType: fallback(item.participant?.status_sertifikat, "Status sertifikat belum ada"),
    participantEmail: fallback(item.participant?.email),
    participantPhone: fallback(item.participant?.no_telepon),
    packageName: fallback(item.course_package?.nama_paket, "Paket belum tersedia"),
    sessionDate: item.tanggal_range ?? formatDate(sessionDateRaw),
    sessionDateRaw,
    sessionTime: `${item.total_sesi ?? sessions.length} sesi`,
    instructorId: item.instructor?.kode_instruktur ?? `INS-${item.instructor?.id ?? "-"}`,
    instructorNumericId: item.instructor?.id ?? null,
    instructorName: fallback(item.instructor?.nama_instruktur, "Instruktur tidak diketahui"),
    vehicleName: fallback(item.vehicle?.nama_kendaraan, "Kendaraan belum tersedia"),
    vehiclePlate: fallback(item.vehicle?.nomor_plat, "-"),
    attendance,
    evaluation: finalSession?.evaluation ?? "Detail nilai tersedia pada daftar sesi.",
    instructorNote: finalSession?.instructorNote ?? "",
    adminNote: finalSession?.adminNote ?? "",
    graduationStatus,
    workflowStatus,
    masteryPercent: typeof nilaiAkhir === "number" ? Math.round(nilaiAkhir) : finalSession?.masteryPercent ?? 0,
    certificateIssued: (item.participant?.status_sertifikat ?? "").toLowerCase().includes("terbit"),
    certificateStatus: fallback(item.participant?.status_sertifikat, "Belum Ada"),
    createdAt: formatDateTime(item.created_at),
    updatedAt: formatDateTime(item.updated_at),
    verifiedAt: formatDateTime(item.validated_at ?? undefined),
    bookingGroupId: item.booking_group_id ?? item.id,
    packageNumericId: item.booking_group_id ?? item.id,
    packageCode: item.kode_group ?? undefined,
    groupStatus: item.status ?? undefined,
    paymentStatus: item.payment_status ?? undefined,
    sessionNumber: item.total_sesi ?? sessions.length,
    totalSessions: item.total_sesi ?? sessions.length,
    sessionLabel: `Paket ${item.total_sesi ?? sessions.length} sesi`,
    progressLabel: item.progress_label ?? `${item.jumlah_sesi_selesai ?? 0}/${item.total_sesi ?? sessions.length} sesi`,
    isFinalSession: true,
    isPackageCompleted: Boolean(item.is_package_completed),
    canValidateCertificate,
    canIssueCertificate,
    validationStatus: item.validation_status ?? "Dalam Proses",
    validatedByName: finalSession?.validatedByName,
    sessions,
    nilaiPraktik: finalSession?.nilaiPraktik ?? null,
    nilaiSikap: finalSession?.nilaiSikap ?? null,
    nilaiPemahaman: finalSession?.nilaiPemahaman ?? null,
    nilaiAkhir,
  };
}

export function mapGraduationStatusToApi(
  status: AdminTrainingGraduationStatus,
): "Belum Dinilai" | "Lulus" | "Tidak Lulus" {
  if (status === "Lulus" || status === "Tidak Lulus") {
    return status;
  }

  return "Belum Dinilai";
}
