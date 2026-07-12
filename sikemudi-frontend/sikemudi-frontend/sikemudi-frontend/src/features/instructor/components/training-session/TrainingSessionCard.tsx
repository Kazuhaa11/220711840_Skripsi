import { Car, Clock3, MapPin, PackageCheck, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import type { TrainingSessionItem } from "@/features/instructor/constants/trainingSession";
import TrainingSessionStatusBadge from "@/features/instructor/components/training-session/TrainingSessionStatusBadge";

interface TrainingSessionCardProps {
  item: TrainingSessionItem;
}

export default function TrainingSessionCard({ item }: TrainingSessionCardProps) {
  return (
    <Card className="overflow-hidden rounded-3xl border border-slate-100 p-4 shadow-md shadow-slate-200/70">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">
            {item.sessionCode}
          </p>
          <h3 className="mt-2 text-base font-extrabold tracking-tight text-slate-950">
            {item.day}, {item.date}
          </h3>
        </div>

        <TrainingSessionStatusBadge status={item.status} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex gap-3">
          <Clock3 className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
          <div>
            <p className="text-sm font-bold text-slate-950">{item.time}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {item.duration}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Car className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
          <div>
            <p className="text-sm font-bold text-slate-950">
              {item.vehicleName}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {item.vehiclePlate} • {item.transmission}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Users className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
          <div>
            <p className="text-sm font-bold text-slate-950">
              {item.participantCount} Peserta
            </p>
            <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">
              {item.participantNames.join(", ") || "Belum ada peserta"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <MapPin className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
          <div>
            <p className="text-sm font-bold text-slate-950">{item.location}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {item.lastUpdated}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
        <PackageCheck className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Paket Latihan
          </p>
          <p className="mt-1 text-sm font-bold text-slate-800">
            {item.packageName}
          </p>
        </div>
      </div>
    </Card>
  );
}
