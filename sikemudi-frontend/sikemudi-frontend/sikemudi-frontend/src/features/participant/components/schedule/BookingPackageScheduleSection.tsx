import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import {
  CalendarDays,
  CarFront,
  Clock3,
  CreditCard,
  Eye,
  FileUp,
  Layers3,
  PencilLine,
  UserRound,
  XCircle,
} from "lucide-react";
import type { BookingGroupApiItem, BookingGroupSessionApiItem } from "@/types/booking";

interface BookingPackageScheduleSectionProps {
  groups: BookingGroupApiItem[];
  onOpenDetailGroup: (group: BookingGroupApiItem) => void;
  onOpenRescheduleGroup: (group: BookingGroupApiItem) => void;
  onOpenCancelPackage: (group: BookingGroupApiItem) => void;
  onOpenPaymentProof: (group: BookingGroupApiItem) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function resolveDate(value?: string | null): string {
  if (!value) return "Tanggal belum tersedia";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function resolveTime(session?: BookingGroupSessionApiItem | null): string {
  const start = session?.training_schedule?.time_slot?.jam_mulai;
  const end = session?.training_schedule?.time_slot?.jam_selesai;
  return start && end ? `${start} - ${end}` : "Jam belum tersedia";
}

function getActiveSessions(group: BookingGroupApiItem): BookingGroupSessionApiItem[] {
  return group.sessions.filter((session) => !["Selesai", "Dibatalkan"].includes(session.status));
}

function getCompletedSessions(group: BookingGroupApiItem): BookingGroupSessionApiItem[] {
  return group.sessions.filter((session) => session.status === "Selesai");
}

function getCanceledSessions(group: BookingGroupApiItem): BookingGroupSessionApiItem[] {
  return group.sessions.filter((session) => session.status === "Dibatalkan");
}

function getChangeableSessions(group: BookingGroupApiItem): BookingGroupSessionApiItem[] {
  return getActiveSessions(group).filter((session) => Boolean(session.can_change_or_cancel));
}

function getNearestActiveSession(group: BookingGroupApiItem): BookingGroupSessionApiItem | null {
  const sessions = [...getActiveSessions(group)];

  sessions.sort((a, b) => {
    const dateA = a.training_schedule?.tanggal_latihan ?? "9999-12-31";
    const dateB = b.training_schedule?.tanggal_latihan ?? "9999-12-31";
    return dateA.localeCompare(dateB) || a.sesi_ke - b.sesi_ke;
  });

  return sessions[0] ?? null;
}

function resolvePaymentMethod(group: BookingGroupApiItem): "Transfer" | "Cash" {
  return group.payment?.metode_pembayaran === "Cash" ? "Cash" : "Transfer";
}

function resolvePaymentMethodLabel(group: BookingGroupApiItem): string {
  return group.payment?.metode_pembayaran_label ?? (resolvePaymentMethod(group) === "Cash" ? "Cash" : "Transfer Bank");
}

function resolvePaymentStatusLabel(group: BookingGroupApiItem): string {
  const method = resolvePaymentMethodLabel(group);
  const status = group.payment?.status ?? "Belum Upload";
  return `${method} • ${status}`;
}

function canUploadPayment(group: BookingGroupApiItem): boolean {
  const status = group.payment?.status ?? "Belum Upload";
  return resolvePaymentMethod(group) === "Transfer" && group.status === "Menunggu Pembayaran" && ["Belum Upload", "Ditolak"].includes(status);
}

function canCancelPackage(group: BookingGroupApiItem): boolean {
  if (["Selesai", "Dibatalkan"].includes(group.status)) return false;
  const activeSessions = getActiveSessions(group);
  return activeSessions.length > 0 && activeSessions.every((session) => Boolean(session.can_change_or_cancel));
}

function canReschedulePackage(group: BookingGroupApiItem): boolean {
  if (["Selesai", "Dibatalkan"].includes(group.status)) return false;
  return getChangeableSessions(group).length > 0;
}

function resolveBlockedMessage(group: BookingGroupApiItem): string | null {
  const activeSessions = getActiveSessions(group);
  const blockedSession = activeSessions.find((session) => !session.can_change_or_cancel);

  if (!blockedSession) return null;

  return blockedSession.change_window_message ?? "Paket tidak dapat diubah atau dibatalkan karena sudah melewati batas perubahan jadwal.";
}

function resolveStatusVariant(status: string): "success" | "warning" | "danger" | "info" | "default" {
  if (["Selesai", "Terkonfirmasi", "Dikonfirmasi"].includes(status)) return "success";
  if (["Dibatalkan", "Ditolak"].includes(status)) return "danger";
  if (["Menunggu Pembayaran", "Menunggu Konfirmasi Pembayaran", "Menunggu Konfirmasi"].includes(status)) return "warning";
  if (["Dijadwalkan Ulang", "Berlangsung"].includes(status)) return "info";
  return "default";
}

export default function BookingPackageScheduleSection({
  groups,
  onOpenDetailGroup,
  onOpenRescheduleGroup,
  onOpenCancelPackage,
  onOpenPaymentProof,
}: BookingPackageScheduleSectionProps) {
  if (groups.length === 0) {
    return (
      <section>
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-extrabold tracking-tight text-slate-950 md:text-2xl">
            Booking Paket Saya
          </h2>
        </div>
        <div className="mt-5">
          <EmptyState
            icon={<CalendarDays className="h-7 w-7" />}
            title="Belum ada booking paket aktif"
            description="Booking paket yang masih aktif, menunggu pembayaran, atau menunggu konfirmasi admin akan muncul di bagian ini."
          />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {groups.map((group) => {
        const activeSessions = getActiveSessions(group);
        const completedSessions = getCompletedSessions(group);
        const canceledSessions = getCanceledSessions(group);
        const nearestSession = getNearestActiveSession(group);
        const paymentStatus = resolvePaymentStatusLabel(group);
        const cancelAllowed = canCancelPackage(group);
        const rescheduleAllowed = canReschedulePackage(group);
        const blockedMessage = resolveBlockedMessage(group);

        return (
          <div key={group.id}>
            <Card className="min-w-0 rounded-2xl border-l-4 border-l-blue-600 p-3 shadow-sm md:hidden">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={resolveStatusVariant(group.status)}
                  className="px-2 text-[10px] font-bold uppercase tracking-[0.08em]"
                >
                  {group.status_label ?? group.status}
                </Badge>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
                  {group.progress_label}
                </span>
              </div>

              <div className="mt-3 min-w-0">
                <h3 className="break-words text-base font-extrabold leading-tight text-slate-950">
                  {group.course_package?.nama_paket ?? "Paket Kursus"}
                </h3>
                <p className="mt-1 break-words text-xs font-semibold text-slate-500">
                  {group.kode_group} • {formatCurrency(group.harga_paket)}
                </p>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                <span className="rounded-xl bg-slate-50 px-2 py-2">
                  {completedSessions.length}/{group.total_sesi} selesai
                </span>
                <span className="rounded-xl bg-slate-50 px-2 py-2">
                  {paymentStatus}
                </span>
              </div>

              <div className="mt-3 rounded-2xl bg-blue-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
                  Sesi terdekat
                </p>
                {nearestSession ? (
                  <div className="mt-1.5 text-xs font-semibold leading-5 text-slate-800">
                    <p>Sesi {nearestSession.sesi_ke}: {resolveDate(nearestSession.training_schedule?.tanggal_latihan)}</p>
                    <p>{resolveTime(nearestSession)}</p>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs font-semibold text-slate-700">Tidak ada sesi mendatang.</p>
                )}
              </div>

              {blockedMessage ? (
                <p className="mt-2 text-[11px] font-semibold leading-5 text-amber-700">{blockedMessage}</p>
              ) : null}

              {resolvePaymentMethod(group) === "Cash" && group.status === "Menunggu Konfirmasi Pembayaran" ? (
                <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold leading-5 text-amber-700">
                  Pembayaran cash menunggu konfirmasi admin. Tidak perlu upload bukti bayar.
                </p>
              ) : null}

              <div className="mt-3 grid grid-cols-2 gap-2">
                {canUploadPayment(group) ? (
                  <Button
                    className="h-9 rounded-xl px-2 text-[10px] font-bold uppercase tracking-[0.06em]"
                    leftIcon={<FileUp className="h-3.5 w-3.5" />}
                    onClick={() => onOpenPaymentProof(group)}
                  >
                    Upload
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  className="h-9 rounded-xl px-2 text-[10px] font-bold uppercase tracking-[0.06em]"
                  leftIcon={<Eye className="h-3.5 w-3.5" />}
                  onClick={() => onOpenDetailGroup(group)}
                >
                  Detail
                </Button>
                <Button
                  variant="secondary"
                  className="h-9 rounded-xl px-2 text-[10px] font-bold uppercase tracking-[0.06em]"
                  leftIcon={<PencilLine className="h-3.5 w-3.5" />}
                  onClick={() => onOpenRescheduleGroup(group)}
                  disabled={!rescheduleAllowed}
                >
                  Ubah
                </Button>
                <Button
                  variant="danger"
                  className="h-9 rounded-xl px-2 text-[10px] font-bold uppercase tracking-[0.06em]"
                  leftIcon={<XCircle className="h-3.5 w-3.5" />}
                  onClick={() => onOpenCancelPackage(group)}
                  disabled={!cancelAllowed}
                >
                  Batal
                </Button>
              </div>
            </Card>

          <Card className="hidden rounded-3xl border-l-4 border-l-blue-600 p-4 shadow-sm sm:p-5 md:block">
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant={resolveStatusVariant(group.status)}
                    className="px-3 font-bold uppercase tracking-[0.08em]"
                  >
                    {group.status_label ?? group.status}
                  </Badge>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                    {group.progress_label}
                  </span>
                </div>

                <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                      {group.course_package?.nama_paket ?? "Paket Kursus"}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">
                      {group.kode_group} • Pembayaran sekali untuk seluruh paket
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-950">
                    {formatCurrency(group.harga_paket)}
                  </div>
                </div>

                <div className="mt-4 grid gap-2.5 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
                  <p className="inline-flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-blue-600" />
                    <span>{completedSessions.length}/{group.total_sesi} sesi selesai</span>
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-500" />
                    <span>{paymentStatus}</span>
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-slate-500" />
                    <span>{group.instructor?.nama_instruktur ?? "Instruktur belum tersedia"}</span>
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <CarFront className="h-4 w-4 text-slate-500" />
                    <span>{group.vehicle ? `${group.vehicle.nama_kendaraan} (${group.vehicle.transmisi})` : "Kendaraan belum tersedia"}</span>
                  </p>
                </div>

                <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)]">
                  <div className="rounded-2xl bg-blue-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Sesi terdekat</p>
                    {nearestSession ? (
                      <div className="mt-2 grid gap-2 text-slate-800 sm:grid-cols-2">
                        <p className="inline-flex items-center gap-2 font-semibold">
                          <CalendarDays className="h-4 w-4 text-blue-600" />
                          Sesi {nearestSession.sesi_ke}: {resolveDate(nearestSession.training_schedule?.tanggal_latihan)}
                        </p>
                        <p className="inline-flex items-center gap-2 font-semibold">
                          <Clock3 className="h-4 w-4 text-blue-600" />
                          {resolveTime(nearestSession)}
                        </p>
                      </div>
                    ) : (
                      <p className="mt-2 font-semibold text-slate-700">Tidak ada sesi mendatang.</p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Ringkasan sesi</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-700">
                      <span className="rounded-xl bg-white px-2 py-2">Aktif {activeSessions.length}</span>
                      <span className="rounded-xl bg-white px-2 py-2">Selesai {completedSessions.length}</span>
                      <span className="rounded-xl bg-white px-2 py-2">Batal {canceledSessions.length}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p>
                    Layanan: <span className="font-semibold text-slate-900">{group.pakai_antar_jemput ? "Antar Jemput" : "Tanpa Antar Jemput"}</span>
                  </p>
                  <p>
                    SIM: <span className="font-semibold text-slate-900">{group.pakai_sim ? "Dengan SIM" : "Tanpa SIM"}</span>
                  </p>
                </div>

                {group.refund ? (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                    <p className="font-bold text-blue-950">Status Refund: {group.refund.status_refund}</p>
                    <p className="mt-1">
                      {formatCurrency(group.refund.nominal_refund)} • {group.refund.bank_tujuan} • {group.refund.nomor_rekening} a.n. {group.refund.nama_penerima}
                    </p>
                  </div>
                ) : null}

                {!rescheduleAllowed && blockedMessage ? (
                  <p className="mt-4 text-xs font-semibold text-amber-700">{blockedMessage}</p>
                ) : null}

              <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
                <p className="text-xs font-semibold text-slate-500">
                  Gunakan aksi di bawah untuk mengelola booking paket ini.
                </p>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                  {canUploadPayment(group) ? (
                    <Button
                      className="h-9 justify-center rounded-xl px-4 text-[11px] font-bold uppercase tracking-[0.08em] sm:min-w-36"
                      leftIcon={<FileUp className="h-4 w-4" />}
                      onClick={() => onOpenPaymentProof(group)}
                    >
                      Upload Bukti
                    </Button>
                  ) : null}

                  <Button
                    variant="outline"
                    className="h-9 justify-center rounded-xl px-4 text-[11px] font-bold uppercase tracking-[0.08em] sm:min-w-32"
                    leftIcon={<Eye className="h-4 w-4" />}
                    onClick={() => onOpenDetailGroup(group)}
                  >
                    Detail
                  </Button>

                  <Button
                    variant="secondary"
                    className="h-9 justify-center rounded-xl px-4 text-[11px] font-bold uppercase tracking-[0.08em] sm:min-w-36"
                    leftIcon={<PencilLine className="h-4 w-4" />}
                    onClick={() => onOpenRescheduleGroup(group)}
                    disabled={!rescheduleAllowed}
                  >
                    Ubah Jadwal
                  </Button>

                  <Button
                    variant="danger"
                    className="h-9 justify-center rounded-xl px-4 text-[11px] font-bold uppercase tracking-[0.08em] sm:min-w-32"
                    leftIcon={<XCircle className="h-4 w-4" />}
                    onClick={() => onOpenCancelPackage(group)}
                    disabled={!cancelAllowed}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          </div>
        );
      })}
    </section>
  );
}
