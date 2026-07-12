import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import { adminCoursePackageStats } from "@/features/admin/constants/coursePackages";

export default function AdminCoursePackagesStats() {
  const stats: StatsGridItem[] = adminCoursePackageStats.map((item) => ({
    ...item,
    valueClassName: "text-xl leading-tight",
    descriptionClassName: "text-sm font-medium text-slate-600",
  }));

  return (
    <StatsGrid
      items={stats}
      className="lg:grid-cols-3 xl:grid-cols-3"
      cardClassName="p-5"
    />
  );
}
