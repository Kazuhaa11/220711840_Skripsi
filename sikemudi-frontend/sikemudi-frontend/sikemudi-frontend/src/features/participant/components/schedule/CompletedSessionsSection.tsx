import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { CheckCircle2 } from "lucide-react";
import { completedSessions, type CompletedSessionItem } from "@/features/participant/constants/mySchedule";

interface CompletedSessionsSectionProps {
  items?: CompletedSessionItem[];
}

export default function CompletedSessionsSection({
  items = completedSessions,
}: CompletedSessionsSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        <h2 className="text-xl font-extrabold tracking-tight text-slate-950 md:text-2xl">
          Sesi Selesai
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={<CheckCircle2 className="h-7 w-7" />}
            title="Belum ada sesi selesai"
            description="Sesi latihan yang sudah selesai akan tampil di sini setelah status booking diperbarui oleh sistem/admin."
          />
        </div>
      ) : (
        <>
          <div className="mt-5 hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm md:block">
            <div className="grid grid-cols-[1.1fr_1fr_1.1fr_1fr_0.9fr] gap-4 border-b border-slate-200 px-6 py-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-700">
              <p>Tanggal</p>
              <p>Waktu</p>
              <p>Instruktur</p>
              <p>Kendaraan</p>
              <p>Status</p>
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.1fr_1fr_1.1fr_1fr_0.9fr] gap-4 border-b border-slate-100 px-6 py-5 text-sm text-slate-700 last:border-b-0"
              >
                <p>{item.date}</p>
                <p>{item.time}</p>
                <p>{item.instructor}</p>
                <p>{item.vehicle}</p>
                <div>
                  <Badge
                    variant="success"
                    className="gap-1.5 px-3 text-sm font-semibold"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 md:hidden">
            {items.map((item) => (
              <Card
                key={`${item.id}-mobile`}
                className="rounded-[22px] p-4 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Tanggal
                      </p>
                      <p className="mt-1 text-base font-semibold text-slate-900">
                        {item.date}
                      </p>
                    </div>

                    <Badge variant="success" className="gap-1.5 px-3 font-semibold">
                      <CheckCircle2 className="h-4 w-4" />
                      {item.status}
                    </Badge>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Waktu
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{item.time}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Instruktur
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {item.instructor}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                        Kendaraan
                      </p>
                      <p className="mt-1 text-sm text-slate-700">{item.vehicle}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
