import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  CreditCard,
  Layers3,
  UserRound,
} from "lucide-react";
import type { BookingGroupApiItem, BookingGroupSessionApiItem } from "@/types/booking";

interface PackageScheduleDetailModalProps {
  opened: boolean;
  group: BookingGroupApiItem | null;
  onClose: () => void;
  onOpenSessionDetail: (group: BookingGroupApiItem, session: BookingGroupSessionApiItem) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value?: string | null): string {
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

function formatTime(session: BookingGroupSessionApiItem): string {
  const start = session.training_schedule?.time_slot?.jam_mulai;
  const end = session.training_schedule?.time_slot?.jam_selesai;
  return start && end ? `${start} - ${end}` : "Jam belum tersedia";
}

function resolveStatusVariant(status: string): "success" | "warning" | "danger" | "info" | "default" {
  if (["Selesai", "Terkonfirmasi", "Dikonfirmasi"].includes(status)) return "success";
  if (["Dibatalkan", "Ditolak", "Tidak Lulus"].includes(status)) return "danger";
  if (["Menunggu Pembayaran", "Menunggu Konfirmasi Pembayaran", "Menunggu Konfirmasi"].includes(status)) return "warning";
  if (["Dijadwalkan Ulang", "Berlangsung"].includes(status)) return "info";
  return "default";
}

function sortSessions(sessions: BookingGroupSessionApiItem[]): BookingGroupSessionApiItem[] {
  return [...sessions].sort((a, b) => a.sesi_ke - b.sesi_ke);
}

function resolvePaymentMethodLabel(group: BookingGroupApiItem): string {
  return group.payment?.metode_pembayaran_label ?? (group.payment?.metode_pembayaran === "Cash" ? "Cash" : "Transfer Bank");
}

export default function PackageScheduleDetailModal({
  opened,
  group,
  onClose,
  onOpenSessionDetail,
}: PackageScheduleDetailModalProps) {
  const sessions = group ? sortSessions(group.sessions) : [];
  const completedCount = sessions.filter((session) => session.status === "Selesai").length;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Detail Booking Paket"
      description={group ? `${group.kode_group} • ${group.course_package?.nama_paket ?? "Paket Kursus"}` : undefined}
      size="xl"
      headerClassName="px-5 py-4 sm:px-6 sm:py-5"
      bodyClassName="px-5 py-4 sm:px-6"
    >
      {!group ? (
        <EmptyState
          icon={<Layers3 className="h-7 w-7" />}
          title="Booking paket tidak ditemukan"
          description="Silakan tutup modal dan pilih booking paket kembali."
        />
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
            <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-2 xl:grid-cols-4">
              <p className="inline-flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-blue-600" />
                <span>{completedCount}/{group.total_sesi} sesi selesai</span>
              </p>
              <p className="inline-flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-500" />
                <span>{resolvePaymentMethodLabel(group)} • {group.payment?.status ?? "Belum Upload"}</span>
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

            <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 text-sm text-slate-700 md:grid-cols-3">
              <p>
                Harga: <span className="font-bold text-slate-950">{formatCurrency(group.harga_paket)}</span>
              </p>
              <p>
                Layanan: <span className="font-bold text-slate-950">{group.pakai_antar_jemput ? "Antar Jemput" : "Tanpa Antar Jemput"}</span>
              </p>
              <p>
                SIM: <span className="font-bold text-slate-950">{group.pakai_sim ? "Dengan SIM" : "Tanpa SIM"}</span>
              </p>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-950">Daftar Sesi</h3>
                <p className="text-sm text-slate-500">Semua sesi pada booking paket ini ditampilkan dalam satu tempat.</p>
              </div>
              <Badge variant={resolveStatusVariant(group.status)} className="px-3 font-bold uppercase tracking-[0.08em]">
                {group.status_label ?? group.status}
              </Badge>
            </div>

            {sessions.length === 0 ? (
              <EmptyState
                icon={<CalendarDays className="h-7 w-7" />}
                title="Belum ada sesi"
                description="Sesi pada booking paket ini belum tersedia."
              />
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => {
                  const result = session.training_result;
                  return (
                    <div key={session.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={resolveStatusVariant(session.status)}
                              className="px-3 text-[11px] font-bold uppercase tracking-[0.08em]"
                            >
                              {session.status_label ?? session.status}
                            </Badge>
                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                              Sesi {session.sesi_ke}/{session.total_sesi}
                            </span>
                          </div>

                          <div className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2 xl:grid-cols-4">
                            <p className="inline-flex items-center gap-2 font-semibold text-slate-950">
                              <CalendarDays className="h-4 w-4 text-blue-600" />
                              {formatDate(session.training_schedule?.tanggal_latihan)}
                            </p>
                            <p className="inline-flex items-center gap-2 font-semibold text-slate-950">
                              <Clock3 className="h-4 w-4 text-slate-500" />
                              {formatTime(session)}
                            </p>
                            <p className="inline-flex items-center gap-2">
                              <UserRound className="h-4 w-4 text-slate-500" />
                              {session.training_schedule?.instructor?.nama_instruktur ?? group.instructor?.nama_instruktur ?? "Instruktur belum tersedia"}
                            </p>
                            <p className="inline-flex items-center gap-2">
                              <CarFront className="h-4 w-4 text-slate-500" />
                              {session.training_schedule?.vehicle
                                ? `${session.training_schedule.vehicle.nama_kendaraan} (${session.training_schedule.vehicle.transmisi})`
                                : group.vehicle
                                  ? `${group.vehicle.nama_kendaraan} (${group.vehicle.transmisi})`
                                  : "Kendaraan belum tersedia"}
                            </p>
                          </div>

                          {result ? (
                            <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                              <CheckCircle2 className="mr-1 inline h-3.5 w-3.5 text-emerald-500" />
                              Kehadiran: {result.status_kehadiran ?? "-"} • Kelulusan: {result.status_kelulusan ?? "Belum Dinilai"}
                              {typeof result.nilai_akhir === "number" ? ` • Nilai akhir: ${result.nilai_akhir}` : ""}
                            </div>
                          ) : null}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 rounded-xl text-[11px] font-bold uppercase tracking-[0.08em] lg:w-32"
                          onClick={() => onOpenSessionDetail(group, session)}
                        >
                          Detail Sesi
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
