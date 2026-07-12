import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Pencil,
  Timer,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { AdminTimeSlot } from "@/features/admin/constants/timeSlots";

interface TimeSlotDetailModalProps {
  opened: boolean;
  timeSlot: AdminTimeSlot | null;
  onClose: () => void;
  onEdit: (timeSlot: AdminTimeSlot) => void;
}

export default function TimeSlotDetailModal({
  opened,
  timeSlot,
  onClose,
  onEdit,
}: TimeSlotDetailModalProps) {
  if (!timeSlot) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="2xl"
      showCloseButton={false}
      bodyClassName="p-0"
    >
      <div className="overflow-hidden rounded-[28px] bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-slate-950 px-3 py-1 font-bold uppercase tracking-[0.12em] text-white">
                  Detail Slot
                </Badge>
                <span className="text-base font-medium text-slate-500">
                  #{timeSlot.id}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                {timeSlot.name}
              </h2>
            </div>
          </div>

        </div>

        <div className="px-6 py-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <section>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                Informasi Waktu
              </h3>

              <div className="mt-5 space-y-5">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Clock3 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Rentang Waktu</p>
                    <p className="mt-1 text-lg font-bold text-slate-950">
                      {timeSlot.startTime} — {timeSlot.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <Timer className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Total Durasi</p>
                    <p className="mt-1 text-lg font-bold text-slate-950">
                      {timeSlot.durationMinutes} Menit{" "}
                      <span className="text-base font-medium text-slate-400">
                        ({timeSlot.durationMinutes / 60} Jam)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-700">
                Status & Kondisi
              </h3>

              <div className="mt-5 space-y-5">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Status Operasional</p>
                    <p className="mt-1 text-lg font-bold text-slate-950">
                      {timeSlot.status}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                    <CalendarCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Berlaku Pada</p>
                    <p className="mt-1 text-lg font-bold text-slate-950">
                      {timeSlot.activeDays}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            size="lg"
            className="rounded-2xl px-5 font-bold"
            onClick={onClose}
          >
            Tutup
          </Button>

          <Button
            size="lg"
            className="rounded-2xl bg-slate-950 px-5 font-bold hover:bg-slate-800"
            leftIcon={<Pencil className="h-4 w-4" />}
            onClick={() => onEdit(timeSlot)}
          >
            Edit Informasi
          </Button>
        </div>
      </div>
    </Modal>
  );
}
