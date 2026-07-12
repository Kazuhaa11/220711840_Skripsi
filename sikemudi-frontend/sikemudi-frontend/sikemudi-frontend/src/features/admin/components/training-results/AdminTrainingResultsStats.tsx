import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import type { AdminTrainingResult } from "@/features/admin/constants/trainingResults";
import { buildAdminTrainingResultStats } from "@/features/admin/constants/trainingResults";

interface AdminTrainingResultsStatsProps {
  results: AdminTrainingResult[];
}

export default function AdminTrainingResultsStats({
  results,
}: AdminTrainingResultsStatsProps) {
  const stats: StatsGridItem[] = buildAdminTrainingResultStats(results).map(
    (item) => ({
      ...item,
      iconClassName:
        item.tone === "emerald" ? "bg-emerald-50 text-emerald-700" : undefined,
    }),
  );

  return <StatsGrid items={stats} variant="plain" iconPlacement="top" />;
}
