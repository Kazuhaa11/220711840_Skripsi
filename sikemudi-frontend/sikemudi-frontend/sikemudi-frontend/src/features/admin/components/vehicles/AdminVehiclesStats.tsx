import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import { adminVehicleStats } from "@/features/admin/constants/vehicles";

export default function AdminVehiclesStats() {
  const stats: StatsGridItem[] = adminVehicleStats.map((item) => ({
    ...item,
    labelClassName:
      "text-xs font-bold uppercase tracking-[0.2em] text-slate-400",
    descriptionClassName: "text-sm font-medium text-slate-500",
    iconClassName:
      item.tone === "blue"
        ? "bg-blue-50 text-blue-700"
        : item.tone === "green"
          ? "bg-emerald-50 text-emerald-700"
          : item.tone === "amber"
            ? "bg-amber-50 text-amber-700"
            : "bg-red-50 text-red-700",
  }));

  return <StatsGrid items={stats} iconPlacement="top" />;
}
