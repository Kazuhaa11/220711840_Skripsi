import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import { adminParticipantStats } from "@/features/admin/constants/participants";

export default function AdminParticipantsStats() {
  const stats: StatsGridItem[] = adminParticipantStats.map((item) => ({
    ...item,
    tone: item.tone === "navy" ? "slate" : item.tone,
    cardClassName:
      item.tone === "navy"
        ? "border-slate-950 bg-slate-950 text-white"
        : item.tone === "blue"
          ? "border-l-4 border-l-blue-600"
          : item.tone === "green"
            ? "border-l-4 border-l-emerald-500"
            : "border-l-4 border-l-amber-500",
    labelClassName:
      item.tone === "navy" ? "text-slate-300" : "text-slate-400",
    valueClassName: item.tone === "navy" ? "mt-3 text-white" : "mt-3",
    descriptionClassName:
      item.tone === "navy"
        ? "text-sm font-semibold text-slate-300"
        : item.tone === "amber"
          ? "text-sm font-semibold text-orange-600"
          : "text-sm font-semibold text-slate-500",
    iconClassName:
      item.tone === "navy" ? "bg-white/10 text-emerald-300" : undefined,
  }));

  return <StatsGrid items={stats} variant="plain" />;
}
