import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import { cn } from "@/lib/cn";

interface CertificateStatItem {
  label: string;
  value: string;
  description?: string;
  accent?: "blue" | "green" | "slate";
  valueClassName?: string;
}

interface CertificateSummaryStatsProps {
  items: CertificateStatItem[];
}

export default function CertificateSummaryStats({
  items,
}: CertificateSummaryStatsProps) {
  const statItems: StatsGridItem[] = items.map((item) => ({
    id: item.label,
    label: item.label,
    value: item.value,
    description: item.description,
    tone:
      item.accent === "green"
        ? "emerald"
        : item.accent === "slate"
          ? "slate"
          : "blue",
    cardClassName: cn(
      "min-w-0",
      item.accent === "blue" && "border-l-4 border-l-blue-600",
      item.accent === "green" && "border-l-4 border-l-emerald-500",
      item.accent === "slate" && "border-l-4 border-l-slate-300",
    ),
    labelClassName:
      "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600",
    valueClassName: cn(
      "mt-3 text-2xl font-extrabold leading-tight text-slate-950",
      item.valueClassName,
    ),
    descriptionClassName: "mt-1 text-xs font-normal text-slate-600",
  }));

  return (
    <StatsGrid
      items={statItems}
      variant="plain"
      className="grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
      cardClassName="min-h-[104px] min-w-0 rounded-[22px] p-3 sm:min-h-0 sm:p-5"
    />
  );
}
