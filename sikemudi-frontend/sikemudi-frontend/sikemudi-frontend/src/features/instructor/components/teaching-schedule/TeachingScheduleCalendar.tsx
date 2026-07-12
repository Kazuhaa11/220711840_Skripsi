import { useNavigate } from "react-router-dom";
import { CalendarDays, Car, Clock3, Eye, Users } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import type {
  TeachingScheduleItem,
  TeachingScheduleStatus,
} from "@/features/instructor/constants/teachingSchedule";
import { teachingScheduleEmptyMessage } from "@/features/instructor/constants/teachingSchedule";

interface TeachingScheduleCalendarProps {
  items: TeachingScheduleItem[];
}

const statusClass: Record<TeachingScheduleStatus, string> = {
  BERLANGSUNG: "bg-blue-100 text-blue-700",
  "AKAN DATANG": "bg-slate-100 text-slate-600",
  "MENUNGGU INPUT": "bg-red-100 text-red-700",
  SELESAI: "bg-emerald-100 text-emerald-700",
};

function getDateKey(item: TeachingScheduleItem) {
  return item.rawDate || item.date;
}

function getDetailPath(item: TeachingScheduleItem) {
  return item.bookingGroupId
    ? `/instruktur/jadwal-mengajar/paket/${item.bookingGroupId}`
    : `/instruktur/jadwal-mengajar/paket/${item.numericId ?? item.id}`;
}

function groupSchedulesByDate(items: TeachingScheduleItem[]) {
  return items.reduce<Record<string, TeachingScheduleItem[]>>((groups, item) => {
    const key = getDateKey(item);
    groups[key] = [...(groups[key] ?? []), item];
    return groups;
  }, {});
}

export default function TeachingScheduleCalendar({
  items,
}: TeachingScheduleCalendarProps) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EmptyState
        title={teachingScheduleEmptyMessage.title}
        description={teachingScheduleEmptyMessage.description}
      />
    );
  }

  const grouped = groupSchedulesByDate(items);
  const dateKeys = Object.keys(grouped).sort();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {dateKeys.map((dateKey) => {
        const schedules = grouped[dateKey] ?? [];
        const firstSchedule = schedules[0];

        return (
          <Card key={dateKey} className="overflow-hidden rounded-3xl shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-extrabold text-slate-950">
                    {firstSchedule?.date ?? dateKey}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    {firstSchedule?.day ?? "-"}
                  </p>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow-sm">
                  {schedules.length} paket
                </span>
              </div>
            </div>

            <div className="space-y-3 p-4">
              {schedules.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
                        <Clock3 className="h-4 w-4 text-blue-600" />
                        {item.time}
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {item.sessionCount ?? 0} sesi • {item.duration}
                      </p>
                    </div>

                    <Badge
                      className={cn(
                        "px-3 py-1 text-[10px] font-bold",
                        statusClass[item.status],
                      )}
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-xs font-semibold text-slate-600">
                    <div className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{item.detail.focus}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Car className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>
                        {item.vehicleName} • {item.vehiclePlate}
                      </span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span>{item.participantName}</span>
                    </div>
                  </div>

                  <Button
                    fullWidth
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-xl border-slate-200 text-xs font-bold uppercase tracking-[0.12em]"
                    leftIcon={<Eye className="h-4 w-4" />}
                    onClick={() => navigate(getDetailPath(item))}
                  >
                    Detail Sesi
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
