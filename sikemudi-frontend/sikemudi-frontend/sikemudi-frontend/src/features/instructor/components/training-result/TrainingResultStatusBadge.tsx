import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { TrainingResultStatus } from "@/features/instructor/constants/trainingResult";

interface TrainingResultStatusBadgeProps {
  status: TrainingResultStatus;
}

const statusClass: Record<TrainingResultStatus, string> = {
  BERLANGSUNG: "bg-blue-100 text-blue-700",
  "MENUNGGU EVALUASI": "bg-red-100 text-red-700",
  DRAFT: "bg-amber-100 text-amber-700",
  SELESAI: "bg-emerald-100 text-emerald-700",
  "BELUM DINILAI": "bg-amber-100 text-amber-700",
  "BELUM SAATNYA": "bg-slate-100 text-slate-600",
  "MELEWATI BATAS": "bg-red-100 text-red-700",
  LULUS: "bg-emerald-100 text-emerald-700",
  "TIDAK LULUS": "bg-red-100 text-red-700",
};

const dotClass: Record<TrainingResultStatus, string> = {
  BERLANGSUNG: "bg-blue-600",
  "MENUNGGU EVALUASI": "bg-red-600",
  DRAFT: "bg-amber-600",
  SELESAI: "bg-emerald-600",
  "BELUM DINILAI": "bg-amber-600",
  "BELUM SAATNYA": "bg-slate-500",
  "MELEWATI BATAS": "bg-red-600",
  LULUS: "bg-emerald-600",
  "TIDAK LULUS": "bg-red-600",
};

export default function TrainingResultStatusBadge({
  status,
}: TrainingResultStatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "gap-2 px-2.5 py-1 text-[10px] font-bold",
        statusClass[status],
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", dotClass[status])} />
      {status}
    </Badge>
  );
}
