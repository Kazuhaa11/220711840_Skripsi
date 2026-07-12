import { NavLink } from "react-router-dom";
import Card from "@/components/ui/Card";
import { adminQuickActions } from "@/features/admin/constants/dashboard";

export default function AdminQuickActionsCard() {
  return (
    <Card className="rounded-3xl p-5 shadow-sm">
      <h2 className="text-lg font-bold uppercase tracking-[0.08em] text-slate-950">
        Aksi Cepat
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-4">
        {adminQuickActions.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.to}
              className="flex min-h-24 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            >
              <Icon className="h-6 w-6 text-slate-950" />
              <span className="mt-3 text-xs font-bold leading-4 text-slate-950">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </Card>
  );
}
