import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import {
  getBookingStatusBadgeVariant,
  mapAdminBookingToRow,
} from "@/features/admin/utils/adminBookingMapper";
import { cn } from "@/lib/cn";
import type { AdminBookingApiItem } from "@/types/adminBooking";
import type { AvailableScheduleApiItem } from "@/types/booking";

interface AdminTrainingSchedulesCalendarProps {
  items: AdminBookingApiItem[];
  onDetail: (item: AdminBookingApiItem) => void;
}

const dayNames = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function getFirstSchedule(item: AdminBookingApiItem): AvailableScheduleApiItem | null {
  return item.training_schedule ?? item.sessions?.[0]?.training_schedule ?? null;
}

function getScheduleDateKey(item: AdminBookingApiItem): string {
  return getFirstSchedule(item)?.tanggal_latihan?.slice(0, 10) ?? "";
}

function getCalendarMonth(items: AdminBookingApiItem[]) {
  const firstDate = items.map(getScheduleDateKey).find(Boolean);
  const baseDate = firstDate ? new Date(`${firstDate}T00:00:00`) : new Date();

  if (Number.isNaN(baseDate.getTime())) return new Date();

  return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const firstDayIndex = (firstDay.getDay() + 6) % 7;
  const startDate = new Date(year, month, 1 - firstDayIndex);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      dateKey: formatDateKey(date),
      day: date.getDate(),
      outside: date.getMonth() !== month,
    };
  });
}

export default function AdminTrainingSchedulesCalendar({
  items,
  onDetail,
}: AdminTrainingSchedulesCalendarProps) {
  const monthDate = getCalendarMonth(items);
  const calendarDays = buildCalendarDays(monthDate);
  const todayKey = formatDateKey(new Date());
  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(monthDate);

  const itemsByDate = items.reduce<Record<string, AdminBookingApiItem[]>>(
    (result, item) => {
      const dateKey = getScheduleDateKey(item);
      if (!dateKey) return result;

      result[dateKey] = [...(result[dateKey] ?? []), item];
      return result;
    },
    {},
  );

  return (
    <Card className="overflow-hidden rounded-4xl p-0 shadow-sm">
      <div className="flex flex-col gap-5 border-b border-slate-200 px-6 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">{monthLabel}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Kalender menampilkan booking paket berdasarkan tanggal sesi pertama pada filter aktif.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-white">
        {dayNames.map((day) => (
          <div
            key={day}
            className="border-r border-slate-100 px-4 py-5 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-700 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dayItems = itemsByDate[day.dateKey] ?? [];
          const isToday = day.dateKey === todayKey;

          return (
            <div
              key={day.dateKey}
              className={cn(
                "min-h-42.5 border-r border-t border-slate-100 p-4 last:border-r-0",
                isToday && "bg-blue-50/70 ring-1 ring-inset ring-blue-200",
              )}
            >
              <div className="flex items-center justify-between">
                <p
                  className={cn(
                    "text-lg font-bold",
                    day.outside ? "text-slate-300" : "text-slate-950",
                    isToday && "text-blue-700",
                  )}
                >
                  {day.day}
                </p>

                {isToday ? (
                  <Badge className="bg-blue-100 text-blue-700">Hari Ini</Badge>
                ) : null}
              </div>

              <div className="mt-4 space-y-2">
                {dayItems.map((item) => {
                  const row = mapAdminBookingToRow(item);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onDetail(item)}
                      className="w-full rounded-xl border-l-4 border-l-blue-600 bg-blue-50 p-3 text-left transition hover:shadow-sm"
                    >
                      <p className="text-xs font-bold text-blue-700">
                        {row.timeLabel}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase text-slate-950">
                        {row.code}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                        {row.participantName} • {row.packageName}
                      </p>
                      <div className="mt-2">
                        <Badge
                          variant={getBookingStatusBadgeVariant(row.bookingStatus)}
                          className="font-bold uppercase tracking-[0.08em]"
                        >
                          {row.bookingStatusLabel}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
