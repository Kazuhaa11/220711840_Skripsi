import { NavLink } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { adminInstructorUpcomingSessions } from "@/features/admin/constants/instructors";

export default function AdminInstructorUpcomingCard() {
  return (
    <Card className="rounded-3xl p-5 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-950">
        Sesi Mendatang
      </h2>

      <div className="mt-5 space-y-5">
        {adminInstructorUpcomingSessions.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.id} className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Icon className="h-6 w-6" />
              </div>

              <div>
                <p className="font-bold text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.instructor}</p>
              </div>
            </div>
          );
        })}
      </div>

      <NavLink to="/admin/jadwal-latihan" className="mt-5 block">
        <Button
          variant="outline"
          fullWidth
          className="rounded-2xl border-blue-200 font-bold uppercase tracking-[0.12em] text-blue-700"
        >
          Lihat Semua Jadwal
        </Button>
      </NavLink>
    </Card>
  );
}
