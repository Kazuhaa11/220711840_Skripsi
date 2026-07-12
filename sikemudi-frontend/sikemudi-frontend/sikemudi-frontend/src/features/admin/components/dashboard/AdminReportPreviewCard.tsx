import { NavLink } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { adminReportPreviews } from "@/features/admin/constants/dashboard";

export default function AdminReportPreviewCard() {
  return (
    <Card className="rounded-3xl border-0 bg-slate-100 p-5 shadow-none">
      <h2 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-950">
        Preview Laporan
      </h2>

      <div className="mt-5 space-y-3">
        {adminReportPreviews.map((item) => (
          <NavLink
            key={item.id}
            to={item.to}
            className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-800 transition hover:text-blue-700 hover:shadow-sm"
          >
            <span>{item.label}</span>
            <ArrowRight className="h-4 w-4" />
          </NavLink>
        ))}
      </div>
    </Card>
  );
}
