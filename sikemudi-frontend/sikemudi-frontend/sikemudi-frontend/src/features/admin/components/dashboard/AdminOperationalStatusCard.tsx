import { AlertTriangle, Car, Clock3, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { mapAdminOperationalStatuses } from "@/features/dashboard/utils/dashboardMapper";
import type { AdminDashboardOperationalStatusMap } from "@/types/dashboard";

interface AdminOperationalStatusCardProps {
  operationalStatus: AdminDashboardOperationalStatusMap;
}

const toneClass = {
  green: "bg-emerald-400 text-slate-950",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
  slate: "bg-slate-100 text-slate-700",
};

const iconMap = {
  slot_hampir_penuh: Clock3,
  kendaraan_sedang_digunakan: Car,
  jadwal_perlu_perhatian: AlertTriangle,
  sertifikat_menunggu: ShieldCheck,
};

export default function AdminOperationalStatusCard({
  operationalStatus,
}: AdminOperationalStatusCardProps) {
  const items = mapAdminOperationalStatuses(operationalStatus);

  return (
    <Card className="overflow-hidden rounded-3xl border-slate-950 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/15">
      <h2 className="text-lg font-bold tracking-tight text-white">
        Status Operasional
      </h2>

      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const Icon = iconMap[item.id as keyof typeof iconMap];

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl bg-white/10 px-4 py-4"
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  toneClass[item.tone],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold leading-5 text-white">{item.title}</p>
                <p className="mt-1 text-sm leading-5 text-slate-300">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
