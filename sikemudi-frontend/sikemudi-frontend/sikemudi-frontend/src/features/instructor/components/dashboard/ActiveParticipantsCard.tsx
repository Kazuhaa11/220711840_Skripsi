import { ChevronRight, Users } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import type { InstructorDashboardActiveParticipants } from "@/types/dashboard";

interface ActiveParticipantsCardProps {
  activeParticipants: InstructorDashboardActiveParticipants;
}

export default function ActiveParticipantsCard({
  activeParticipants,
}: ActiveParticipantsCardProps) {
  return (
    <Card className="rounded-3xl px-5 py-5 sm:px-6 lg:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Users className="h-5 w-5 text-blue-700" />
          <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
            Peserta Sesi Aktif
          </h2>
        </div>

        {activeParticipants.schedule?.jam_label ? (
          <Badge
            variant="success"
            className="bg-emerald-950 px-3 py-1 text-[11px] font-bold text-white"
          >
            {activeParticipants.schedule.jam_label}
          </Badge>
        ) : null}
      </div>

      {activeParticipants.items.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Belum ada peserta aktif"
            description="Peserta sesi aktif akan muncul ketika terdapat sesi yang sedang berlangsung atau akan berjalan."
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {activeParticipants.items.map((participant) => (
            <button
              key={participant.booking_id}
              type="button"
              className="flex w-full items-center gap-3 rounded-2xl border-l-4 border-l-blue-600 bg-slate-50 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                {participant.peserta.inisial ?? "-"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-950">
                  {participant.peserta.nama_peserta ?? "-"}
                </p>
                <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  {participant.paket?.nama_paket ?? "Paket"} •{" "}
                  {participant.sudah_input_hasil ? "Sudah Input" : "Belum Input"}
                </p>
              </div>

              <ChevronRight className="h-5 w-5 shrink-0 text-slate-800" />
            </button>
          ))}
        </div>
      )}
    </Card>
  );
}
