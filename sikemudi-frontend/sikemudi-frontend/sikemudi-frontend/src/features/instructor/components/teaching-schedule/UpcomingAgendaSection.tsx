import { CalendarDays, Clock3 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import {
  upcomingAgendaItems,
  type UpcomingAgendaItem,
} from "@/features/instructor/constants/teachingSchedule";

interface UpcomingAgendaSectionProps {
  items?: UpcomingAgendaItem[];
  onDetail?: (id: string) => void;
}

export default function UpcomingAgendaSection({
  items = upcomingAgendaItems,
  onDetail,
}: UpcomingAgendaSectionProps) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <CalendarDays className="h-5 w-5 text-slate-950" />
        <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
          Agenda Hari Mendatang
        </h2>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-7 w-7" />}
          title="Belum ada agenda mendatang"
          description="Agenda akan muncul setelah ada jadwal mengajar yang masih aktif atau akan datang."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.id}
                className={cn(
                  "relative overflow-hidden rounded-3xl px-5 py-5 shadow-md shadow-slate-200/60",
                  item.active ? "border-t-4 border-t-blue-600" : "opacity-80",
                )}
              >
                <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>

                <p
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-[0.14em]",
                    item.active ? "text-blue-600" : "text-slate-400",
                  )}
                >
                  {item.label}
                </p>

                <h3 className="mt-2 pr-14 text-lg font-extrabold leading-tight text-slate-950">
                  {item.participantName}
                </h3>

                <div className="mt-5 space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-4 w-4 shrink-0 text-slate-600" />
                    <p className="font-medium">
                      {item.time} ({item.duration})
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-4 w-4 shrink-0 text-slate-600" />
                    <p className="font-medium">{item.vehicle}</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex -space-x-2">
                    {item.participantInitials.map((initial) => (
                      <span
                        key={initial}
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-[10px] font-bold text-blue-700"
                      >
                        {initial}
                      </span>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-auto px-0 text-xs font-bold uppercase tracking-[0.12em] hover:bg-transparent",
                      item.active ? "text-blue-700" : "text-slate-400",
                    )}
                    onClick={() => onDetail?.(item.id)}
                  >
                    Detail Sesi
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
