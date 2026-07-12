import { CalendarDays, Car, Check, List, Play, Users, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Drawer from "@/components/ui/Drawer";
import { cn } from "@/lib/cn";
import type {
  TeachingScheduleItem,
  TeachingScheduleParticipant,
  TeachingScheduleStatus,
} from "@/features/instructor/constants/teachingSchedule";

interface TeachingScheduleDetailDrawerProps {
  opened: boolean;
  schedule: TeachingScheduleItem | null;
  onClose: () => void;
  onOpenSession?: (schedule: TeachingScheduleItem) => void;
}

const statusBadgeClass: Record<TeachingScheduleStatus, string> = {
  BERLANGSUNG: "bg-blue-600 text-white",
  "AKAN DATANG": "bg-blue-600 text-white",
  "MENUNGGU INPUT": "bg-red-600 text-white",
  SELESAI: "bg-emerald-600 text-white",
};

const statusDotClass: Record<TeachingScheduleStatus, string> = {
  BERLANGSUNG: "bg-emerald-300",
  "AKAN DATANG": "bg-emerald-300",
  "MENUNGGU INPUT": "bg-white",
  SELESAI: "bg-white",
};

const participantAvatarClass: Record<
  TeachingScheduleParticipant["avatarTone"],
  string
> = {
  blue: "bg-blue-100 text-blue-700",
  slate: "bg-slate-200 text-slate-700",
  green: "bg-emerald-300 text-slate-950",
};

function DetailInfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-slate-100/80 px-4 py-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">
        {label}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ParticipantRow({
  participant,
}: {
  participant: TeachingScheduleParticipant;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-100/80 px-4 py-3">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          participantAvatarClass[participant.avatarTone],
        )}
      >
        {participant.initials}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-950">
          {participant.name}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-500">
          {participant.packageName} —{" "}
          <span className="font-bold text-blue-700">
            {participant.sessionLabel}
          </span>
        </p>
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
          {participant.attendanceStatus}
        </span>

        <span className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-slate-300 bg-slate-100 text-transparent">
          <Check className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

export default function TeachingScheduleDetailDrawer({
  opened,
  schedule,
  onClose,
  onOpenSession,
}: TeachingScheduleDetailDrawerProps) {
  if (!schedule) return null;

  const participantCount = schedule.detail.participants.length;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="lg"
      showCloseButton={false}
      className="max-w-155 bg-slate-50"
      bodyClassName="p-0"
      overlayClassName="bg-slate-950/40 backdrop-blur-[3px]"
      footer={
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
          <Button
            variant="outline"
            className="h-11 rounded-xl border-slate-300 bg-white text-xs font-bold uppercase tracking-[0.08em] text-slate-950"
            onClick={onClose}
          >
            Tutup
          </Button>

          <Button
            className="h-11 rounded-xl bg-slate-950 text-xs font-bold uppercase tracking-[0.08em] text-white shadow-xl shadow-slate-900/20 hover:bg-slate-800"
            leftIcon={<Play className="h-4 w-4 fill-current" />}
            onClick={() => onOpenSession?.(schedule)}
          >
            Buka Sesi
          </Button>
        </div>
      }
    >
      <div className="bg-slate-950 px-5 pb-6 pt-6 text-white sm:px-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-300">
              ID Sesi: {schedule.detail.sessionCode}
            </p>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
              Detail Sesi Mengajar
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition hover:bg-white/10"
            aria-label="Tutup detail sesi"
          >
            <X className="h-7 w-7" />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Badge
            className={cn(
              "w-fit gap-2 px-3 py-1.5 text-[11px] font-bold",
              statusBadgeClass[schedule.status],
            )}
          >
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                statusDotClass[schedule.status],
              )}
            />
            {schedule.status}
          </Badge>

          <p className="text-sm font-medium text-slate-300">
            {schedule.detail.updatedAt}
          </p>
        </div>
      </div>

      <div className="space-y-6 px-5 py-6 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailInfoCard label="Waktu & Tanggal">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-1 h-4 w-4 shrink-0 text-slate-950" />
              <div>
                <p className="text-base font-bold text-slate-950">
                  {schedule.day}, {schedule.date}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-950">
                  {schedule.time} (2 Jam)
                </p>
              </div>
            </div>
          </DetailInfoCard>

          <DetailInfoCard label="Kendaraan Operasional">
            <div className="flex items-start gap-3">
              <Car className="mt-1 h-4 w-4 shrink-0 text-slate-950" />
              <div>
                <p className="text-base font-bold text-slate-950">
                  {schedule.vehicleName}
                </p>
                <span className="mt-2 inline-flex rounded-md bg-blue-50 px-3 py-1 text-sm font-bold tracking-[0.12em] text-blue-700">
                  {schedule.vehiclePlate}
                </span>
              </div>
            </div>
          </DetailInfoCard>
        </div>

        <section>
          <div className="flex items-center gap-3">
            <List className="h-5 w-5 text-blue-700" />
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-slate-950">
              Fokus Latihan
            </h3>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm italic leading-7 text-slate-700">
              “{schedule.detail.focus}”
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-700" />
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-slate-950">
                Daftar Peserta ({participantCount})
              </h3>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-0 text-xs font-bold uppercase text-blue-700 hover:bg-transparent"
            >
              Lihat Semua
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {schedule.detail.participants.map((participant) => (
              <ParticipantRow key={participant.id} participant={participant} />
            ))}
          </div>
        </section>
      </div>
    </Drawer>
  );
}
