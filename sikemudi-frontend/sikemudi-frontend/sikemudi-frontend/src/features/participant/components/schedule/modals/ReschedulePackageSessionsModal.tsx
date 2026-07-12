import { useEffect, useMemo, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import {
  changeParticipantBookingSchedule,
  getParticipantBookingScheduleRecommendations,
  getParticipantTimeSlots,
} from "@/services/booking.service";
import type {
  BookingGroupApiItem,
  BookingGroupSessionApiItem,
  BookingRescheduleRecommendationApiItem,
  TimeSlotApiItem,
} from "@/types/booking";
import { CalendarDays, CheckCircle2, Clock3, Search, XCircle } from "lucide-react";

interface ReschedulePackageSessionsModalProps {
  opened: boolean;
  group: BookingGroupApiItem | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
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

function formatTime(session?: BookingGroupSessionApiItem | null): string {
  const start = session?.training_schedule?.time_slot?.jam_mulai;
  const end = session?.training_schedule?.time_slot?.jam_selesai;
  return start && end ? `${start} - ${end}` : "Jam belum tersedia";
}

function formatSlot(slot: TimeSlotApiItem): string {
  const time = slot.jam_mulai && slot.jam_selesai ? `${slot.jam_mulai} - ${slot.jam_selesai}` : "Jam belum tersedia";
  return `${slot.nama_slot} • ${time}`;
}

function sortSessions(sessions: BookingGroupSessionApiItem[]): BookingGroupSessionApiItem[] {
  return [...sessions].sort((a, b) => a.sesi_ke - b.sesi_ke);
}

function isSessionChangeable(session: BookingGroupSessionApiItem): boolean {
  return !["Selesai", "Dibatalkan"].includes(session.status) && Boolean(session.can_change_or_cancel);
}

function resolveSessionStatusVariant(status: string): "success" | "warning" | "danger" | "info" | "default" {
  if (["Selesai", "Dikonfirmasi"].includes(status)) return "success";
  if (["Dibatalkan", "Ditolak"].includes(status)) return "danger";
  if (["Menunggu Pembayaran", "Menunggu Konfirmasi Pembayaran"].includes(status)) return "warning";
  if (["Dijadwalkan Ulang", "Berlangsung"].includes(status)) return "info";
  return "default";
}

export default function ReschedulePackageSessionsModal({
  opened,
  group,
  onClose,
  onSuccess,
}: ReschedulePackageSessionsModalProps) {
  const { showNotification } = useFloatingNotification();
  const [timeSlots, setTimeSlots] = useState<TimeSlotApiItem[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [tanggalLatihan, setTanggalLatihan] = useState("");
  const [timeSlotId, setTimeSlotId] = useState("");
  const [recommendations, setRecommendations] = useState<BookingRescheduleRecommendationApiItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessions = useMemo(() => sortSessions(group?.sessions ?? []), [group]);
  const changeableSessions = useMemo(() => sessions.filter(isSessionChangeable), [sessions]);
  const selectedSession = useMemo(
    () => sessions.find((session) => String(session.id) === selectedBookingId) ?? null,
    [selectedBookingId, sessions],
  );

  useEffect(() => {
    if (!opened || !group) return;

    const firstSession = changeableSessions[0] ?? null;
    setSelectedBookingId(firstSession ? String(firstSession.id) : "");
    setTanggalLatihan(firstSession?.training_schedule?.tanggal_latihan ?? "");
    setTimeSlotId("");
    setRecommendations([]);
    setSelectedIndex(null);
    setError(null);

    async function loadSlots() {
      try {
        setLoadingSlots(true);
        const response = await getParticipantTimeSlots();
        setTimeSlots(response.items);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Slot waktu gagal dimuat.");
      } finally {
        setLoadingSlots(false);
      }
    }

    void loadSlots();
  }, [opened, group, changeableSessions]);

  function handleSelectSession(bookingId: string) {
    const nextSession = sessions.find((session) => String(session.id) === bookingId);
    setSelectedBookingId(bookingId);
    setTanggalLatihan(nextSession?.training_schedule?.tanggal_latihan ?? "");
    setTimeSlotId("");
    setRecommendations([]);
    setSelectedIndex(null);
    setError(null);
  }

  const sessionOptions = useMemo(
    () =>
      changeableSessions.map((session) => ({
        value: String(session.id),
        label: `Sesi ${session.sesi_ke}/${session.total_sesi} • ${formatDate(session.training_schedule?.tanggal_latihan)} • ${formatTime(session)}`,
      })),
    [changeableSessions],
  );

  const slotOptions = useMemo(
    () => timeSlots.map((slot) => ({ value: String(slot.id), label: formatSlot(slot) })),
    [timeSlots],
  );

  async function handleSearchRecommendations() {
    if (!selectedSession) {
      setError("Pilih sesi yang akan diubah terlebih dahulu.");
      return;
    }

    if (!isSessionChangeable(selectedSession)) {
      setError(selectedSession.change_window_message ?? "Sesi ini tidak dapat diubah.");
      return;
    }

    if (!tanggalLatihan) {
      setError("Tanggal latihan wajib dipilih.");
      return;
    }

    try {
      setSearching(true);
      setError(null);
      setRecommendations([]);
      setSelectedIndex(null);

      const response = await getParticipantBookingScheduleRecommendations(selectedSession.id, {
        tanggal_latihan: tanggalLatihan,
        time_slot_id: timeSlotId ? Number(timeSlotId) : null,
        limit: 6,
      });

      setRecommendations(response.items);
      setSelectedIndex(response.items.length > 0 ? 0 : null);

      if (response.items.length === 0) {
        setError("Belum ada rekomendasi jadwal yang sesuai. Coba tanggal atau jam lain.");
        showNotification({
          type: "warning",
          title: "Rekomendasi belum tersedia",
          message: "Coba pilih tanggal atau slot lain untuk mencari jadwal pengganti.",
          duration: 3500,
        });
      } else {
        showNotification({
          type: "success",
          title: "Rekomendasi ditemukan",
          message: `${response.items.length} jadwal pengganti tersedia untuk sesi yang dipilih.`,
          duration: 2500,
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rekomendasi jadwal gagal dimuat.";
      setError(message);
      showNotification({
        type: "error",
        title: "Gagal mencari jadwal",
        message,
        duration: 4000,
      });
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit() {
    if (!selectedSession || selectedIndex === null || !recommendations[selectedIndex]) {
      setError("Pilih salah satu rekomendasi jadwal terlebih dahulu.");
      return;
    }

    const selected = recommendations[selectedIndex];

    try {
      setSubmitting(true);
      setError(null);

      await changeParticipantBookingSchedule(selectedSession.id, {
        tanggal_latihan: selected.tanggal_latihan,
        time_slot_id: selected.time_slot.id,
        training_schedule_id: selected.existing_schedule_id,
        catatan: null,
      });

      await onSuccess();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Jadwal sesi gagal diubah.";
      setError(message);
      showNotification({
        type: "error",
        title: "Ubah jadwal gagal",
        message,
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="outline" onClick={onClose} disabled={submitting}>
        Tutup
      </Button>
      <Button onClick={handleSubmit} loading={submitting} disabled={selectedIndex === null || recommendations.length === 0}>
        Simpan Perubahan
      </Button>
    </div>
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Ubah Jadwal Paket"
      description={group ? `${group.kode_group} • pilih sesi, tanggal, dan jam baru` : undefined}
      size="xl"
      footer={footer}
      closeOnOverlayClick={!submitting}
      compact
      className="max-h-[90dvh] rounded-3xl"
      headerClassName="px-5 py-4 sm:px-6 sm:py-5"
      bodyClassName="max-h-[70dvh] px-4 py-4 sm:px-6"
      footerClassName="px-5 py-4 sm:px-6"
    >
      {!group ? (
        <EmptyState
          icon={<CalendarDays className="h-7 w-7" />}
          title="Booking paket tidak ditemukan"
          description="Silakan pilih booking paket kembali."
        />
      ) : changeableSessions.length === 0 ? (
        <EmptyState
          icon={<XCircle className="h-7 w-7" />}
          title="Tidak ada sesi yang bisa diubah"
          description="Sesi pada paket ini sudah selesai, dibatalkan, atau sudah melewati batas H-3."
        />
      ) : (
        <div className="space-y-4">
          {error ? <ErrorMessage message={error} /> : null}

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-950">Form Perubahan</h3>
              <div className="mt-3 grid gap-3 sm:mt-4">
                <Select
                  label="Sesi yang diubah"
                  value={selectedBookingId}
                  onChange={(event) => handleSelectSession(event.target.value)}
                  options={sessionOptions}
                  placeholder="Pilih sesi"
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    label="Tanggal baru"
                    type="date"
                    value={tanggalLatihan}
                    onChange={(event) => {
                      setTanggalLatihan(event.target.value);
                      setRecommendations([]);
                      setSelectedIndex(null);
                    }}
                  />
                  <Select
                    label="Jam / slot"
                    value={timeSlotId}
                    onChange={(event) => {
                      setTimeSlotId(event.target.value);
                      setRecommendations([]);
                      setSelectedIndex(null);
                    }}
                    options={slotOptions}
                    placeholder={loadingSlots ? "Memuat slot..." : "Semua slot tersedia"}
                    disabled={loadingSlots}
                  />
                </div>

                <Button
                  variant="secondary"
                  onClick={() => void handleSearchRecommendations()}
                  loading={searching}
                  leftIcon={<Search className="h-4 w-4" />}
                >
                  Cari Rekomendasi
                </Button>
              </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-950">Rekomendasi Jadwal</h3>
                <p className="text-xs text-slate-500">Sistem tetap mempertahankan instruktur dan kendaraan paket awal.</p>
              </div>
              {searching ? <LoadingSpinner label="" /> : null}
            </div>

            {recommendations.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-500">
                Pilih sesi, tanggal, dan jam lalu klik Cari Rekomendasi.
              </div>
            ) : (
              <div className="max-h-[14rem] space-y-2 overflow-y-auto pr-1 sm:max-h-[18rem]">
                {recommendations.map((recommendation, index) => {
                  const selected = index === selectedIndex;
                  const time = recommendation.time_slot.jam_mulai && recommendation.time_slot.jam_selesai
                    ? `${recommendation.time_slot.jam_mulai} - ${recommendation.time_slot.jam_selesai}`
                    : "Jam belum tersedia";

                  return (
                    <button
                      key={`${recommendation.tanggal_latihan}-${recommendation.time_slot.id}-${index}`}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      disabled={submitting}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        selected
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-black text-slate-950">
                            {formatDate(recommendation.tanggal_latihan)}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-slate-600">
                            {recommendation.time_slot.nama_slot} • {time}
                          </p>
                        </div>
                        <Badge variant={selected ? "info" : "default"} className="px-3 text-[10px] font-bold uppercase tracking-[0.08em]">
                          {recommendation.recommended_label}
                        </Badge>
                      </div>

                      <div className="mt-3 grid gap-2 text-xs font-semibold text-slate-600 sm:grid-cols-2">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          {recommendation.instructor.nama_instruktur ?? "Instruktur tetap"}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock3 className="h-3.5 w-3.5 text-blue-500" />
                          {recommendation.vehicle.nama_kendaraan} ({recommendation.vehicle.transmisi})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-black uppercase tracking-[0.14em] text-slate-950">Daftar Sesi</h3>
            <p className="mt-1 text-xs text-slate-500">Klik sesi yang masih bisa diubah.</p>

            <div className="mt-3 max-h-[14rem] space-y-2 overflow-y-auto pr-1 sm:mt-4 sm:max-h-[18rem]">
              {sessions.map((session) => {
                const disabled = !isSessionChangeable(session);
                const selected = String(session.id) === selectedBookingId;

                return (
                  <button
                    key={session.id}
                    type="button"
                    disabled={disabled || submitting}
                    onClick={() => handleSelectSession(String(session.id))}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50"
                    } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-black text-slate-950">Sesi {session.sesi_ke}/{session.total_sesi}</span>
                      <Badge variant={resolveSessionStatusVariant(session.status)} className="px-2 text-[10px] font-bold uppercase tracking-[0.08em]">
                        {session.status_label ?? session.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs font-semibold text-slate-700">
                      {formatDate(session.training_schedule?.tanggal_latihan)} • {formatTime(session)}
                    </p>
                    {!isSessionChangeable(session) ? (
                      <p className="mt-1 text-[11px] font-semibold text-amber-700">
                        {session.change_window_message ?? "Sesi ini tidak bisa diubah."}
                      </p>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
