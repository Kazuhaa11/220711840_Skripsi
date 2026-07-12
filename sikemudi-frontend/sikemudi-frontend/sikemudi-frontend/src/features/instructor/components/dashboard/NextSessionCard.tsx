import { Car, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import type { InstructorDashboardNextSession } from "@/types/dashboard";

interface NextSessionCardProps {
  session: InstructorDashboardNextSession | null;
}

export default function NextSessionCard({ session }: NextSessionCardProps) {
  if (!session) {
    return (
      <EmptyState
        title="Tidak ada sesi berikutnya"
        description="Sesi berikutnya untuk hari ini belum tersedia."
      />
    );
  }

  return (
    <Card className="relative overflow-hidden rounded-3xl border-slate-950 bg-slate-950 px-5 py-6 text-white shadow-xl shadow-slate-900/15">
      <Car className="pointer-events-none absolute right-5 top-10 h-20 w-20 text-white/10" />

      <div className="relative">
        <span className="inline-flex rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
          Sesi Berikutnya
        </span>

        <h2 className="mt-5 text-2xl font-extrabold leading-tight tracking-tight text-white">
          {session.jam?.label ?? "-"}
        </h2>

        <p className="mt-2 text-sm font-medium text-slate-300">
          {session.timezone_label}
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <Car className="mt-1 h-5 w-5 shrink-0 text-blue-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Kendaraan
              </p>
              <p className="mt-1 text-sm font-bold leading-6 text-white">
                {session.kendaraan?.label ?? session.kendaraan?.nama_kendaraan ?? "-"}
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-blue-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Lokasi Start
              </p>
              <p className="mt-1 text-sm font-bold leading-6 text-white">
                {session.lokasi_start}
              </p>
            </div>
          </div>
        </div>

        <Button
          fullWidth
          variant="outline"
          className="mt-6 h-11 rounded-xl border-white bg-white text-sm text-slate-950 hover:bg-slate-100"
        >
          {session.button_label}
        </Button>
      </div>
    </Card>
  );
}
