import Card from "@/components/ui/Card";
import { adminInstructorPerformance } from "@/features/admin/constants/instructors";

export default function AdminInstructorPerformanceCard() {
  return (
    <Card className="rounded-3xl border-slate-950 bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/15">
      <h2 className="text-lg font-bold text-white">
        {adminInstructorPerformance.title}
      </h2>

      <p className="mt-2 text-base text-slate-300">
        {adminInstructorPerformance.description}
      </p>

      <div className="mt-5 space-y-5">
        {adminInstructorPerformance.items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-4">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </p>
                <p className="font-bold text-white">{item.value}%</p>
              </div>

              <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
