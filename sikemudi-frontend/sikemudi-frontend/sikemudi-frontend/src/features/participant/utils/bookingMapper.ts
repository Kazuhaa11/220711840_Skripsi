import { Bus, CarFront, ShieldCheck, Wrench, type LucideIcon } from "lucide-react";
import type { CoursePackageItem } from "@/features/participant/components/available-schedule/SelectPackageView";
import type { AvailableScheduleSlot, BookingHistoryItem, BookingHistoryStatus, SlotStatus } from "@/features/participant/constants/type";
import type { CompletedSessionItem, RescheduleSlotItem, ScheduleStatItem, UpcomingSessionItem } from "@/features/participant/constants/mySchedule";
import type { AvailableScheduleApiItem, BookingApiItem, BookingGroupApiItem, CoursePackageApiItem, ParticipantBookingHistoryApiItem } from "@/types/booking";

const dayFormatter = new Intl.DateTimeFormat("id-ID", { weekday: "long" });
const dayNumberFormatter = new Intl.DateTimeFormat("id-ID", { day: "2-digit" });
const monthYearFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});
const fullDateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function resolvePackageIcon(durationHours: number): LucideIcon {
  if (durationHours <= 6) return CarFront;
  if (durationHours <= 10) return Bus;
  if (durationHours <= 15) return Wrench;
  return ShieldCheck;
}

function resolvePackageSummary(item: CoursePackageApiItem): string {
  if (item.deskripsi) return item.deskripsi;

  return `Paket kursus ${item.durasi_jam} jam dengan instruktur profesional dan jadwal latihan terstruktur.`;
}

export function mapCoursePackageToCard(item: CoursePackageApiItem): CoursePackageItem {
  return {
    id: String(item.id),
    name: item.nama_paket,
    duration: `${item.durasi_jam} Jam Pelatihan`,
    durationHours: item.durasi_jam,
    summary: resolvePackageSummary(item),
    icon: resolvePackageIcon(item.durasi_jam),
    prices: {
      standard: formatCurrency(item.harga_tidak_antar_jemput),
      antarJemput: formatCurrency(item.harga_antar_jemput),
      denganSim: formatCurrency(item.harga_dengan_sim_tidak_antar_jemput),
      denganSimAntarJemput: formatCurrency(item.harga_dengan_sim_antar_jemput),
    },
    rawPrices: {
      standard: item.harga_tidak_antar_jemput,
      antarJemput: item.harga_antar_jemput,
      denganSim: item.harga_dengan_sim_tidak_antar_jemput,
      denganSimAntarJemput: item.harga_dengan_sim_antar_jemput,
    },
  };
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeDateLabel(dateValue: string | null): Pick<
  AvailableScheduleSlot,
  "dayLabel" | "dayNumber" | "monthYearLabel" | "dateLabel"
> {
  const date = parseDate(dateValue);

  if (!date || !dateValue) {
    return {
      dayLabel: "-",
      dayNumber: "-",
      monthYearLabel: "-",
      dateLabel: "Tanggal belum tersedia",
    };
  }

  return {
    dayLabel: dayFormatter.format(date).toUpperCase(),
    dayNumber: dayNumberFormatter.format(date),
    monthYearLabel: monthYearFormatter.format(date).toUpperCase(),
    dateLabel: fullDateFormatter.format(date),
  };
}

function resolveTimeCategory(startTime: string | null): AvailableScheduleSlot["timeCategory"] {
  const hour = Number((startTime ?? "").split(":")[0]);

  if (Number.isNaN(hour)) return "pagi";
  if (hour < 12) return "pagi";
  if (hour < 16) return "siang";
  return "sore";
}

function resolveSlotStatus(item: AvailableScheduleApiItem): SlotStatus {
  if (item.sisa_kapasitas <= 0 || item.status === "Penuh") return "PENUH";
  if (item.sisa_kapasitas <= 1) return "HAMPIR_PENUH";
  return "TERSEDIA";
}

export function mapAvailableScheduleToSlot(item: AvailableScheduleApiItem): AvailableScheduleSlot {
  const labels = normalizeDateLabel(item.tanggal_latihan);
  const startTime = item.time_slot?.jam_mulai ?? null;
  const endTime = item.time_slot?.jam_selesai ?? null;

  return {
    id: String(item.id),
    date: item.tanggal_latihan ?? "",
    ...labels,
    timeRange: startTime && endTime ? `${startTime} - ${endTime}` : "Jam belum tersedia",
    timeCategory: resolveTimeCategory(startTime),
    instructorName: item.instructor?.nama_instruktur ?? "Instruktur belum ditentukan",
    vehicleName: item.vehicle
      ? `${item.vehicle.nama_kendaraan} (${item.vehicle.transmisi})`
      : "Kendaraan belum ditentukan",
    remainingQuota: item.sisa_kapasitas,
    status: resolveSlotStatus(item),
  };
}

export function resolveSelectedPackagePrice(
  coursePackage: CoursePackageItem,
  pickup: boolean,
  withSim: boolean,
): { label: string; value: number } {
  if (pickup && withSim) {
    return {
      label: coursePackage.prices.denganSimAntarJemput,
      value: coursePackage.rawPrices.denganSimAntarJemput,
    };
  }

  if (pickup && !withSim) {
    return {
      label: coursePackage.prices.antarJemput,
      value: coursePackage.rawPrices.antarJemput,
    };
  }

  if (!pickup && withSim) {
    return {
      label: coursePackage.prices.denganSim,
      value: coursePackage.rawPrices.denganSim,
    };
  }

  return {
    label: coursePackage.prices.standard,
    value: coursePackage.rawPrices.standard,
  };
}


const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const monthKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
});

const monthLabelFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

function toDate(value?: string | null): Date | null {
  if (!value) return null;

  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(normalized);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDisplayDate(value?: string | null): string {
  const date = toDate(value);
  if (!date) return "Tanggal belum tersedia";
  return fullDateFormatter.format(date);
}

function formatShortDate(value?: string | null): string {
  const date = toDate(value);
  if (!date) return "Tanggal belum tersedia";
  return shortDateFormatter.format(date);
}

function formatMonthKey(value?: string | null): string {
  const date = toDate(value);
  if (!date) return "Tanpa Bulan";
  return monthKeyFormatter.format(date);
}

function formatMonthLabel(value?: string | null): string {
  const date = toDate(value);
  if (!date) return "TANPA BULAN";
  return monthLabelFormatter.format(date).toUpperCase();
}

function formatPrice(value?: number | null): string {
  return formatCurrency(value ?? 0);
}

function resolveBookingDate(booking: BookingApiItem): string | null {
  return booking.training_schedule?.tanggal_latihan ?? null;
}

function resolveBookingTime(booking: BookingApiItem): string {
  const start = booking.training_schedule?.time_slot?.jam_mulai;
  const end = booking.training_schedule?.time_slot?.jam_selesai;

  return start && end ? `${start} - ${end}` : "Jam belum tersedia";
}

function resolveHistoryTime(item: ParticipantBookingHistoryApiItem): string {
  if (item.time_slot?.jam_label) return item.time_slot.jam_label;

  const start = item.time_slot?.jam_mulai;
  const end = item.time_slot?.jam_selesai;
  return start && end ? `${start} - ${end}` : "Jam belum tersedia";
}

function resolveBookingInstructor(booking: BookingApiItem): string {
  return booking.training_schedule?.instructor?.nama_instruktur ?? "Instruktur belum ditentukan";
}

function resolveBookingVehicle(booking: BookingApiItem): string {
  const vehicle = booking.training_schedule?.vehicle;
  if (!vehicle) return "Kendaraan belum ditentukan";
  return `${vehicle.nama_kendaraan} (${vehicle.transmisi})`;
}

function resolveHistoryVehicle(item: ParticipantBookingHistoryApiItem): string {
  const vehicle = item.vehicle;
  if (!vehicle) return "Kendaraan belum ditentukan";
  return `${vehicle.nama_kendaraan} (${vehicle.transmisi})`;
}

function resolveStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    "Menunggu Pembayaran": "MENUNGGU PEMBAYARAN",
    "Menunggu Konfirmasi Pembayaran": "MENUNGGU KONFIRMASI",
    Dikonfirmasi: "TERKONFIRMASI",
    "Dijadwalkan Ulang": "DIJADWALKAN ULANG",
    Selesai: "SELESAI",
    Dibatalkan: "DIBATALKAN",
  };

  return statusMap[status] ?? status.toUpperCase();
}
function resolvePaymentMethod(payment?: { metode_pembayaran?: "Transfer" | "Cash" | null } | null): "Transfer" | "Cash" {
  return payment?.metode_pembayaran === "Cash" ? "Cash" : "Transfer";
}

