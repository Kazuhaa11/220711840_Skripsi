import { CalendarDays, ClipboardList, PlayCircle, Users } from "lucide-react";
import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import {
  formatDashboardUnit,
  mapSummaryCardValue,
} from "@/features/dashboard/utils/dashboardMapper";
import type { DashboardSummaryCardMap } from "@/types/dashboard";

interface InstructorDashboardStatsProps {
  summaryCards: DashboardSummaryCardMap;
}

const summaryConfig = [
  {
    key: "jadwal_hari_ini",
    icon: CalendarDays,
    tone: "blue" as const,
  },
  {
    key: "sesi_aktif",
    icon: PlayCircle,
    tone: "emerald" as const,
  },
  {
    key: "peserta_hari_ini",
    icon: Users,
    tone: "blue" as const,
    cardClassName: "border-l-indigo-300",
    iconClassName: "bg-indigo-100 text-indigo-700",
  },
  {
    key: "pending_hasil",
    icon: ClipboardList,
    tone: "red" as const,
  },
];

export default function InstructorDashboardStats({
  summaryCards,
}: InstructorDashboardStatsProps) {
  const stats: StatsGridItem[] = summaryConfig.map((item) => {
    const card = summaryCards[item.key];

    return {
      id: item.key,
      label: card?.label ?? "-",
      value: `${mapSummaryCardValue(summaryCards, item.key)}${
        card?.unit ? `\n${card.unit}` : ""
      }`,
      description: card?.description ?? formatDashboardUnit(card?.unit),
      icon: item.icon,
      tone: item.tone,
      rightBadge: (
        <span className="max-w-24 text-right text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
          {card?.label ?? "-"}
        </span>
      ),
      cardClassName: item.cardClassName,
      labelClassName: "sr-only mt-0",
      valueClassName:
        "mt-3 whitespace-pre-line text-2xl font-extrabold leading-tight tracking-tight",
      descriptionClassName: "mt-3 text-xs font-medium text-slate-700",
      iconClassName:
        item.iconClassName ??
        (item.tone === "emerald" ? "bg-emerald-950 text-emerald-300" : "rounded-xl"),
    };
  });

  return <StatsGrid items={stats} iconPlacement="top" />;
}
