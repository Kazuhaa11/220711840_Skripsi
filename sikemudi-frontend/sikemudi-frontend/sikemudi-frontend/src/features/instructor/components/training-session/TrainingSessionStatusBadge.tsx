import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { TrainingSessionStatus } from "@/features/instructor/constants/trainingSession";

interface TrainingSessionStatusBadgeProps {
  status: TrainingSessionStatus;
}

const statusClass: Record<TrainingSessionStatus, string> = {
  "AKAN DATANG": "bg-blue-100 text-blue-700",
  BERLANGSUNG: "bg-emerald-100 text-emerald-700",
  "MENUNGGU INPUT": "bg-amber-100 text-amber-700",
  SELESAI: "bg-slate-100 text-slate-600",
  DIBATALKAN: "bg-red-100 text-red-700",
};

const dotClass: Record<TrainingSessionStatus, string> = {
  "AKAN DATANG": "bg-blue-600",
  BERLANGSUNG: "bg-emerald-600",
  "MENUNGGU INPUT": "bg-amber-600",
  SELESAI: "bg-slate-500",
  DIBATALKAN: "bg-red-600",
};

export default function TrainingSessionStatusBadge({
  status,
}: TrainingSessionStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "gap-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]",
        statusClass[status],
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", dotClass[status])} />
      {status}
    </Badge>
  );
}
