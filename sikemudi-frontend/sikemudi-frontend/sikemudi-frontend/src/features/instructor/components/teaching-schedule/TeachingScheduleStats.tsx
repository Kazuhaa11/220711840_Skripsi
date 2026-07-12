import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import { cn } from "@/lib/cn";
import {
  teachingScheduleStats,
  type TeachingScheduleStat,
} from "@/features/instructor/constants/teachingSchedule";

interface TeachingScheduleStatsProps {
  items?: TeachingScheduleStat[];
}

const statToneClass = {
  blue: "border-l-blue-600",
  navy: "border-l-slate-950",
  green: "border-l-emerald-400",
  red: "border-l-red-600",
};

const valueToneClass = {
  blue: "text-slate-950",
  navy: "text-slate-950",
  green: "text-emerald-500",
  red: "text-red-600",
};

export default function TeachingScheduleStats({
  items: statItems = teachingScheduleStats,
}: TeachingScheduleStatsProps) {
  const items: StatsGridItem[] = statItems.map((item) => ({
    id: item.id,
    label: item.label,
    value: (
      <>
        <span>{item.value}</span>
        {item.suffix ? (
          <span className="pb-1 text-sm font-medium text-slate-900">
            {item.suffix}
          </span>
        ) : null}
      </>
    ),
    tone: item.tone === "navy" ? "slate" : item.tone,
    cardClassName: cn("px-5 py-5", statToneClass[item.tone]),
    labelClassName:
      "text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400",
    valueClassName: cn(
      "mt-3 flex items-end gap-2 text-2xl font-extrabold leading-tight tracking-tight",
      valueToneClass[item.tone],
    ),
  }));

  return <StatsGrid items={items} />;
}
