import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import {
  changeParticipantBookingSchedule,
  getParticipantBookingScheduleRecommendations,
  getParticipantTimeSlots,
} from "@/services/booking.service";
import type { UpcomingSessionItem } from "@/features/participant/constants/mySchedule";
import type { BookingRescheduleRecommendationApiItem, TimeSlotApiItem } from "@/types/booking";
import { CalendarDays, Clock3 } from "lucide-react";

interface RescheduleSessionModalProps {
  opened: boolean;
  session: UpcomingSessionItem | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatSlot(slot: TimeSlotApiItem): string {
  const time = slot.jam_mulai && slot.jam_selesai ? `${slot.jam_mulai} - ${slot.jam_selesai}` : "Jam belum tersedia";
  return `${slot.nama_slot} • ${time}`;
}

export default function RescheduleSessionModal({
  opened,
  session,
  onClose,
  onSuccess,
}: RescheduleSessionModalProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlotApiItem[]>([]);
  const [tanggalLatihan, setTanggalLatihan] = useState("");
  const [timeSlotId, setTimeSlotId] = useState("");
  const [catatan, setCatatan] = useState("");
  const [recommendations, setRecommendations] = useState<BookingRescheduleRecommendationApiItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !session) return;

    setTanggalLatihan(session.dateISO || "");
    setTimeSlotId("");
    setCatatan("");
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
  }, [opened, session]);

  const slotOptions = useMemo(
    () => timeSlots.map((slot) => ({ value: String(slot.id), label: formatSlot(slot) })),
    [timeSlots],
  );

  async function handleSearchRecommendations() {
    if (!session) return;

    if (!tanggalLatihan) {
      setError("Tanggal latihan wajib dipilih.");
      return;
    }

    try {
      setSearching(true);
      setError(null);
      setRecommendations([]);
      setSelectedIndex(null);

      const response = await getParticipantBookingScheduleRecommendations(session.bookingId, {
        tanggal_latihan: tanggalLatihan,
        time_slot_id: timeSlotId ? Number(timeSlotId) : null,
        limit: 6,
      });

      setRecommendations(response.items);
      setSelectedIndex(response.items.length > 0 ? 0 : null);

      if (response.items.length === 0) {
        setError("Belum ada rekomendasi jadwal yang sesuai. Coba tanggal atau slot lain.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rekomendasi jadwal gagal dimuat.");
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit() {
    if (!session || selectedIndex === null || !recommendations[selectedIndex]) {
      setError("Pilih salah satu rekomendasi jadwal terlebih dahulu.");
      return;
    }

    const selected = recommendations[selectedIndex];

    try {
      setSubmitting(true);
      setError(null);

      await changeParticipantBookingSchedule(session.bookingId, {
        tanggal_latihan: selected.tanggal_latihan,
        time_slot_id: selected.time_slot.id,
        catatan: catatan.trim() || null,
      });

      await onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Jadwal sesi gagal diubah.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedRecommendation = selectedIndex === null ? null : recommendations[selectedIndex];

  return (
    <Modal
      opened={opened}
      onClose={submitting ? () => undefined : onClose}
      size="xl"
      title="Ubah Jadwal Sesi"
      description="Pilih tanggal dan slot baru. Sistem hanya menampilkan rekomendasi yang tetap memakai instruktur dan kendaraan paket yang sama."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={submitting} className="rounded-2xl">
            Tutup
          </Button>
          <Button
            onClick={handleSubmit}
            loading={submitting}
            disabled={!selectedRecommendation || searching}
            className="rounded-2xl"
          >
            Simpan Perubahan
          </Button>
        </div>
      }
    >
      {!session ? null : (
        <div className="space-y-5">
          <Card className="rounded-3xl bg-slate-50 p-4 shadow-none">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
              Sesi yang Diubah
            </p>
            <h3 className="mt-2 text-xl font-black text-slate-950">
              Sesi {session.id} • {session.packageName}
            </h3>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Jadwal saat ini: {session.date} • {session.time}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {session.instructor} • {session.vehicle}
            </p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              type="date"
              label="Tanggal Baru"
              value={tanggalLatihan}
              onChange={(event) => setTanggalLatihan(event.target.value)}
              leftIcon={<CalendarDays className="h-4 w-4" />}
            />
            <Select
              label="Preferensi Slot"
              placeholder={loadingSlots ? "Memuat slot..." : "Semua slot aktif"}
              value={timeSlotId}
              onChange={(event) => setTimeSlotId(event.target.value)}
              options={slotOptions}
              disabled={loadingSlots}
              leftIcon={<Clock3 className="h-4 w-4" />}
            />
          </div>

          <Button
            variant="secondary"
            onClick={handleSearchRecommendations}
            loading={searching}
            disabled={loadingSlots || submitting}
            className="rounded-2xl"
          >
            Cari Rekomendasi Jadwal
          </Button>

          {error ? <ErrorMessage message={error} /> : null}

          {searching ? (
            <LoadingSpinner label="Mencari rekomendasi jadwal..." />
          ) : recommendations.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-bold text-slate-700">Pilih salah satu rekomendasi:</p>
              {recommendations.map((item, index) => {
                const selected = selectedIndex === index;
                return (
                  <button
                    key={`${item.tanggal_latihan}-${item.time_slot.id}`}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selected ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-black text-slate-950">{formatDate(item.tanggal_latihan)}</p>
                        <p className="text-sm font-semibold text-blue-700">
                          {item.time_slot.nama_slot} • {item.time_slot.jam_mulai} - {item.time_slot.jam_selesai}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-600">
                        {item.recommended_label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : null}

          <TextArea
            label="Catatan Perubahan"
            value={catatan}
            onChange={(event) => setCatatan(event.target.value)}
            placeholder="Opsional, misalnya alasan ubah jadwal."
            rows={3}
          />
        </div>
      )}
    </Modal>
  );
}
