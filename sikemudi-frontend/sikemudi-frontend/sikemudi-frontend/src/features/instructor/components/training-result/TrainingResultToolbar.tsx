import { SlidersHorizontal } from "lucide-react";
import FilterBar from "@/components/common/FilterBar";
import Select from "@/components/ui/Select";
import { trainingResultStatusOptions } from "@/features/instructor/constants/trainingResult";

interface TrainingResultToolbarProps {
  statusValue: string;
  onStatusChange: (value: string) => void;
}

export default function TrainingResultToolbar({
  statusValue,
  onStatusChange,
}: TrainingResultToolbarProps) {
  return (
    <FilterBar
      className="border-0 bg-white/80 shadow-none"
      contentClassName="gap-4"
      actions={
        <div className="hidden items-center gap-2 text-xs font-bold text-slate-500 lg:flex">
          <SlidersHorizontal className="h-4 w-4" />
          Filter Hasil
        </div>
      }
    >
      <div className="grid gap-3 sm:max-w-xs">
        <Select
          value={statusValue}
          onChange={(event) => onStatusChange(event.target.value)}
          options={trainingResultStatusOptions}
          className="h-10 rounded-xl border-0 bg-white text-sm font-bold shadow-sm"
        />
      </div>
    </FilterBar>
  );
}
