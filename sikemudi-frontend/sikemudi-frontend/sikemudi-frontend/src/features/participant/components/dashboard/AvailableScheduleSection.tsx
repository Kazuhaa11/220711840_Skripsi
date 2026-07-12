import { NavLink } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import type { ParticipantDashboardAvailableSchedule } from "@/types/dashboard";

interface AvailableScheduleSectionProps {
  schedules: ParticipantDashboardAvailableSchedule[];
  hasActivePackage: boolean;
}

export default function AvailableScheduleSection({
  schedules,
  hasActivePackage,
}: AvailableScheduleSectionProps) {
  return (
    <section>
      <div>
        <h3 className="text-base font-bold uppercase tracking-[0.16em] text-slate-800 sm:text-xl md:text-2xl sm:tracking-[0.18em]">
          Jadwal Tersedia
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 sm:mt-2">
          Jadwal tersedia mengikuti paket kursus aktif peserta.
        </p>
      </div>

      {!hasActivePackage ? (
        <div className="mt-4 sm:mt-6">
          <EmptyState
            title="Belum ada paket aktif"
            description="Pilih atau booking paket kursus terlebih dahulu agar sistem bisa menampilkan jadwal tersedia."
          />
        </div>
      ) : schedules.length === 0 ? (
        <div className="mt-4 sm:mt-6">
          <EmptyState
            title="Belum ada jadwal tersedia"
            description="Belum ada slot kosong untuk paket aktif Anda saat ini."
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="min-w-0 rounded-2xl px-3 py-3 sm:rounded-3xl sm:px-6 sm:py-6">
              <p className="text-xs font-semibold text-slate-500 sm:text-sm">
                {schedule.slot?.nama_slot ?? "Slot"}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:mt-3 sm:text-3xl md:text-4xl">
                {schedule.slot?.jam_mulai ?? "-"}
              </p>
              <p className="mt-1.5 break-words text-[11px] leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                {schedule.tanggal_latihan_label ?? schedule.tanggal_latihan} • Sisa{" "}
                {schedule.sisa_kapasitas} kursi
              </p>
              <NavLink to="/peserta/jadwal-tersedia">
                <Button
                  variant="ghost"
                  className="mt-3 h-auto px-0 text-left text-[11px] font-bold uppercase tracking-wide text-blue-700 hover:bg-transparent hover:text-blue-800 sm:mt-6 sm:text-sm"
                >
                  Booking
                </Button>
              </NavLink>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
