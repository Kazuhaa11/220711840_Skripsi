import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import { adminTimeSlotStats } from "@/features/admin/constants/timeSlots";

export default function AdminTimeSlotsStats() {
  const stats: StatsGridItem[] = adminTimeSlotStats.map((item) => ({
    ...item,
    labelClassName:
      "text-xs font-bold uppercase tracking-[0.22em] text-slate-500",
    descriptionClassName: "text-sm font-bold uppercase",
  }));

  return <StatsGrid items={stats} iconPlacement="top" />;
}