function resolvePaymentMethodLabel(payment?: { metode_pembayaran?: "Transfer" | "Cash" | null; metode_pembayaran_label?: string | null } | null): string {
  return payment?.metode_pembayaran_label ?? (resolvePaymentMethod(payment) === "Cash" ? "Cash" : "Transfer Bank");
}


function mapBookingHistoryStatus(status: string): BookingHistoryStatus {
  if (status === "Selesai") return "SELESAI";
  if (status === "Dibatalkan") return "DIBATALKAN";
  if (status === "Dijadwalkan Ulang") return "RESCHEDULED";
  return "TERKONFIRMASI";
}

export function isActiveParticipantBooking(booking: BookingApiItem): boolean {
  return !["Selesai", "Dibatalkan"].includes(booking.status);
}

export function isCompletedParticipantBooking(booking: BookingApiItem): boolean {
  return booking.status === "Selesai";
}

export function mapBookingToUpcomingSession(
  booking: BookingApiItem,
  index: number,
): UpcomingSessionItem {
  const dateISO = resolveBookingDate(booking) ?? "";
  const canReschedule = [
    "Menunggu Konfirmasi Pembayaran",
    "Dikonfirmasi",
    "Dijadwalkan Ulang",
  ].includes(booking.status);
  const canCancel = !["Selesai", "Dibatalkan"].includes(booking.status);

  return {
    id: String(booking.id),
    bookingId: booking.id,
    scheduleId: booking.training_schedule?.id ?? null,
    coursePackageId: booking.course_package?.id ?? booking.training_schedule?.course_package?.id ?? null,
    status: resolveStatusLabel(booking.status),
    paymentStatus: booking.payment?.status ?? "Belum Upload",
    date: formatDisplayDate(dateISO),
    dateISO,
    time: resolveBookingTime(booking),
    instructor: resolveBookingInstructor(booking),
    vehicle: resolveBookingVehicle(booking),
    packageName: booking.course_package?.nama_paket ?? "Paket belum tersedia",
    pickupLabel: booking.pakai_antar_jemput ? "Antar Jemput" : "Tanpa Antar Jemput",
    simLabel: booking.pakai_sim ? "Dengan SIM" : "Tanpa SIM",
    priceLabel: formatPrice(booking.harga_paket),
    note: booking.catatan ?? "Tidak ada catatan tambahan.",
    canModify: canReschedule,
    canReschedule,
    canCancel,
    accent: index === 0 ? "blue" : "slate",
  };
}

export function mapBookingToCompletedSession(booking: BookingApiItem): CompletedSessionItem {
  return {
    id: String(booking.id),
    bookingId: booking.id,
    date: formatDisplayDate(resolveBookingDate(booking)),
    time: resolveBookingTime(booking),
    instructor: resolveBookingInstructor(booking),
    vehicle: resolveBookingVehicle(booking),
    packageName: booking.course_package?.nama_paket ?? "Paket belum tersedia",
    status: resolveStatusLabel(booking.status),
  };
}

export function mapAvailableScheduleToRescheduleSlot(
  item: AvailableScheduleApiItem,
): RescheduleSlotItem {
  const labels = normalizeDateLabel(item.tanggal_latihan);
  const startTime = item.time_slot?.jam_mulai ?? null;
  const endTime = item.time_slot?.jam_selesai ?? null;
  const time = startTime && endTime ? `${startTime} - ${endTime}` : "Jam belum tersedia";

  return {
    id: String(item.id),
    scheduleId: item.id,
    dayLabel: labels.monthYearLabel.split(" ")[0] ?? labels.dayLabel,
    dayNumber: labels.dayNumber,
    title: `${labels.dayLabel} • ${time}`,
    time,
    instructor: item.instructor?.nama_instruktur ?? "Instruktur belum ditentukan",
    vehicle: item.vehicle
      ? `${item.vehicle.nama_kendaraan} (${item.vehicle.transmisi})`
      : "Kendaraan belum ditentukan",
    quotaLabel: `Tersisa ${item.sisa_kapasitas} Kuota`,
    quotaVariant: item.sisa_kapasitas <= 1 ? "danger" : "success",
  };
}

