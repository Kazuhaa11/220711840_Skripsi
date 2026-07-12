import { useEffect, useState } from "react";
import { CalendarDays, CarFront, CheckCircle2, Clock3, UserRound } from "lucide-react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import { cn } from "@/lib/cn";
import type {
  AdminBookingRowItem,
  AdminReplacementScheduleItem,
} from "@/types/adminBooking";

interface AdminBookingRescheduleModalProps {
  opened: boolean;
  item: AdminBookingRowItem | null;
  slots: AdminReplacementScheduleItem[];
  loadingSlots?: boolean;
  submitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (values: { training_schedule_id: number; catatan?: string }) => void;
}

export default function AdminBookingRescheduleModal({
  opened,
  item,
  slots,
  loadingSlots = false,
  submitting = false,
  error = null,
  onClose,
  onConfirm,
}: AdminBookingRescheduleModalProps) {
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!opened) {
      setSelectedSlotId("");
      setNote("");
    }
  }, [opened]);

  if (!item) return null;

  const selectedSlot = slots.find((slot) => slot.id === selectedSlotId);

  function handleConfirm() {
    if (!selectedSlot) return;

    onConfirm({
      training_schedule_id: selectedSlot.numericId,
      catatan: note.trim() || undefined,
    });
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title="Ubah Jadwal Booking"
      description={item.code}
      bodyClassName="max-h-[calc(100dvh-16rem)]"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </Button>

          <Button
            onClick={handleConfirm}
            disabled={!selectedSlot || submitting || loadingSlots}
            loading={submitting}
          >
            Simpan Perubahan Jadwal
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Card className="rounded-3xl bg-slate-50 p-4 shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Jadwal Saat Ini
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">{item.dateLabel}</p>
              <p className="mt-1 text-xs text-slate-500">{item.timeLabel}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">{item.instructorName}</p>
              <p className="mt-1 text-xs text-slate-500">Instruktur</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">{item.vehicleName}</p>
              <p className="mt-1 text-xs text-slate-500">Kendaraan</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">{item.packageName}</p>
              <p className="mt-1 text-xs text-slate-500">Paket</p>
            </div>
          </div>
        </Card>

        {error ? <ErrorMessage message={error} /> : null}

        <section>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
            Slot Pengganti
          </p>

          {loadingSlots ? (
            <div className="mt-4">
              <LoadingSpinner label="Memuat slot pengganti..." />
            </div>
          ) : slots.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={<CalendarDays className="h-7 w-7" />}
                title="Tidak ada slot pengganti"
                description="Belum ada jadwal tersedia untuk paket booking ini. Tambahkan jadwal latihan terlebih dahulu jika diperlukan."
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {slots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={cn(
                      "w-full rounded-3xl border bg-slate-50 p-4 text-left transition",
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-600/20"
                        : "border-transparent hover:border-slate-200",
                    )}
                    disabled={submitting}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-950">{slot.title}</p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-4 w-4" /> {slot.timeLabel}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound className="h-4 w-4" /> {slot.instructorName}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <CarFront className="h-4 w-4" /> {slot.vehicleName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant="success" className="font-semibold">
                          {slot.quotaLabel}
                        </Badge>
                        {isSelected ? (
                          <CheckCircle2 className="h-6 w-6 text-blue-700" />
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <TextArea
          label="Catatan Perubahan"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Catatan opsional untuk riwayat ubah jadwal..."
          rows={3}
          disabled={submitting}
        />
      </div>
    </Modal>
  );
}
