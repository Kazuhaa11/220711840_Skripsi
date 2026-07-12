import { NavLink } from "react-router-dom";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { ParticipantDashboardBookingCard } from "@/types/dashboard";

interface NearestSessionCardProps {
  booking: ParticipantDashboardBookingCard | null;
}

export default function NearestSessionCard({ booking }: NearestSessionCardProps) {
  if (!booking) {
    return (
      <Card className="min-w-0 rounded-2xl p-4 shadow-sm sm:rounded-3xl sm:p-8">
        <div className="min-w-0 text-left sm:text-center">
          <h3 className="break-words text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">
            Belum ada jadwal aktif
          </h3>
          <p className="mt-2 max-w-full break-words text-sm leading-6 text-slate-600">
            Jadwal aktif terdekat akan muncul setelah booking Anda dikonfirmasi oleh admin.
          </p>
          <div className="mt-4">
          <NavLink to="/peserta/jadwal-tersedia">
              <Button className="h-10 w-full rounded-2xl text-sm sm:w-auto">
                Booking Jadwal
              </Button>
          </NavLink>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-l-4 border-l-blue-600 px-4 py-4 sm:rounded-3xl sm:px-7 sm:py-6">
      <Badge variant="info">{booking.status_label}</Badge>

      <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950 sm:mt-4 sm:text-3xl">
        Sesi Latihan Terdekat
      </h2>

      <div className="mt-5 grid gap-4 sm:mt-7 sm:gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
              Tanggal & Waktu
            </p>
            <p className="mt-1.5 text-base font-semibold text-slate-950 sm:mt-2 sm:text-xl">
              {booking.tanggal_latihan_label ?? booking.tanggal_latihan ?? "-"}
            </p>
            <p className="mt-1 text-sm text-slate-600 sm:text-lg">
              {booking.time_slot?.jam_label ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
              Instruktur
            </p>
            <p className="mt-1.5 text-base font-semibold text-slate-950 sm:mt-2 sm:text-xl">
              {booking.instruktur?.nama_instruktur ?? "-"}
            </p>
            <p className="mt-1 text-sm text-slate-600 sm:text-lg">
              {booking.paket?.nama_paket ?? "-"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
              Kendaraan
            </p>
            <p className="mt-1.5 text-base font-semibold text-slate-950 sm:mt-2 sm:text-xl">
              {booking.kendaraan?.nama_kendaraan ?? "-"}
            </p>
            <p className="mt-1 text-sm text-slate-600 sm:text-lg">
              {booking.kendaraan?.transmisi ?? booking.kendaraan?.nomor_plat ?? "-"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-col sm:gap-3 lg:w-42.5">
          <NavLink to="/peserta/jadwal-saya">
            <Button fullWidth className="h-10 rounded-2xl text-xs sm:h-auto sm:text-sm">
              LIHAT JADWAL
            </Button>
          </NavLink>
          <NavLink to="/peserta/riwayat-booking">
            <Button
              fullWidth
              variant="outline"
              className="h-10 rounded-2xl border-slate-200 text-xs text-slate-700 hover:bg-slate-50 sm:h-auto sm:text-sm"
            >
              RIWAYAT
            </Button>
          </NavLink>
        </div>
      </div>
    </Card>
  );
}
