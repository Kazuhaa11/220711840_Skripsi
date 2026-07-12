import { useState } from "react";
import { CalendarDays, List, RotateCcw, SlidersHorizontal } from "lucide-react";
import FilterBar from "@/components/common/FilterBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Select, { type SelectOption } from "@/components/ui/Select";
import {
  trainingSessionDayOptions,
  type TrainingSessionViewMode,
} from "@/features/instructor/constants/trainingSession";
import { cn } from "@/lib/cn";

interface TrainingSessionToolbarProps {
  dayValue: string;
  slotValue: string;
  slotOptions: SelectOption[];
  viewMode: TrainingSessionViewMode;
  onDayChange: (value: string) => void;
  onSlotChange: (value: string) => void;
  onViewModeChange: (value: TrainingSessionViewMode) => void;
  onReset: () => void;
}

function getOptionLabel(options: SelectOption[], value: string) {
  return options.find((item) => item.value === value)?.label ?? value;
}

export default function TrainingSessionToolbar({
  dayValue,
  slotValue,
  slotOptions,
  viewMode,
  onDayChange,
  onSlotChange,
  onViewModeChange,
  onReset,
}: TrainingSessionToolbarProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const activeFilterCount =
    (dayValue !== "all" ? 1 : 0) + (slotValue !== "all" ? 1 : 0);

  const viewSwitcher = (
    <div className="grid grid-cols-2 rounded-2xl bg-white p-1 shadow-sm sm:inline-grid">
      <Button
        type="button"
        variant="ghost"
        className={cn(
          "h-9 rounded-xl px-3 text-[11px] font-bold text-slate-500 sm:px-4 sm:text-xs",
          viewMode === "table" &&
            "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
        )}
        leftIcon={<List className="h-4 w-4" />}
        onClick={() => onViewModeChange("table")}
      >
        Tabel
      </Button>

      <Button
        type="button"
        variant="ghost"
        className={cn(
          "h-9 rounded-xl px-3 text-[11px] font-bold text-slate-500 sm:px-4 sm:text-xs",
          viewMode === "calendar" &&
            "bg-slate-950 text-white shadow-sm hover:bg-slate-800",
        )}
        leftIcon={<CalendarDays className="h-4 w-4" />}
        onClick={() => onViewModeChange("calendar")}
      >
        Kalender
      </Button>
    </div>
  );

  return (
    <>
      <FilterBar
        className="border-0 bg-white/80 p-3 shadow-none sm:p-4"
        contentClassName="gap-3"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {viewSwitcher}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFilterOpen(true)}
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
              className="h-10 rounded-xl border-slate-200 px-4 text-xs font-bold text-slate-700"
            >
              Atur Filter
              {activeFilterCount > 0 ? (
                <span className="ml-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>

            {activeFilterCount > 0 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={onReset}
                className="h-10 rounded-xl px-3 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Reset
              </Button>
            ) : null}
          </div>
        </div>

        {activeFilterCount > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {dayValue !== "all" ? (
              <Badge className="bg-blue-50 text-[11px] font-bold text-blue-700">
                {getOptionLabel(trainingSessionDayOptions, dayValue)}
              </Badge>
            ) : null}
            {slotValue !== "all" ? (
              <Badge className="bg-slate-100 text-[11px] font-bold text-slate-700">
                {getOptionLabel(slotOptions, slotValue)}
              </Badge>
            ) : null}
          </div>
        ) : null}
      </FilterBar>

      <Modal
        opened={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter Sesi Latihan"
        description="Pilih hari atau slot yang ditugaskan kepada instruktur."
        size="sm"
        compact
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onReset();
                setFilterOpen(false);
              }}
              leftIcon={<RotateCcw className="h-4 w-4" />}
              className="h-11 rounded-xl text-xs font-bold"
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="h-11 rounded-xl bg-slate-950 text-xs font-bold text-white hover:bg-slate-800"
            >
              Terapkan
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Hari"
            value={dayValue}
            onChange={(event) => onDayChange(event.target.value)}
            options={trainingSessionDayOptions}
            className="h-11 rounded-xl bg-slate-50 text-sm font-bold"
          />

          <Select
            label="Slot Waktu"
            value={slotValue}
            onChange={(event) => onSlotChange(event.target.value)}
            options={slotOptions}
            className="h-11 rounded-xl bg-slate-50 text-sm font-bold"
          />
        </div>
      </Modal>
    </>
  );
}
