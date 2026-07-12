import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import { cn } from "@/lib/cn";
import { myScheduleStats, type ScheduleStatItem } from "@/features/participant/constants/mySchedule";

interface MyScheduleStatsProps {
  stats?: ScheduleStatItem[];
}

function getAccentClassName(accent: "blue" | "green" | "slate") {
  if (accent === "blue") return "border-l-blue-600";
  if (accent === "green") return "border-l-emerald-500";
  return "border-l-slate-300";
}

export default function MyScheduleStats({ stats = myScheduleStats }: MyScheduleStatsProps) {
  const items: StatsGridItem[] = stats.map((item) => ({
    id: item.label,
    label: item.label,
    value: item.value,
    tone:
      item.accent === "green"
        ? "emerald"
        : item.accent === "slate"
          ? "slate"
          : "blue",
    cardClassName: cn(
      "rounded-[22px]",
      getAccentClassName(item.accent),
      item.highlighted && "border-blue-600",
    ),
    labelClassName:
      "text-[10px] font-bold uppercase tracking-[0.12em] text-slate-700 sm:text-[11px] sm:tracking-[0.18em]",
    valueClassName: cn(
      "mt-2 break-words text-2xl font-extrabold leading-tight tracking-tight text-slate-950 sm:mt-3",
      item.highlighted && "text-blue-600",
    ),
  }));

  return (
    <StatsGrid
      items={items}
      className="grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      cardClassName="min-h-[104px] min-w-0 rounded-[22px] p-3 sm:min-h-0 sm:p-5"
    />
  );
}
