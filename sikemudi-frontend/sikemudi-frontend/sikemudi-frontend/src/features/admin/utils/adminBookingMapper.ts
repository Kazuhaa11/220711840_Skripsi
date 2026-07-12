import type {
  AdminBookingApiItem,
  AdminBookingDetailItem,
  AdminBookingRowItem,
  AdminBookingStatsItem,
  AdminReplacementScheduleItem,
} from "@/types/adminBooking";
import type { AvailableScheduleApiItem } from "@/types/booking";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const shortDateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatCurrency(value?: number | null): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;

  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return "Tanggal belum tersedia";
  return dateFormatter.format(date);
}

function formatDateTime(value?: string | null): string {
  const date = parseDate(value);
  if (!date) return "-";
  return shortDateTimeFormatter.format(date);
}

function resolveScheduleTime(schedule?: AvailableScheduleApiItem | null): string {
  const start = schedule?.time_slot?.jam_mulai;
  const end = schedule?.time_slot?.jam_selesai;

  if (start && end) return `${start} - ${end}`;
  return "Jam belum tersedia";
}

function resolveVehicleLabel(schedule?: AvailableScheduleApiItem | null): string {
  const vehicle = schedule?.vehicle;
  if (!vehicle) return "Kendaraan belum ditentukan";
  return `${vehicle.nama_kendaraan} (${vehicle.transmisi})`;
}

function resolveBookingStatusLabel(status: string, fallback?: string): string {
  const labels: Record<string, string> = {
    "Menunggu Pembayaran": "MENUNGGU PEMBAYARAN",
    "Menunggu Konfirmasi Pembayaran": "MENUNGGU KONFIRMASI",
    Dikonfirmasi: "TERKONFIRMASI",
    "Dijadwalkan Ulang": "DIJADWALKAN ULANG",
    Selesai: "SELESAI",
    Dibatalkan: "DIBATALKAN",
  };

  return fallback ?? labels[status] ?? status.toUpperCase();
}

export function getBookingStatusBadgeVariant(
  status: string,
): "default" | "success" | "warning" | "danger" | "info" {
  if (["Dikonfirmasi", "Dijadwalkan Ulang", "Selesai"].includes(status)) {
    return "success";
  }

  if (["Menunggu Pembayaran", "Menunggu Konfirmasi Pembayaran"].includes(status)) {
    return "warning";
  }

  if (status === "Dibatalkan") return "danger";
  return "default";
}

export function getPaymentStatusBadgeVariant(
  status?: string | null,
): "default" | "success" | "warning" | "danger" | "info" {
  if (status === "Terkonfirmasi") return "success";
  if (status === "Menunggu Konfirmasi") return "warning";
  if (status === "Ditolak") return "danger";
  if (status === "Belum Upload") return "default";
  return "info";
}


function resolvePaymentMethod(value?: string | null): "Transfer" | "Cash" {
  return value === "Cash" ? "Cash" : "Transfer";
}

function resolvePaymentMethodLabel(method: "Transfer" | "Cash", fallback?: string | null): string {
  if (fallback) return fallback;
  return method === "Cash" ? "Cash" : "Transfer Bank";
}

export function mapAdminBookingToRow(item: AdminBookingApiItem): AdminBookingRowItem {
  const paymentStatus = item.payment?.status ?? "Belum Upload";
  const paymentMethod = resolvePaymentMethod(item.payment?.metode_pembayaran);
  const paymentMethodLabel = resolvePaymentMethodLabel(
    paymentMethod,
    item.payment?.metode_pembayaran_label,
  );
  const firstSession = item.sessions?.[0];
  const firstSchedule = item.training_schedule ?? firstSession?.training_schedule ?? null;
  const totalSessions = item.total_sesi ?? item.sessions?.length ?? 1;

  return {
    id: String(item.id),
    numericId: item.id,
    code: item.kode_group ?? item.kode_booking,
    participantName: item.peserta?.nama_peserta ?? "Peserta belum tersedia",
    participantCode: item.peserta?.kode_peserta ?? "-",
    participantEmail: item.peserta?.email ?? "-",
    participantPhone: item.peserta?.no_telepon ?? "-",
    packageName: item.course_package?.nama_paket ?? "Paket belum tersedia",
    packageId: item.course_package?.id ?? firstSchedule?.course_package?.id ?? null,
    scheduleId: firstSchedule?.id ?? null,
    scheduleCode: firstSchedule?.kode_jadwal ?? "-",
    dateLabel: formatDate(firstSchedule?.tanggal_latihan),
    timeLabel: resolveScheduleTime(firstSchedule),
    instructorName:
      firstSchedule?.instructor?.nama_instruktur ?? "Instruktur belum ditentukan",
    vehicleName: resolveVehicleLabel(firstSchedule),
    priceLabel: formatCurrency(item.harga_paket),
    bookingStatus: item.status,
    bookingStatusLabel: resolveBookingStatusLabel(item.status, item.status_label),
    paymentStatus,
    paymentMethod,
    paymentMethodLabel,
    isCashPayment: paymentMethod === "Cash",
    hasPaymentProof: paymentMethod === "Transfer" && Boolean(item.payment?.ada_bukti_bayar),
    paymentProofName:
      paymentMethod === "Cash"
        ? "Pembayaran cash tidak membutuhkan bukti upload"
        : item.payment?.bukti_bayar_original_name ?? "Bukti bayar belum ada",
    paymentAmountLabel: formatCurrency(item.payment?.nominal_bayar ?? item.harga_paket),
    pickupLabel: item.pakai_antar_jemput ? "Antar Jemput" : "Tanpa Antar Jemput",
    simLabel: item.pakai_sim ? "Dengan SIM" : "Tanpa SIM",
    createdAtLabel: formatDateTime(item.created_at),
    isPackageBooking: Boolean(item.booking_group_id || item.kode_group || item.sessions?.length),
    progressLabel: item.progress_label ?? `${item.jumlah_sesi_selesai ?? 0}/${totalSessions} sesi`,
    totalSessions,
  };
}

