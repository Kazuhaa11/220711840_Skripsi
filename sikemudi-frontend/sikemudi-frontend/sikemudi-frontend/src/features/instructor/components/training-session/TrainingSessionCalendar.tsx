import { CheckCircle2 } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { trainingSessionEmptyMessage } from "@/features/instructor/constants/trainingSession";
import { cn } from "@/lib/cn";
import type { InstructorSlotAssignmentMatrixRowApi } from "@/types/instructor";

interface TrainingSessionCalendarProps {
  items: InstructorSlotAssignmentMatrixRowApi[];
}

const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const dayIndexMap: Record<string, number> = {
  senin: 0,
  selasa: 1,
  rabu: 2,
  kamis: 3,
  jumat: 4,
  sabtu: 5,
  minggu: 6,
};

function hasAnyAssignment(items: InstructorSlotAssignmentMatrixRowApi[]) {
  return items.some((row) => row.slots.some((slot) => slot.is_assigned));
}

function getStartOfWeek(date: Date) {
  const result = new Date(date);
  const dayIndex = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - dayIndex);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getDateForRow(dayName: string) {
  const start = getStartOfWeek(new Date());
  const offset = dayIndexMap[dayName.toLowerCase()] ?? 0;
  const date = new Date(start);
  date.setDate(start.getDate() + offset);
  return date;
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function TrainingSessionCalendar({
  items,
}: TrainingSessionCalendarProps) {
  if (items.length === 0 || !hasAnyAssignment(items)) {
    return (
      <EmptyState
        title={trainingSessionEmptyMessage.title}
        description={trainingSessionEmptyMessage.description}
      />
    );
  }

  const rowsByDay = items.reduce<
    Record<string, InstructorSlotAssignmentMatrixRowApi>
  >((result, row) => {
    result[row.day_of_week.toLowerCase()] = row;
    return result;
  }, {});
  const todayKey = formatDateKey(new Date());
  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
        <h2 className="text-base font-bold text-slate-950">{monthLabel}</h2>
        <p className="mt-1 text-xs text-slate-500">
          Kalender ringkas menampilkan slot sesi yang ditugaskan pada minggu ini.
        </p>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
        {dayNames.map((day) => (
          <div
            key={day}
            className="border-r border-slate-100 px-2 py-3 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600 last:border-r-0 sm:text-xs"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-7">
        {dayNames.map((dayName) => {
          const fullDayName =
            Object.keys(dayIndexMap).find(
              (key) => dayNames[dayIndexMap[key]] === dayName,
            ) ?? dayName.toLowerCase();
          const row = rowsByDay[fullDayName];
          const date = getDateForRow(fullDayName);
          const dateKey = formatDateKey(date);
          const assignedSlots =
            row?.slots.filter((slot) => slot.is_assigned) ?? [];
          const isToday = dateKey === todayKey;

          return (
            <div
              key={dayName}
              className={cn(
                "min-h-32 border-t border-slate-100 bg-white p-3 sm:border-r sm:last:border-r-0",
                isToday && "bg-blue-50/70 ring-1 ring-inset ring-blue-200",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p
                    className={cn(
                      "text-lg font-black leading-none text-slate-950",
                      isToday && "text-blue-700",
                    )}
                  >
                    {date.getDate()}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {row?.day_of_week ?? dayName}
                  </p>
                </div>

                <Badge
                  className={cn(
                    "px-2 py-1 text-[10px] font-bold",
                    assignedSlots.length > 0
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {assignedSlots.length}
                </Badge>
              </div>

              <div className="mt-3 space-y-1.5">
                {assignedSlots.slice(0, 3).map((cell) => (
                  <div
                    key={`${dayName}-${cell.time_slot.id}`}
                    className="rounded-lg border-l-4 border-l-blue-600 bg-blue-50 px-2 py-1.5"
                  >
                    <div className="flex items-center gap-1.5 text-blue-800">
                      <CheckCircle2 className="h-3 w-3 shrink-0" />
                      <p className="truncate text-[11px] font-bold">
                        {cell.time_slot.nama_slot ??
                          `Slot #${cell.time_slot.id}`}
                      </p>
                    </div>
                  </div>
                ))}

                {assignedSlots.length > 3 ? (
                  <p className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                    +{assignedSlots.length - 3} slot lain
                  </p>
                ) : null}

                {assignedSlots.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-400">
                    Kosong
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
