import StatsGrid, {
  type StatsGridItem,
  type StatsGridTone,
} from "@/components/common/StatsGrid";
import type { TrainingResultStat } from "@/features/instructor/constants/trainingResult";
import { trainingResultStats } from "@/features/instructor/constants/trainingResult";

interface TrainingResultStatsProps {
  items?: TrainingResultStat[];
}

const toneMap: Record<TrainingResultStat["tone"], StatsGridTone> = {
  blue: "blue",
  red: "red",
  amber: "amber",
  green: "emerald",
};

const valueToneClass: Record<TrainingResultStat["tone"], string> = {
  blue: "text-blue-700",
  red: "text-red-600",
  amber: "text-amber-600",
  green: "text-emerald-600",
};

export default function TrainingResultStats({
  items: statItems = trainingResultStats,
}: TrainingResultStatsProps) {
  const items: StatsGridItem[] = statItems.map((item) => ({
    id: item.id,
    label: item.label,
    value: item.value,
    description: item.description,
    icon: item.icon,
    tone: toneMap[item.tone],
    rightBadge: (
      <span className="max-w-28 text-right text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {item.label}
      </span>
    ),
    labelClassName: "sr-only mt-0",
    valueClassName: `mt-3 text-2xl font-extrabold leading-tight ${valueToneClass[item.tone]}`,
    descriptionClassName: "text-xs font-medium text-slate-600",
  }));

  return <StatsGrid items={items} iconPlacement="top" />;
}
