import { CheckCircle2, Clock3, MessageCircle, PauseCircle, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import type { AdminWhatsAppLogStats } from "@/types/adminWhatsAppLog";

interface AdminWhatsAppLogsStatsProps {
  stats: AdminWhatsAppLogStats;
}

const statItems = [
  { key: "total", label: "Total Log", icon: MessageCircle, className: "bg-blue-50 text-blue-700" },
  { key: "sent", label: "Terkirim", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700" },
  { key: "pending", label: "Pending", icon: Clock3, className: "bg-amber-50 text-amber-700" },
  { key: "skipped", label: "Dilewati", icon: PauseCircle, className: "bg-slate-100 text-slate-700" },
  { key: "failed", label: "Gagal", icon: XCircle, className: "bg-red-50 text-red-700" },
] as const;

export default function AdminWhatsAppLogsStats({ stats }: AdminWhatsAppLogsStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {statItems.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key] ?? 0;

        return (
          <Card key={item.key} className="min-w-0 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${item.className}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