export function mapAdminBookingToDetail(item: AdminBookingApiItem): AdminBookingDetailItem {
  const row = mapAdminBookingToRow(item);

  return {
    ...row,
    raw: item,
    note: item.catatan ?? "Tidak ada catatan booking.",
    pickupAddress: item.alamat_jemput ?? "Tidak menggunakan layanan antar jemput.",
    paymentSender: row.isCashPayment ? "Pembayaran cash" : item.payment?.nama_pengirim ?? "-",
    paymentBank: row.isCashPayment ? "Cash" : item.payment?.bank_pengirim ?? "-",
    paymentUploadedAt: formatDateTime(item.payment?.tanggal_upload),
    paymentVerifiedAt: formatDateTime(item.payment?.tanggal_verifikasi),
    paymentAdminNote: item.payment?.catatan_admin ?? "-",
    paymentParticipantNote: item.payment?.catatan_peserta ?? "-",
    paymentRejectionReason: item.payment?.alasan_penolakan ?? "-",
    cancellationReason: item.alasan_pembatalan ?? "-",
    confirmedAtLabel: formatDateTime(item.tanggal_dikonfirmasi),
    canceledAtLabel: formatDateTime(item.tanggal_dibatalkan),
    sessions:
      item.sessions?.map((session) => ({
        id: session.id,
        code: session.kode_booking,
        sessionLabel: `Sesi ${session.sesi_ke}/${session.total_sesi}`,
        dateLabel: formatDate(session.training_schedule?.tanggal_latihan),
        timeLabel: resolveScheduleTime(session.training_schedule),
        status: session.status,
        resultStatus: session.training_result?.status_kelulusan ?? "Belum Dinilai",
      })) ?? [],
    histories:
      item.histories?.map((history) => ({
        id: history.id,
        action: history.aksi,
        statusBefore: history.status_sebelum ?? "-",
        statusAfter: history.status_sesudah ?? "-",
        note: history.catatan ?? "-",
        changedBy: history.changed_by?.name ?? "Sistem",
        createdAt: formatDateTime(history.created_at),
      })) ?? [],
  };
}

export function buildAdminBookingStats(items: AdminBookingApiItem[]): AdminBookingStatsItem[] {
  const waitingPayment = items.filter((item) => item.status === "Menunggu Pembayaran").length;
  const waitingConfirmation = items.filter(
    (item) => item.status === "Menunggu Konfirmasi Pembayaran",
  ).length;
  const confirmed = items.filter((item) =>
    ["Dikonfirmasi", "Dijadwalkan Ulang"].includes(item.status),
  ).length;
  const canceled = items.filter((item) => item.status === "Dibatalkan").length;

  return [
    {
      label: "TOTAL BOOKING",
      value: String(items.length),
      helper: "Data pada halaman ini",
      accent: "blue",
    },
    {
      label: "MENUNGGU BAYAR",
      value: String(waitingPayment),
      helper: "Transfer belum upload / cash belum bayar",
      accent: "slate",
    },
    {
      label: "PERLU KONFIRMASI",
      value: String(waitingConfirmation),
      helper: "Bukti bayar masuk",
      accent: "amber",
    },
    {
      label: "BOOKING VALID",
      value: String(confirmed),
      helper: `${canceled} dibatalkan`,
      accent: "green",
    },
  ];
}

export function mapScheduleToAdminReplacementSlot(
  item: AvailableScheduleApiItem,
): AdminReplacementScheduleItem {
  const remainingQuota = Math.max(0, item.kapasitas - item.jumlah_booking);

  return {
    id: String(item.id),
    numericId: item.id,
    title: `${item.kode_jadwal} • ${formatDate(item.tanggal_latihan)}`,
    dateLabel: formatDate(item.tanggal_latihan),
    timeLabel: resolveScheduleTime(item),
    instructorName: item.instructor?.nama_instruktur ?? "Instruktur belum ditentukan",
    vehicleName: resolveVehicleLabel(item),
    quotaLabel: `Tersisa ${remainingQuota} dari ${item.kapasitas} kuota`,
    raw: item,
  };
}

export function isScheduleAvailableForReplacement(item: AvailableScheduleApiItem): boolean {
  return (
    item.status === "Tersedia" &&
    item.kapasitas > item.jumlah_booking &&
    Boolean(item.tanggal_latihan)
  );
}
