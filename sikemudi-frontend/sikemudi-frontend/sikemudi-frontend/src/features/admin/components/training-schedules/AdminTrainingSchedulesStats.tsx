import { AlertTriangle, CalendarDays, Clock3, LayoutGrid } from "lucide-react";
import StatsGrid, { type StatsGridItem } from "@/components/common/StatsGrid";
import type { AdminTrainingSchedule } from "@/features/admin/constants/trainingSchedules";

interface AdminTrainingSchedulesStatsProps {
  schedules: AdminTrainingSchedule[];
  totalItems?: number;
}

export default function AdminTrainingSchedulesStats({
  schedules,
  totalItems,
}: AdminTrainingSchedulesStatsProps) {
  const totalCapacity = schedules.reduce((sum, item) => sum + item.quota, 0);
  const totalBookings = schedules.reduce((sum, item) => sum + item.participantCount, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;
  const availableCount = schedules.filter((item) => item.status === "Tersedia").length;
  const attentionCount = schedules.filter(
    (item) => item.status === "Penuh" || item.status === "Dibatalkan",
  ).length;

  const stats: StatsGridItem[] = [
    {
      id: "total",
      label: "Total Jadwal",
      value: String(totalItems ?? schedules.length),
      description: "Sesi",
      icon: CalendarDays,
      tone: "blue",
      labelClassName:
        "text-xs font-bold uppercase tracking-[0.2em] text-slate-700",
      descriptionClassName: "text-sm font-medium text-slate-600",
    },
    {
      id: "available",
      label: "Tersedia",
      value: String(availableCount),
      description: "Pada halaman ini",
      icon: Clock3,
      tone: "slate",
      labelClassName:
        "text-xs font-bold uppercase tracking-[0.2em] text-slate-700",
      descriptionClassName: "text-sm font-medium text-slate-600",
    },
    {
      id: "capacity",
      label: "Slot Terisi",
      value: `${occupancyRate}%`,
      description: `${totalBookings}/${totalCapacity || 0} kursi`,
      icon: LayoutGrid,
      tone: "green",
      labelClassName:
        "text-xs font-bold uppercase tracking-[0.2em] text-slate-700",
      descriptionClassName: "text-sm font-medium text-slate-600",
    },
    {
      id: "attention",
      label: "Penuh/Batal",
      value: String(attentionCount),
      description: "Pada halaman ini",
      icon: AlertTriangle,
      tone: "red",
      labelClassName:
        "text-xs font-bold uppercase tracking-[0.2em] text-slate-700",
      descriptionClassName: "text-sm font-medium text-slate-600",
    },
  ];

  return <StatsGrid items={stats} iconPlacement="top" />;
}
