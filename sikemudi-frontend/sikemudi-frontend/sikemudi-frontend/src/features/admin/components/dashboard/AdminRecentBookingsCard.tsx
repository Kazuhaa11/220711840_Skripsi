import { NavLink } from "react-router-dom";
import { UserRound } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import type { AdminDashboardRecentBooking } from "@/types/dashboard";

interface AdminRecentBookingsCardProps {
  bookings: AdminDashboardRecentBooking[];
}

function BookingStatusBadge({ status }: { status: string }) {
  if (status.includes("DIKONFIRMASI")) {
    return (
      <Badge className="bg-blue-50 text-[11px] font-bold uppercase text-blue-700">
        {status}
      </Badge>
    );
  }

  if (status.includes("DITOLAK") || status.includes("DIBATALKAN")) {
    return (
      <Badge className="bg-red-50 text-[11px] font-bold uppercase text-red-700">
        {status}
      </Badge>
    );
  }

  return (
    <Badge className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500">
      {status}
    </Badge>
  );
}

export default function AdminRecentBookingsCard({
  bookings,
}: AdminRecentBookingsCardProps) {
  return (
    <Card className="rounded-3xl p-5 shadow-sm sm:p-5">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-950">
            Aktivitas Booking Terbaru
          </h2>
          <p className="mt-1 text-sm text-slate-600">Data langsung dari backend</p>
        </div>

        <NavLink to="/admin/jadwal-latihan">
          <Button
            variant="ghost"
            className="px-0 font-bold text-blue-700 hover:bg-transparent"
          >
            Semua Booking
          </Button>
        </NavLink>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="Belum ada aktivitas booking"
          description="Aktivitas booking terbaru akan tampil setelah peserta membuat booking."
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-2xl bg-slate-50 px-4 py-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                <UserRound className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-slate-950">
                  {item.peserta?.nama_peserta ?? "Peserta tidak ditemukan"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.paket?.nama_paket ?? "Paket tidak tersedia"} •{" "}
                  {item.jadwal?.tanggal_latihan ?? item.tanggal_booking ?? "-"}
                </p>
              </div>

              <div className="text-right">
                <BookingStatusBadge status={item.status_label ?? item.status} />
                <p className="mt-1 text-xs text-slate-400">
                  {item.updated_at ?? item.tanggal_booking ?? "-"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
