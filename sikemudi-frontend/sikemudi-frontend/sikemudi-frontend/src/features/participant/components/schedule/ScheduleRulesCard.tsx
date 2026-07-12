import Card from "@/components/ui/Card";
import {
  CircleAlert,
  CircleCheck,
  CalendarClock,
  NotebookPen,
} from "lucide-react";
import { scheduleRules } from "@/features/participant/constants/mySchedule";

const icons = [CircleCheck, CalendarClock, NotebookPen];

export default function ScheduleRulesCard() {
  return (
    <Card className="rounded-[26px] bg-[linear-gradient(180deg,#0d214f_0%,#152c63_100%)] p-5 text-white shadow-sm">
      <div className="flex items-center gap-3">
        <CircleAlert className="h-5 w-5 text-white" />
        <h3 className="text-xl font-extrabold tracking-tight text-white md:text-2xl">
          Informasi & Aturan
        </h3>
      </div>

      <div className="mt-6 space-y-5">
        {scheduleRules.map((rule, index) => {
          const Icon = icons[index] ?? CircleCheck;

          return (
            <div key={rule} className="flex items-start gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
                <Icon className="h-4 w-4" />
              </div>

              <p className="text-sm leading-7 text-slate-100">{rule}</p>
            </div>
          );
        })}
      </div>

    </Card>
  );
}
