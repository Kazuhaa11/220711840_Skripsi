import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Circle, CircleCheckBig } from "lucide-react";

interface CertificateProgressCardProps {
  progressPercent: number;
  requirements: {
    id: string;
    label: string;
    completed: boolean;
  }[];
  onOpenSchedule: () => void;
}

export default function CertificateProgressCard({
  progressPercent,
  requirements,
  onOpenSchedule,
}: CertificateProgressCardProps) {
  return (
    <Card className="rounded-3xl p-5 shadow-sm">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-slate-950">
            Progres Pelatihan
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Selesaikan kursus untuk membuka sertifikat.
          </p>
        </div>

        <p className="text-2xl font-extrabold text-blue-600">{progressPercent}%</p>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-5 space-y-3">
        {requirements.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {item.completed ? (
              <CircleCheckBig className="h-4 w-4 text-emerald-600" />
            ) : (
              <Circle className="h-4 w-4 text-slate-400" />
            )}

            <span
              className={
                item.completed
                  ? "text-sm font-medium text-slate-900"
                  : "text-sm font-medium text-slate-500"
              }
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <Button
        fullWidth
        onClick={onOpenSchedule}
        className="mt-6 h-11 rounded-xl text-sm font-bold uppercase tracking-wide"
      >
        Lihat Jadwal Saya →
      </Button>
    </Card>
  );
}
