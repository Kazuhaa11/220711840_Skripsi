import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import { adminInstructorStats } from "@/features/admin/constants/instructors";

export default function AdminInstructorsStats() {
  const stats: StatsGridItem[] = adminInstructorStats.map((item) => ({
    ...item,
    labelClassName: "text-slate-400",
    descriptionClassName: "mt-4 text-sm font-semibold text-slate-600",
  }));

  return <StatsGrid items={stats} />;
}
