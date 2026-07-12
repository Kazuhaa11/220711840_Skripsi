import type { PaginationMeta } from "@/types/api";
import type {
  InstructorTeachingScheduleApi,
  InstructorTeachingScheduleDetailApi,
  InstructorTeachingScheduleParticipantApi,
  InstructorTrainingResultApi,
  InstructorTrainingResultCandidateApi,
} from "@/types/instructor";
import type {
  TeachingScheduleAction,
  TeachingScheduleItem,
  TeachingScheduleParticipant,
  TeachingScheduleStat,
  TeachingScheduleStatus,
  UpcomingAgendaItem,
} from "@/features/instructor/constants/teachingSchedule";
import type {
  TrainingResultItem,
  TrainingResultParticipant,
  TrainingResultStat,
  TrainingResultStatus,
} from "@/features/instructor/constants/trainingResult";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardEdit,
  Clock3,
} from "lucide-react";

const dayFormatter = new Intl.DateTimeFormat("id-ID", { weekday: "long" });
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function parseDate(value?: string | null): Date | null {
  if (!value) return null;

  const normalized = value.includes("T") ? value : `${value}T00:00:00`;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDate(value?: string | null): string {
  const date = parseDate(value);
  return date ? dateFormatter.format(date) : value || "Tanggal belum tersedia";
}

function formatDay(value?: string | null): string {
  const date = parseDate(value);
  return date ? dayFormatter.format(date) : "-";
}

function getDateKey(value?: string | null): string {
  const date = parseDate(value);
  return date ? date.toISOString().slice(0, 10) : value || "";
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTimeRange(timeSlot?: { jam_mulai?: string | null; jam_selesai?: string | null } | null) {
  const start = timeSlot?.jam_mulai ?? "--:--";
  const end = timeSlot?.jam_selesai ?? "--:--";
  return `${start} - ${end}`;
}

function getDurationLabel(timeSlot?: { durasi_menit?: number | null } | null) {
  const minutes = Number(timeSlot?.durasi_menit ?? 0);
  if (!minutes) return "Durasi mengikuti slot";
  if (minutes % 60 === 0) return `${minutes / 60} Jam`;
  return `${minutes} Menit`;
}

function getInitials(name?: string | null): string {
  const value = name?.trim() || "Peserta";
  return (
    value
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("") || "P"
  );
}

function mapScheduleStatus(schedule: InstructorTeachingScheduleApi): TeachingScheduleStatus {
  const normalized = (schedule.status ?? "").toLowerCase();
  const dateKey = getDateKey(schedule.tanggal_latihan);
  const todayKey = getTodayKey();

  if (normalized === "selesai") return "SELESAI";
  if (normalized === "berlangsung") return "BERLANGSUNG";
  if (dateKey && dateKey < todayKey) return "MENUNGGU INPUT";
  return "AKAN DATANG";
}

function mapScheduleAction(status: TeachingScheduleStatus): TeachingScheduleAction {
  if (status === "BERLANGSUNG") return "BUKA SESI";
  if (status === "MENUNGGU INPUT") return "INPUT HASIL";
  return "LIHAT DETAIL";
}

function mapTeachingParticipant(
  item: InstructorTeachingScheduleParticipantApi,
  index: number,
): TeachingScheduleParticipant {
  const participantName = item.peserta?.nama_peserta ?? "Peserta";
  const packageName = item.course_package?.nama_paket ?? "Paket belum tersedia";

  return {
    id: String(item.booking_id),
    bookingId: item.booking_id,
    bookingGroupId: item.booking_group_id ?? item.booking_group?.id ?? null,
    name: participantName,
    initials: getInitials(participantName),
    packageName,
    sessionLabel: `Booking ${item.kode_booking ?? item.booking_id}`,
    attendanceStatus: item.status_booking === "Selesai" ? "HADIR" : "BELUM ABSEN",
    avatarTone: index % 3 === 0 ? "blue" : index % 3 === 1 ? "slate" : "green",
    email: item.peserta?.email ?? "-",
    phone: item.peserta?.no_telepon ?? "-",
    bookingCode: item.kode_booking ?? `BK-${item.booking_id}`,
    paymentStatus: item.payment?.status ?? "-",
    statusBooking: item.status_booking ?? null,
    sesiKe: item.sesi_ke ?? null,
    totalSesi: item.total_sesi ?? null,
  };
}

export function mapTeachingScheduleToItem(
  schedule: InstructorTeachingScheduleApi | InstructorTeachingScheduleDetailApi,
): TeachingScheduleItem {
  const status = mapScheduleStatus(schedule);
  const participantList = "peserta" in schedule && Array.isArray(schedule.peserta)
    ? schedule.peserta
    : [];
  const participants = participantList.map(mapTeachingParticipant);
  const firstParticipant = participants[0];
  const vehicleName = schedule.vehicle?.nama_kendaraan ?? "Kendaraan belum tersedia";
  const vehiclePlate = schedule.vehicle?.nomor_plat ?? "-";

  return {
    id: String(schedule.id),
    numericId: Number(schedule.id),
    date: formatDate(schedule.tanggal_latihan),
    rawDate: schedule.tanggal_latihan ?? "",
    day: formatDay(schedule.tanggal_latihan),
    time: getTimeRange(schedule.time_slot),
    duration: getDurationLabel(schedule.time_slot),
    vehicleName,
    vehiclePlate,
    transmission: schedule.vehicle?.transmisi ?? "-",
    participantName:
      firstParticipant?.name ?? `${schedule.jumlah_peserta_valid ?? schedule.jumlah_booking ?? 0} peserta valid`,
    participantInitial: firstParticipant?.initials ?? "PS",
    participantSession:
      firstParticipant?.sessionLabel ?? `${schedule.jumlah_peserta_valid ?? schedule.jumlah_booking ?? 0} booking`,
    avatarTone: firstParticipant?.avatarTone ?? "blue",
    status,
    action: mapScheduleAction(status),
    detail: {
      sessionCode: schedule.kode_jadwal ?? `Jadwal-${schedule.id}`,
      updatedAt: schedule.updated_at ? `Diperbarui ${schedule.updated_at}` : "Data terbaru dari backend",
      focus: schedule.catatan || `Latihan ${schedule.course_package?.nama_paket ?? "kursus mengemudi"}`,
      participants,
    },
  };
}

export function buildTeachingScheduleStats(
  schedules: InstructorTeachingScheduleApi[],
): TeachingScheduleStat[] {
  const todayKey = getTodayKey();
  const todayCount = schedules.filter((schedule) => getDateKey(schedule.tanggal_latihan) === todayKey).length;
  const activeCount = schedules.filter((schedule) => mapScheduleStatus(schedule) === "BERLANGSUNG").length;
  const waitingInputCount = schedules.filter((schedule) => mapScheduleStatus(schedule) === "MENUNGGU INPUT").length;

  return [
    {
      id: "today",
      label: "Jadwal Hari Ini",
      value: String(todayCount),
      suffix: "Sesi",
      tone: "blue",
    },
    {
      id: "loaded",
      label: "Data Dimuat",
      value: String(schedules.length),
      suffix: "Sesi",
      tone: "navy",
    },
    {
      id: "active",
      label: "Sesi Berlangsung",
      value: String(activeCount),
      suffix: "Aktif",
      tone: "green",
    },
    {
      id: "pending",
      label: "Belum Input Hasil",
      value: String(waitingInputCount),
      suffix: "Perlu Tindakan",
      tone: "red",
    },
  ];
}

export function buildUpcomingAgendaItems(schedules: InstructorTeachingScheduleApi[]): UpcomingAgendaItem[] {
  return schedules
    .filter((schedule) => {
      const dateKey = getDateKey(schedule.tanggal_latihan);
      return dateKey >= getTodayKey();
    })
    .slice(0, 3)
    .map((schedule, index) => ({
      id: String(schedule.id),
      label: `${formatDay(schedule.tanggal_latihan)} • ${formatDate(schedule.tanggal_latihan)}`,
      participantName: schedule.course_package?.nama_paket ?? "Sesi latihan",
      time: getTimeRange(schedule.time_slot),
      duration: getDurationLabel(schedule.time_slot),
      vehicle: `${schedule.vehicle?.nama_kendaraan ?? "Kendaraan"} (${schedule.vehicle?.nomor_plat ?? "-"})`,
      participantInitials: [String(schedule.jumlah_peserta_valid ?? schedule.jumlah_booking ?? 0)],
      icon: index === 0 ? CalendarDays : index === 1 ? Clock3 : CheckCircle2,
      active: index === 0,
    }));
}


function getFirstScheduleParticipant(schedule: InstructorTeachingScheduleApi): InstructorTeachingScheduleParticipantApi | null {
  return Array.isArray(schedule.peserta) && schedule.peserta.length > 0
    ? schedule.peserta[0]
    : null;
}

function getScheduleGroupKey(schedule: InstructorTeachingScheduleApi): string {
  const participant = getFirstScheduleParticipant(schedule);
  const groupId = participant?.booking_group_id ?? participant?.booking_group?.id;

  return groupId ? `group-${groupId}` : `schedule-${schedule.id}`;
}

function compareSchedulesByDateAndSlot(a: InstructorTeachingScheduleApi, b: InstructorTeachingScheduleApi) {
  const dateA = getDateKey(a.tanggal_latihan);
  const dateB = getDateKey(b.tanggal_latihan);

  if (dateA !== dateB) return dateA.localeCompare(dateB);

  const slotA = a.time_slot?.jam_mulai ?? "";
  const slotB = b.time_slot?.jam_mulai ?? "";

  if (slotA !== slotB) return slotA.localeCompare(slotB);

  return Number(a.id) - Number(b.id);
}

function pickMainScheduleForGroup(schedules: InstructorTeachingScheduleApi[]) {
  const todayKey = getTodayKey();
  const sorted = [...schedules].sort(compareSchedulesByDateAndSlot);

  return sorted.find((schedule) => getDateKey(schedule.tanggal_latihan) >= todayKey) ?? sorted[0];
}

function resolveGroupStatus(schedules: InstructorTeachingScheduleApi[]): TeachingScheduleStatus {
  const sorted = [...schedules].sort(compareSchedulesByDateAndSlot);
  const todayKey = getTodayKey();
  const allBookings = sorted.flatMap((schedule) => schedule.peserta ?? []);

  if (allBookings.length > 0 && allBookings.every((booking) => booking.status_booking === "Selesai")) {
    return "SELESAI";
  }

  if (sorted.some((schedule) => getDateKey(schedule.tanggal_latihan) === todayKey)) {
    return "BERLANGSUNG";
  }

  if (sorted.some((schedule) => getDateKey(schedule.tanggal_latihan) < todayKey)) {
    return "MENUNGGU INPUT";
  }

  return "AKAN DATANG";
}

export function buildTeachingScheduleGroupItems(
  schedules: InstructorTeachingScheduleApi[],
): TeachingScheduleItem[] {
  const grouped = new Map<string, InstructorTeachingScheduleApi[]>();

  schedules.forEach((schedule) => {
    const participant = getFirstScheduleParticipant(schedule);

    if (!participant?.booking_group_id && !participant?.booking_group?.id) return;

    const key = getScheduleGroupKey(schedule);
    grouped.set(key, [...(grouped.get(key) ?? []), schedule]);
  });

  return Array.from(grouped.values())
    .map((groupSchedules) => {
      const sortedSchedules = [...groupSchedules].sort(compareSchedulesByDateAndSlot);
      const mainSchedule = pickMainScheduleForGroup(sortedSchedules);
      const firstParticipantApi = sortedSchedules
        .map((schedule) => getFirstScheduleParticipant(schedule))
        .find(Boolean);
      const participants = firstParticipantApi
        ? [mapTeachingParticipant(firstParticipantApi, 0)]
        : [];
      const firstParticipant = participants[0];
      const group = firstParticipantApi?.booking_group;
      const groupId = firstParticipantApi?.booking_group_id ?? group?.id ?? null;
      const totalSesi = group?.total_sesi ?? firstParticipantApi?.total_sesi ?? sortedSchedules.length;
      const completedSessions = group?.jumlah_sesi_selesai
        ?? sortedSchedules.filter((schedule) => {
          const scheduleParticipant = getFirstScheduleParticipant(schedule);
          return scheduleParticipant?.status_booking === "Selesai";
        }).length;
      const status = resolveGroupStatus(sortedSchedules);
      const vehicleName = mainSchedule?.vehicle?.nama_kendaraan ?? "Kendaraan belum tersedia";
      const vehiclePlate = mainSchedule?.vehicle?.nomor_plat ?? "-";
      const packageName = firstParticipantApi?.course_package?.nama_paket
        ?? mainSchedule?.course_package?.nama_paket
        ?? "Paket kursus";

      return {
        id: groupId ? `group-${groupId}` : `schedule-${mainSchedule?.id ?? sortedSchedules[0]?.id}`,
        numericId: groupId ?? Number(mainSchedule?.id ?? sortedSchedules[0]?.id ?? 0),
        bookingGroupId: groupId,
        groupCode: group?.kode_group ?? null,
        date: formatDate(mainSchedule?.tanggal_latihan),
        rawDate: mainSchedule?.tanggal_latihan ?? "",
        day: formatDay(mainSchedule?.tanggal_latihan),
        time: getTimeRange(mainSchedule?.time_slot),
        duration: getDurationLabel(mainSchedule?.time_slot),
        vehicleName,
        vehiclePlate,
        transmission: mainSchedule?.vehicle?.transmisi ?? "-",
        participantName: firstParticipant?.name ?? "Peserta belum tersedia",
        participantInitial: firstParticipant?.initials ?? "PS",
        participantSession: `${completedSessions}/${totalSesi} sesi selesai`,
        avatarTone: firstParticipant?.avatarTone ?? "blue",
        status,
        action: "LIHAT DETAIL",
        sessionCount: Number(totalSesi ?? sortedSchedules.length),
        completedSessions: Number(completedSessions ?? 0),
        detail: {
          sessionCode: group?.kode_group ?? `Paket-${groupId ?? mainSchedule?.id}`,
          updatedAt: group?.progress_label ?? `${completedSessions}/${totalSesi} sesi`,
          focus: packageName,
          participants,
        },
      } satisfies TeachingScheduleItem;
    })
    .sort((a, b) => (a.rawDate ?? "").localeCompare(b.rawDate ?? ""));
}

export function buildUpcomingAgendaFromTeachingGroups(
  items: TeachingScheduleItem[],
): UpcomingAgendaItem[] {
  const todayKey = getTodayKey();

  return items
    .filter((item) => (item.rawDate ?? "") >= todayKey && item.status !== "SELESAI")
    .slice(0, 3)
    .map((item, index) => ({
      id: String(item.bookingGroupId ?? item.numericId ?? item.id),
      label: `${item.day} • ${item.date}`,
      participantName: item.participantName,
      time: item.time,
      duration: item.sessionCount ? `${item.sessionCount} sesi paket` : item.duration ?? "-",
      vehicle: `${item.vehicleName} (${item.vehiclePlate})`,
      participantInitials: [item.participantInitial],
      icon: index === 0 ? CalendarDays : index === 1 ? Clock3 : CheckCircle2,
      active: index === 0,
    }));
}

function mapCandidateStatus(candidate: InstructorTrainingResultCandidateApi): TrainingResultStatus {
  if (candidate.can_input_result === false) {
    const reason = (candidate.input_unavailable_reason ?? "").toLowerCase();
    if (reason.includes("batas") || reason.includes("lewat")) return "MELEWATI BATAS";
    return "BELUM SAATNYA";
  }

  const dateKey = getDateKey(candidate.training_schedule?.tanggal_latihan);
  if (dateKey && dateKey > getTodayKey()) return "BELUM SAATNYA";
  return "MENUNGGU EVALUASI";
}

function mapResultStatus(result: InstructorTrainingResultApi): TrainingResultStatus {
  if (result.status_kelulusan === "Lulus") return "LULUS";
  if (result.status_kelulusan === "Tidak Lulus") return "TIDAK LULUS";
  return "SELESAI";
}

export function mapCandidateToTrainingResultItem(
  candidate: InstructorTrainingResultCandidateApi,
): TrainingResultItem {
  const schedule = candidate.training_schedule;
  const participantName = candidate.peserta?.nama_peserta ?? "Peserta";
  const status = mapCandidateStatus(candidate);

  const participant: TrainingResultParticipant = {
    id: String(candidate.id),
    bookingId: Number(candidate.id),
    participantCode: candidate.peserta?.kode_peserta ?? candidate.kode_booking ?? `BK-${candidate.id}`,
    name: participantName,
    initials: getInitials(participantName),
    packageName: candidate.course_package?.nama_paket ?? "Paket belum tersedia",
    sessionLabel: candidate.session_label ?? candidate.kode_booking ?? `Booking ${candidate.id}`,
    attendance: "BELUM DITANDAI",
    resultStatus: "MENUNGGU EVALUASI",
  };

  return {
    id: `candidate-${candidate.id}`,
    numericId: Number(candidate.id),
    source: "candidate",
    bookingGroupId: candidate.booking_group_id ?? candidate.booking_group?.id ?? null,
    groupCode: candidate.booking_group?.kode_group ?? null,
    totalSesi: candidate.total_sesi ?? candidate.booking_group?.total_sesi ?? null,
    completedSessions: candidate.booking_group?.jumlah_sesi_selesai ?? null,
    bookingId: Number(candidate.id),
    sessionCode: schedule?.kode_jadwal ?? candidate.kode_booking ?? `Booking-${candidate.id}`,
    sessionLabel: candidate.session_label ?? `Sesi ${candidate.sesi_ke ?? 1}/${candidate.total_sesi ?? 1}`,
    isFinalSession: Boolean(candidate.is_final_session),
    date: formatDate(schedule?.tanggal_latihan),
    rawDate: schedule?.tanggal_latihan ?? "",
    day: formatDay(schedule?.tanggal_latihan),
    time: getTimeRange(schedule?.time_slot),
    vehicleName: schedule?.vehicle?.nama_kendaraan ?? "Kendaraan belum tersedia",
    vehiclePlate: schedule?.vehicle?.nomor_plat ?? "-",
    location: "SIKEMUDI Driving School",
    focus: `${candidate.session_label ?? "Sesi latihan"} • ${candidate.is_final_session ? "Input hasil akhir" : "Input kehadiran dan catatan"} untuk ${participantName}`,
    status,
    canInputResult: candidate.can_input_result !== false,
    inputUnavailableReason: candidate.input_unavailable_reason ?? null,
    participantCount: 1,
    evaluatedCount: 0,
    participants: [participant],
    lastUpdated: candidate.payment?.status
      ? `Pembayaran ${candidate.payment.status}`
      : "Menunggu input hasil latihan",
  };
}

export function mapResultToTrainingResultItem(result: InstructorTrainingResultApi): TrainingResultItem {
  const schedule = result.training_schedule;
  const participantName = result.peserta?.nama_peserta ?? "Peserta";
  const status = mapResultStatus(result);

  const participant: TrainingResultParticipant = {
    id: String(result.peserta?.id ?? result.booking_id),
    bookingId: result.booking_id,
    resultId: result.id,
    participantCode: result.peserta?.kode_peserta ?? result.booking?.kode_booking ?? `BK-${result.booking_id}`,
    name: participantName,
    initials: getInitials(participantName),
    packageName: result.booking?.course_package?.nama_paket ?? "Paket belum tersedia",
    sessionLabel: result.session_label ?? result.booking?.kode_booking ?? `Booking ${result.booking_id}`,
    attendance:
      result.status_kehadiran === "Hadir"
        ? "HADIR"
        : result.status_kehadiran === "Tidak Hadir"
          ? "TIDAK HADIR"
          : "BELUM DITANDAI",
    resultStatus:
      result.status_kelulusan === "Lulus" || result.status_kelulusan === "Tidak Lulus"
        ? "SUDAH DINILAI"
        : "DRAFT",
  };

  return {
    id: `result-${result.id}`,
    numericId: Number(result.id),
    source: "result",
    bookingGroupId: result.booking_group_id ?? result.booking?.booking_group_id ?? null,
    groupCode: null,
    totalSesi: result.total_sesi ?? result.booking?.total_sesi ?? null,
    completedSessions: null,
    bookingId: Number(result.booking_id),
    resultId: Number(result.id),
    sessionCode: schedule?.kode_jadwal ?? result.booking?.kode_booking ?? `Hasil-${result.id}`,
    sessionLabel: result.session_label ?? `Sesi ${result.sesi_ke ?? 1}/${result.total_sesi ?? 1}`,
    isFinalSession: Boolean(result.is_final_session),
    date: formatDate(schedule?.tanggal_latihan ?? result.tanggal_latihan),
    rawDate: schedule?.tanggal_latihan ?? result.tanggal_latihan ?? "",
    day: formatDay(schedule?.tanggal_latihan ?? result.tanggal_latihan),
    time: getTimeRange(schedule?.time_slot),
    vehicleName: schedule?.vehicle?.nama_kendaraan ?? "Kendaraan belum tersedia",
    vehiclePlate: schedule?.vehicle?.nomor_plat ?? "-",
    location: "SIKEMUDI Driving School",
    focus: result.catatan_instruktur || `${result.session_label ?? "Sesi latihan"} • Hasil latihan ${participantName}`,
    status,
    participantCount: 1,
    evaluatedCount: 1,
    participants: [participant],
    lastUpdated: result.updated_at ? `Diperbarui ${result.updated_at}` : "Hasil tersimpan",
    score: result.nilai_akhir ?? null,
    graduationStatus: result.status_kelulusan ?? "Belum Dinilai",
  };
}

export function buildTrainingResultStats(
  candidates: InstructorTrainingResultCandidateApi[],
  results: InstructorTrainingResultApi[],
): TrainingResultStat[] {
  const waiting = candidates.length;
  const passed = results.filter((item) => item.status_kelulusan === "Lulus").length;
  const failed = results.filter((item) => item.status_kelulusan === "Tidak Lulus").length;
  const completed = results.length;

  return [
    {
      id: "waiting",
      label: "Menunggu Evaluasi",
      value: String(waiting),
      description: "Booking perlu dinilai",
      icon: ClipboardEdit,
      tone: "red",
    },
    {
      id: "completed",
      label: "Hasil Tersimpan",
      value: String(completed),
      description: "Sudah diinput",
      icon: CheckCircle2,
      tone: "blue",
    },
    {
      id: "passed",
      label: "Lulus",
      value: String(passed),
      description: "Memenuhi kriteria",
      icon: CheckCircle2,
      tone: "green",
    },
    {
      id: "failed",
      label: "Tidak Lulus",
      value: String(failed),
      description: "Perlu evaluasi ulang",
      icon: Clock3,
      tone: "amber",
    },
  ];
}

export function mergePaginationLabel(pagination: PaginationMeta | null, fallbackCount: number): string {
  if (!pagination) return `Menampilkan ${fallbackCount} data`;
  return `Halaman ${pagination.current_page} dari ${pagination.last_page} • Total ${pagination.total} data`;
}


function getSessionNumber(item: TrainingResultItem): number {
  const match = item.sessionLabel?.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) return 1;
  return Number(match[1]) || 1;
}

function getGroupSortDate(items: TrainingResultItem[]): string {
  return items
    .map((item) => item.rawDate || "")
    .filter(Boolean)
    .sort()
    .at(-1) ?? "";
}

function getGroupStatus(items: TrainingResultItem[]): TrainingResultStatus {
  const finalResult = items.find((item) => item.isFinalSession && item.source === "result");
  if (finalResult?.status === "LULUS" || finalResult?.status === "TIDAK LULUS") return finalResult.status;
  if (items.some((item) => item.source === "candidate" && item.canInputResult !== false)) return "MENUNGGU EVALUASI";
  if (items.some((item) => item.status === "BELUM SAATNYA")) return "BELUM SAATNYA";
  if (items.every((item) => item.source === "result")) return "SELESAI";
  return "BELUM SAATNYA";
}

export function buildTrainingResultGroupItems(items: TrainingResultItem[]): TrainingResultItem[] {
  const grouped = new Map<string, TrainingResultItem[]>();

  items.forEach((item) => {
    const key = item.bookingGroupId ? `group-${item.bookingGroupId}` : `single-${item.id}`;
    const current = grouped.get(key) ?? [];
    current.push(item);
    grouped.set(key, current);
  });

  return Array.from(grouped.entries()).map(([key, groupItems]) => {
    const sortedSessions = [...groupItems].sort((a, b) => getSessionNumber(a) - getSessionNumber(b));
    const first = sortedSessions[0];
    const completed = sortedSessions.filter((item) => item.source === "result").length;
    const total = first.totalSesi ?? sortedSessions.length;
    const nextAction = sortedSessions.find((item) => item.source === "candidate" && item.canInputResult !== false)
      ?? sortedSessions.find((item) => item.source === "candidate")
      ?? sortedSessions.at(-1)
      ?? first;

    return {
      ...first,
      id: key,
      source: "group" as const,
      numericId: first.bookingGroupId ?? first.numericId,
      bookingId: nextAction.bookingId,
      resultId: nextAction.resultId,
      sessionCode: first.groupCode ?? `Paket-${first.bookingGroupId ?? first.id}`,
      sessionLabel: `${completed}/${total} sesi selesai`,
      focus: `${first.participants[0]?.packageName ?? "Paket latihan"} • ${completed}/${total} sesi selesai`,
      status: getGroupStatus(sortedSessions),
      canInputResult: nextAction.canInputResult,
      inputUnavailableReason: nextAction.source === "candidate" ? nextAction.inputUnavailableReason : null,
      participantCount: 1,
      evaluatedCount: completed,
      lastUpdated: `Menampilkan ${sortedSessions.length} sesi dalam paket`,
      totalSesi: total,
      completedSessions: completed,
      rawDate: getGroupSortDate(sortedSessions),
      sessions: sortedSessions,
    };
  }).sort((a, b) => (b.rawDate || "").localeCompare(a.rawDate || ""));
}