export function buildMyScheduleStats(bookings: BookingApiItem[]): ScheduleStatItem[] {
  const activeCount = bookings.filter(isActiveParticipantBooking).length;
  const completedCount = bookings.filter((booking) => booking.status === "Selesai").length;
  const waitingCount = bookings.filter((booking) =>
    ["Menunggu Pembayaran", "Menunggu Konfirmasi Pembayaran"].includes(booking.status),
  ).length;
  const hasConfirmed = bookings.some((booking) =>
    ["Dikonfirmasi", "Dijadwalkan Ulang", "Selesai"].includes(booking.status),
  );

  return [
    {
      label: "JADWAL AKTIF",
      value: `${activeCount} Sesi`,
      accent: "blue",
    },
    {
      label: "SESI SELESAI",
      value: `${completedCount} Sesi`,
      accent: "green",
    },
    {
      label: "MENUNGGU KONFIRMASI",
      value: `${waitingCount} Sesi`,
      accent: "slate",
    },
    {
      label: "STATUS SERTIFIKAT",
      value: hasConfirmed ? "Dalam Proses" : "Belum Aktif",
      accent: "blue",
      highlighted: true,
    },
  ];
}

function resolveBookingGroupHistoryStatus(group: BookingGroupApiItem): BookingHistoryStatus {
  if (group.status === "Dibatalkan") return "DIBATALKAN";
  if (group.status === "Ditolak" || group.payment?.status === "Ditolak") return "DITOLAK";
  if (group.status === "Dijadwalkan Ulang") return "RESCHEDULED";
  return "SELESAI";
}

function resolveBookingGroupHistoryDate(group: BookingGroupApiItem): string {
  const status = resolveBookingGroupHistoryStatus(group);

  if (status === "DIBATALKAN") {
    return group.tanggal_dibatalkan ?? group.updated_at ?? group.tanggal_booking ?? "";
  }

  if (status === "DITOLAK") {
    return group.payment?.tanggal_verifikasi ?? group.updated_at ?? group.tanggal_booking ?? "";
  }

  return group.certificate?.tanggal_terbit ?? group.tanggal_dikonfirmasi ?? group.updated_at ?? group.tanggal_booking ?? "";
}

function resolveBookingGroupHistoryLabel(group: BookingGroupApiItem): string {
  const status = resolveBookingGroupHistoryStatus(group);

  if (status === "DIBATALKAN") return "DIBATALKAN";
  if (status === "DITOLAK") return "PEMBAYARAN DITOLAK";
  if (group.certificate) return "SERTIFIKAT TERBIT";
  return group.status_label ?? resolveStatusLabel(group.status);
}

function resolveBookingGroupHistoryNotes(group: BookingGroupApiItem): string {
  const status = resolveBookingGroupHistoryStatus(group);

  if (status === "DIBATALKAN") {
    return group.alasan_pembatalan
      ? `Booking paket dibatalkan. Alasan: ${group.alasan_pembatalan}`
      : "Booking paket dibatalkan.";
  }

  if (status === "DITOLAK") {
    return group.payment?.alasan_penolakan
      ? `Pembayaran ditolak. Alasan: ${group.payment.alasan_penolakan}`
      : "Pembayaran paket ditolak oleh admin.";
  }

  return group.certificate
    ? `Sertifikat ${group.certificate.nomor_sertifikat} telah terbit pada ${formatDisplayDate(group.certificate.tanggal_terbit)}.`
    : "Booking paket telah selesai.";
}

