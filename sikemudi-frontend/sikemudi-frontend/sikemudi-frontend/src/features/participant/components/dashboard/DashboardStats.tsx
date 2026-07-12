import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import {
  formatDashboardUnit,
  mapSummaryCardValue,
} from "@/features/dashboard/utils/dashboardMapper";
import type { DashboardSummaryCardMap } from "@/types/dashboard";

interface DashboardStatsProps {
  summaryCards: DashboardSummaryCardMap;
}

const summaryConfig = [
  { key: "jadwal_aktif", fallbackLabel: "JADWAL AKTIF" },
  { key: "total_booking", fallbackLabel: "TOTAL BOOKING" },
  { key: "riwayat_latihan", fallbackLabel: "RIWAYAT LATIHAN" },
  { key: "status_sertifikat", fallbackLabel: "STATUS SERTIFIKAT", highlighted: true },
];

export default function DashboardStats({ summaryCards }: DashboardStatsProps) {
  const items: StatsGridItem[] = summaryConfig.map((item) => {
    const card = summaryCards[item.key];

    return {
      id: item.key,
      label: (card?.label ?? item.fallbackLabel).toUpperCase(),
      value: mapSummaryCardValue(summaryCards, item.key),
      description: formatDashboardUnit(card?.unit),
      tone: item.highlighted ? "blue" : "slate",
      cardClassName: item.highlighted ? "min-w-0 border-blue-600" : "min-w-0",
      labelClassName: "text-[10px] font-bold tracking-[0.12em] text-slate-700 sm:text-[11px] sm:tracking-[0.18em]",
      valueClassName: item.highlighted
        ? "mt-2 break-words text-2xl font-extrabold leading-tight tracking-tight text-blue-700 sm:mt-3 sm:text-3xl"
        : "mt-2 break-words text-2xl font-extrabold leading-tight tracking-tight text-slate-950 sm:mt-3 sm:text-3xl",
      descriptionClassName: "mt-1 text-[11px] font-normal text-slate-500 sm:text-xs",
    };
  });

  return (
    <StatsGrid
      items={items}
      variant="plain"
      className="grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      cardClassName="min-h-[104px] min-w-0 rounded-[22px] px-3 py-3 sm:min-h-0 sm:px-5 sm:py-5"
    />
  );
}
