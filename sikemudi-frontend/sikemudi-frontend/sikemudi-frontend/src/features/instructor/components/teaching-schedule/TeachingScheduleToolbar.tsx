import { CalendarDays, List, RotateCcw } from "lucide-react";
import FilterBar from "@/components/common/FilterBar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { scheduleStatusOptions } from "@/features/instructor/constants/teachingSchedule";

export type TeachingScheduleViewMode = "table" | "calendar";

interface TeachingScheduleToolbarProps {
  statusValue: string;
  dateValue: string;
  viewMode: TeachingScheduleViewMode;
  onStatusChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onViewModeChange: (value: TeachingScheduleViewMode) => void;
  onResetFilter: () => void;
}

export default function TeachingScheduleToolbar({
  statusValue,
  dateValue,
  viewMode,
  onStatusChange,
  onDateChange,
  onViewModeChange,
  onResetFilter,
}: TeachingScheduleToolbarProps) {
  return (
    <FilterBar className="border-0 bg-white/80 shadow-none" contentClassName="gap-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex rounded-2xl bg-white p-1 shadow-sm">
          <Button
            type="button"
            variant={viewMode === "table" ? "primary" : "ghost"}
            className={
              viewMode === "table"
                ? "h-9 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800"
                : "h-9 rounded-xl px-4 text-xs font-bold text-slate-500"
            }
            leftIcon={<List className="h-4 w-4" />}
            onClick={() => onViewModeChange("table")}
          >
            Tampilan Tabel
          </Button>

          <Button
            type="button"
            variant={viewMode === "calendar" ? "primary" : "ghost"}
            className={
              viewMode === "calendar"
                ? "h-9 rounded-xl bg-slate-950 px-4 text-xs font-bold text-white hover:bg-slate-800"
                : "h-9 rounded-xl px-4 text-xs font-bold text-slate-500"
            }
            leftIcon={<CalendarDays className="h-4 w-4" />}
            onClick={() => onViewModeChange("calendar")}
          >
            Kalender
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,180px)_minmax(0,180px)_auto]">
          <Select
            value={statusValue}
            onChange={(event) => onStatusChange(event.target.value)}
            options={scheduleStatusOptions}
            className="h-10 rounded-xl border-0 bg-white px-4 text-sm font-bold shadow-sm"
          />

          <Input
            type="date"
            value={dateValue}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-10 rounded-xl border-0 bg-white px-4 text-sm font-bold shadow-sm"
          />

          <Button
            type="button"
            variant="outline"
            onClick={onResetFilter}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="h-10 rounded-xl border-slate-200 px-4 text-xs font-bold text-slate-700"
          >
            Reset
          </Button>
        </div>
      </div>
    </FilterBar>
  );
}