export function mapBookingGroupHistoryItem(group: BookingGroupApiItem): BookingHistoryItem {
  const dateISO = resolveBookingGroupHistoryDate(group);
  const progressLabel = group.progress_label || `${group.jumlah_sesi_selesai}/${group.total_sesi} sesi`;
  const status = resolveBookingGroupHistoryStatus(group);

  return {
    id: String(group.id),
    bookingId: group.id,
    code: group.kode_group,
    dateISO,
    monthKey: formatMonthKey(dateISO),
    monthLabel: formatMonthLabel(dateISO),
    dateLabel: formatShortDate(dateISO),
    timeRange: `Booking paket • ${progressLabel}`,
    instructorName: group.instructor?.nama_instruktur ?? "Instruktur belum ditentukan",
    vehicleName: group.vehicle
      ? `${group.vehicle.nama_kendaraan} (${group.vehicle.transmisi})`
      : "Kendaraan belum ditentukan",
    packageName: group.course_package?.nama_paket ?? "Paket belum tersedia",
    status,
    statusLabel: resolveBookingGroupHistoryLabel(group),
    paymentStatus: group.payment?.status ?? "Terkonfirmasi",
    paymentMethod: resolvePaymentMethod(group.payment),
    paymentMethodLabel: resolvePaymentMethodLabel(group.payment),
    priceLabel: formatPrice(group.harga_paket),
    pickupLabel: group.pakai_antar_jemput ? "Antar Jemput" : "Tanpa Antar Jemput",
    simLabel: group.pakai_sim ? "Dengan SIM" : "Tanpa SIM",
    notes: resolveBookingGroupHistoryNotes(group),
  };
}

export function mapBookingHistoryItem(item: ParticipantBookingHistoryApiItem): BookingHistoryItem {
  const dateISO = item.tanggal_latihan ?? item.tanggal_booking ?? "";
  const time = resolveHistoryTime(item);
  const status = mapBookingHistoryStatus(item.status);

  return {
    id: String(item.id),
    bookingId: item.id,
    code: item.kode_booking,
    dateISO,
    monthKey: formatMonthKey(dateISO),
    monthLabel: formatMonthLabel(dateISO),
    dateLabel: formatShortDate(dateISO),
    timeRange: `${formatDisplayDate(dateISO)} • ${time}`,
    instructorName: item.instructor?.nama_instruktur ?? "Instruktur belum ditentukan",
    vehicleName: resolveHistoryVehicle(item),
    packageName: item.course_package?.nama_paket ?? "Paket belum tersedia",
    status,
    statusLabel: item.status_label ?? resolveStatusLabel(item.status),
    paymentStatus: item.payment?.status ?? "Belum Upload",
    paymentMethod: resolvePaymentMethod(item.payment),
    paymentMethodLabel: resolvePaymentMethodLabel(item.payment),
    priceLabel: formatPrice(item.harga_paket),
    pickupLabel: item.pakai_antar_jemput ? "Antar Jemput" : "Tanpa Antar Jemput",
    simLabel: item.pakai_sim ? "Dengan SIM" : "Tanpa SIM",
    notes:
      item.training_result?.catatan_instruktur ??
      (status === "DIBATALKAN" ? "Booking dibatalkan." : "Data riwayat booking tercatat di sistem."),
  };
}

export function mapBookingDetailToHistoryItem(booking: BookingApiItem): BookingHistoryItem {
  const historyLike: ParticipantBookingHistoryApiItem = {
    id: booking.id,
    kode_booking: booking.kode_booking,
    status: booking.status,
    status_label: booking.status_label ?? resolveStatusLabel(booking.status),
    tanggal_booking: booking.tanggal_booking,
    tanggal_dikonfirmasi: booking.tanggal_dikonfirmasi,
    tanggal_dibatalkan: booking.tanggal_dibatalkan,
    tanggal_latihan: booking.training_schedule?.tanggal_latihan ?? null,
    time_slot: booking.training_schedule?.time_slot ?? null,
    instructor: booking.training_schedule?.instructor ?? null,
    vehicle: booking.training_schedule?.vehicle ?? null,
    course_package: booking.course_package,
    harga_paket: booking.harga_paket,
    pakai_antar_jemput: booking.pakai_antar_jemput,
    pakai_sim: booking.pakai_sim,
    payment: booking.payment,
    training_result: booking.training_result ?? null,
    created_at: booking.created_at,
    updated_at: booking.updated_at,
  };

  return mapBookingHistoryItem(historyLike);
}
