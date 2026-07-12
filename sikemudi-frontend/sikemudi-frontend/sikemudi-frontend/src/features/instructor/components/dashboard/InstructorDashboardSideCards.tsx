import { AlertTriangle, CheckCircle2, ClipboardList, FileText, LifeBuoy, PlusCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { mapInstructorReminderTone } from "@/features/dashboard/utils/dashboardMapper";
import type { InstructorDashboardReminder } from "@/types/dashboard";

interface TaskReminderCardProps {
  reminders: InstructorDashboardReminder[];
}

const reminderToneClass = {
  danger: {
    wrapper: "border-l-red-600 bg-red-50 text-red-700",
    icon: "text-red-600",
    iconComponent: AlertTriangle,
  },
  info: {
    wrapper: "border-l-blue-600 bg-blue-50 text-blue-700",
    icon: "text-blue-600",
    iconComponent: CheckCircle2,
  },
};

const quickAccessItems = [
  { id: "quick-1", label: "Silabus", icon: FileText },
  { id: "quick-2", label: "Input Hasil", icon: ClipboardList },
  { id: "quick-3", label: "Bantuan", icon: LifeBuoy },
  { id: "quick-4", label: "Emergency", icon: PlusCircle },
];

export function TaskReminderCard({ reminders }: TaskReminderCardProps) {
  return (
    <Card className="rounded-3xl px-5 py-5">
      <div className="flex items-center gap-4">
        <CheckCircle2 className="h-5 w-5 text-red-600" />
        <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
          Tugas & Pengingat
        </h2>
      </div>

      <div className="mt-5 space-y-3">
        {reminders.map((item) => {
          const tone = reminderToneClass[mapInstructorReminderTone(item)];
          const Icon = tone.iconComponent;

          return (
            <div
              key={`${item.type}-${item.title}`}
              className={cn("rounded-2xl border-l-4 px-4 py-4", tone.wrapper)}
            >
              <div className="flex items-start gap-4">
                <Icon className={cn("mt-1 h-5 w-5 shrink-0", tone.icon)} />

                <div>
                  <h3 className="text-sm font-bold text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function QuickAccessCard() {
  return (
    <Card className="rounded-3xl border-slate-100 bg-slate-100/80 px-5 py-5 shadow-none">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-800">
        Akses Cepat
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {quickAccessItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              className="flex min-h-20 flex-col items-center justify-center rounded-2xl bg-white px-3 py-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Icon className="h-5 w-5 text-blue-700" />
              <span className="mt-2 text-xs font-bold text-slate-950">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
