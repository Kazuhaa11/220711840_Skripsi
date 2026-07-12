import type { LucideIcon } from "lucide-react";
import { Award, BadgeCheck } from "lucide-react";
import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import type { InstructorProfileData } from "@/features/instructor/constants/instructorProfile";

interface InstructorProfileStatItem {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "green" | "blue";
}

interface InstructorProfileStatsProps {
  profile: InstructorProfileData;
}

export default function InstructorProfileStats({
  profile,
}: InstructorProfileStatsProps) {
  const stats: InstructorProfileStatItem[] = [
    {
      id: "experience",
      label: "Pengalaman",
      value: profile.experience,
      icon: Award,
      tone: "green",
    },
    {
      id: "certification",
      label: "Sertifikasi",
      value: profile.certification,
      icon: BadgeCheck,
      tone: "blue",
    },
  ];

  const statItems: StatsGridItem[] = stats.map((item) => ({
    ...item,
    tone: item.tone === "green" ? "emerald" : "blue",
    labelClassName: "text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600",
    valueClassName: "mt-1 text-xl font-extrabold leading-tight text-slate-950",
    descriptionClassName: "mt-1 text-xs font-medium text-slate-600",
    iconClassName:
      item.tone === "green"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-blue-50 text-blue-700",
  }));

  return (
    <StatsGrid
      items={statItems}
      iconPlacement="left"
      className="lg:grid-cols-2 xl:grid-cols-2"
    />
  );
}
