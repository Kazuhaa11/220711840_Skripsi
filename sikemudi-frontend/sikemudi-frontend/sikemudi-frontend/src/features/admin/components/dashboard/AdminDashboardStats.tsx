import {
  BadgeCheck,
  CalendarDays,
  Car,
  ClipboardCheck,
  GraduationCap,
  Users,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import {
  mapSummaryCardDescription,
  mapSummaryCardValue,
} from "@/features/dashboard/utils/dashboardMapper";
import type { DashboardSummaryCardMap } from "@/types/dashboard";

interface AdminDashboardStatsProps {
  summaryCards: DashboardSummaryCardMap;
}

const summaryConfig = [
  {
    key: "peserta",
    fallbackLabel: "Peserta",
    icon: Users,
    tone: "slate" as const,
  },
  {
    key: "instruktur",
    fallbackLabel: "Instruktur",
    icon: GraduationCap,
    tone: "blue" as const,
  },
  {
    key: "kendaraan",
    fallbackLabel: "Kendaraan",
    icon: Car,
    tone: "green" as const,
  },
  {
    key: "jadwal",
    fallbackLabel: "Jadwal",
    icon: CalendarDays,
    tone: "blue" as const,
  },
  {
    key: "booking",
    fallbackLabel: "Booking",
    icon: ClipboardCheck,
    tone: "slate" as const,
  },
  {
    key: "sertifikat_terbit",
    fallbackLabel: "Sertifikat Terbit",
    icon: BadgeCheck,
    tone: "green" as const,
  },
];

export default function AdminDashboardStats({
  summaryCards,
}: AdminDashboardStatsProps) {
  const stats: StatsGridItem[] = summaryConfig.map((item) => ({
    id: item.key,
    label: (
      <Badge
        className="max-w-full truncate px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] sm:text-[10px] sm:tracking-[0.18em]"
        variant={item.tone === "blue" ? "info" : "default"}
      >
        {summaryCards[item.key]?.label ?? item.fallbackLabel}
      </Badge>
    ),
    value: mapSummaryCardValue(summaryCards, item.key),
    description: mapSummaryCardDescription(summaryCards, item.key),
    icon: item.icon,
    tone: item.tone,
    valueClassName:
      "mt-2 text-2xl font-extrabold leading-tight tracking-tight sm:mt-3 sm:text-3xl",
    descriptionClassName:
      "mt-1 text-[11px] font-normal leading-4 text-slate-500 sm:text-xs sm:leading-5",
    iconClassName: "h-9 w-9 rounded-2xl sm:h-10 sm:w-10",
  }));

  return (
    <StatsGrid
      items={stats}
      className="grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-6"
      cardClassName="min-h-[104px] min-w-0 rounded-[22px] px-3 py-3 sm:min-h-0 sm:px-5 sm:py-5"
    />
  );
}
