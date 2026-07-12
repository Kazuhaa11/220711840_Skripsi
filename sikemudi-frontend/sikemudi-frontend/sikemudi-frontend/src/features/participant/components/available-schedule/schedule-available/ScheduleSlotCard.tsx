import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type {
  AvailableScheduleSlot,
  SlotStatus,
} from "@/features/participant/constants/type";
import { CarFront, Clock3, SearchCheck, UserRound } from "lucide-react";

interface ScheduleSlotCardProps {
  slot: AvailableScheduleSlot;
  onViewDetail: (slot: AvailableScheduleSlot) => void;
  onBook: (slot: AvailableScheduleSlot) => void;
}

function getAccentClassName(status: SlotStatus) {
  if (status === "TERSEDIA") return "border-l-emerald-400";
  if (status === "HAMPIR_PENUH") return "border-l-red-500";
  return "border-l-slate-300";
}

function getStatusVariant(status: SlotStatus) {
  if (status === "TERSEDIA") return "success";
  if (status === "HAMPIR_PENUH") return "danger";
  return "default";
}

function getStatusLabel(status: SlotStatus) {
  if (status === "HAMPIR_PENUH") return "HAMPIR PENUH";
  return status;
}

function getQuotaLabel(slot: AvailableScheduleSlot) {
  if (slot.status === "HAMPIR_PENUH" && slot.remainingQuota === 1) {
    return "Hanya 1 Slot!";
  }

  return `${slot.remainingQuota} Peserta`;
}

export default function ScheduleSlotCard({
  slot,
  onViewDetail,
  onBook,
}: ScheduleSlotCardProps) {
  return (
    <Card
      className={cn(
        "min-w-0 rounded-2xl border-l-4 p-4 shadow-sm sm:rounded-3xl sm:p-6",
        getAccentClassName(slot.status),
      )}
    >
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-[120px_minmax(0,1fr)_140px] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
            {slot.dayLabel}
          </p>
          <p className="mt-1 text-2xl font-extrabold leading-none tracking-tight text-slate-950 sm:text-3xl">
            {slot.dayNumber}
          </p>
          <p className="mt-1 text-xs uppercase tracking-widest text-slate-500">
            {slot.monthYearLabel}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 sm:h-11 sm:w-11">
              <Clock3 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Jam Sesi
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-950 sm:text-base">
                {slot.timeRange}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 sm:h-11 sm:w-11">
              <UserRound className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Instruktur
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-950 sm:text-base">
                {slot.instructorName}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 sm:h-11 sm:w-11">
              <CarFront className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Unit Mobil
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-950 sm:text-base">
                {slot.vehicleName}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 sm:h-11 sm:w-11">
              <SearchCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Sisa Kuota
              </p>
              <p
                className={cn(
                  "mt-1 text-sm font-semibold sm:text-base",
                  slot.status === "TERSEDIA"
                    ? "text-slate-950"
                    : slot.status === "HAMPIR_PENUH"
                      ? "text-red-600"
                      : "text-slate-400",
                )}
              >
                {getQuotaLabel(slot)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <Badge
            variant={getStatusVariant(slot.status)}
            className="justify-center px-3 font-bold uppercase tracking-[0.08em]"
          >
            {getStatusLabel(slot.status)}
          </Badge>

          <Button
            className="h-10 rounded-xl text-xs font-bold uppercase tracking-[0.08em] sm:h-11 sm:text-sm"
            onClick={() => onBook(slot)}
            disabled={slot.status === "PENUH"}
          >
            Booking
          </Button>

          <button
            type="button"
            onClick={() => onViewDetail(slot)}
            className="text-xs font-bold uppercase tracking-[0.08em] text-blue-600 transition hover:text-blue-700 sm:text-sm"
          >
            Lihat Detail
          </button>
        </div>
      </div>
    </Card>
  );
}
