import Card from "@/components/ui/Card";
import { Headphones } from "lucide-react";

export default function ScheduleHelpCard() {
  return (
    <Card className="rounded-3xl p-5 shadow-sm">
      <h3 className="text-[1.2rem] font-bold uppercase tracking-[0.16em] text-slate-950">
        Butuh Bantuan?
      </h3>

      <Card className="mt-5 rounded-[20px] bg-slate-50 p-4 shadow-none">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600">
            <Headphones className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              CS SIKEMUDI
            </p>
            <p className="mt-1 text-[1.2rem] font-semibold text-slate-950">
              0812-3456-7890
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-4 overflow-hidden rounded-[20px]">
        <img
          src="/images/register-success-cover.jpg"
          alt="Bantuan kursus mengemudi"
          className="h-45 w-full object-cover"
        />
      </div>
    </Card>
  );
}
