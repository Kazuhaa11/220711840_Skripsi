import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { Clock3 } from "lucide-react";
import type { CoursePackageItem } from "@/features/participant/components/available-schedule/SelectPackageView";

interface CoursePackageCardProps {
  item: CoursePackageItem;
  isSelected: boolean;
  onSelect: () => void;
}

export default function CoursePackageCard({
  item,
  isSelected,
  onSelect,
}: CoursePackageCardProps) {
  const Icon = item.icon;

  return (
    <Card
      className={cn(
        "min-w-0 rounded-2xl p-4 shadow-sm transition sm:rounded-3xl sm:p-5",
        isSelected && "ring-2 ring-blue-600",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white sm:h-12 sm:w-12">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        <Badge
          variant="success"
          className="px-3 text-[11px] font-bold uppercase tracking-[0.08em]"
        >
          Sertifikat
        </Badge>
      </div>

      <h3 className="mt-4 break-words text-lg font-bold leading-tight tracking-tight text-slate-950 sm:mt-5 sm:text-xl">
        {item.name}
      </h3>

      <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-600">
        <Clock3 className="h-4 w-4" />
        {item.duration}
      </p>

      <p className="mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7">{item.summary}</p>

      <div className="mt-4 space-y-2 text-sm sm:mt-6">
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Standar</span>
          <span className="font-semibold text-slate-900">
            {item.prices.standard}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Layanan Antar</span>
          <span className="font-semibold text-slate-900">
            {item.prices.antarJemput}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">Dengan SIM A</span>
          <span className="font-semibold text-slate-900">
            {item.prices.denganSim}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-slate-500">SIM + Antar</span>
          <span className="font-semibold text-slate-900">
            {item.prices.denganSimAntarJemput}
          </span>
        </div>
      </div>

      <div className="mt-4 sm:mt-6">
        <Button
          fullWidth
          variant={isSelected ? "primary" : "secondary"}
          className="h-10 rounded-2xl text-xs font-bold uppercase tracking-[0.08em] sm:h-11 sm:text-sm"
          onClick={onSelect}
        >
          {isSelected ? "Paket Dipilih" : "Pilih Paket"}
        </Button>
      </div>
    </Card>
  );
}
