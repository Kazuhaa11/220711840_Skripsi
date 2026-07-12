import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { CalendarDays, CarFront, Clock3, CreditCard, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";
import { upcomingSessions, type UpcomingSessionItem } from "@/features/participant/constants/mySchedule";

interface UpcomingSessionsSectionProps {
  items?: UpcomingSessionItem[];
  onOpenDetail?: (item: UpcomingSessionItem) => void;
  onOpenReschedule?: (item: UpcomingSessionItem) => void;
  onOpenCancel?: (item: UpcomingSessionItem) => void;
  onOpenPaymentProof?: (item: UpcomingSessionItem) => void;
}

function getSessionAccent(accent: "blue" | "slate") {
  return accent === "blue" ? "border-l-blue-600" : "border-l-slate-300";
}

function getStatusBadgeVariant(status: string) {
  if (status === "TERKONFIRMASI" || status === "DIJADWALKAN ULANG") return "info";
  if (status === "MENUNGGU KONFIRMASI") return "warning";
  if (status === "MENUNGGU PEMBAYARAN") return "default";
  return "default";
}

export default function UpcomingSessionsSection({
  items = upcomingSessions,
  onOpenDetail,
  onOpenReschedule,
  onOpenCancel,
  onOpenPaymentProof,
}: UpcomingSessionsSectionProps) {
  return (
    <section>
      <div className="flex items-center gap-3">
        <CalendarDays className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-extrabold tracking-tight text-slate-950 md:text-2xl">
          Sesi Mendatang
        </h2>
      </div>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-7 w-7" />}
            title="Belum ada jadwal aktif"
            description="Booking yang masih aktif, menunggu pembayaran, atau menunggu konfirmasi admin akan muncul di bagian ini."
          />
        ) : (
          items.map((session) => (
            <Card
              key={session.id}
              className={cn(
                "rounded-3xl border-l-4 p-5 shadow-sm sm:p-6",
                getSessionAccent(session.accent),
              )}
            >
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant={getStatusBadgeVariant(session.status)}
                      className="px-3 font-bold uppercase tracking-[0.08em]"
                    >
                      {session.status}
                    </Badge>

                    <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-slate-500" />
                        {session.date}
                      </span>

                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4 text-slate-500" />
                        {session.time}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <UserRound className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                          Instruktur
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-950">
                          {session.instructor}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <CarFront className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                          Kendaraan
                        </p>
                        <p className="mt-1 text-base font-semibold text-slate-950">
                          {session.vehicle}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 border-t border-slate-200 pt-4 text-sm text-slate-600 sm:grid-cols-2">
                    <p>
                      Paket: <span className="font-semibold text-slate-900">{session.packageName}</span>
                    </p>
                    <p>
                      Harga: <span className="font-semibold text-slate-900">{session.priceLabel}</span>
                    </p>
                    <p>
                      Layanan: <span className="font-semibold text-slate-900">{session.pickupLabel}</span>
                    </p>
                    <p className="inline-flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-semibold text-slate-900">{session.paymentStatus}</span>
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 xl:w-37.5">
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl text-sm font-bold uppercase tracking-[0.08em]"
                    onClick={() => onOpenDetail?.(session)}
                  >
                    Lihat Detail
                  </Button>

                  {session.canUploadPaymentProof ? (
                    <Button
                      className="h-11 rounded-xl text-sm font-bold uppercase tracking-[0.08em]"
                      onClick={() => onOpenPaymentProof?.(session)}
                    >
                      Upload Bukti
                    </Button>
                  ) : null}

                  <Button
                    variant="secondary"
                    className="h-11 rounded-xl text-sm font-bold uppercase tracking-[0.08em]"
                    onClick={() => onOpenReschedule?.(session)}
                    disabled={!session.canReschedule}
                  >
                    Ubah
                  </Button>

                  <Button
                    variant="ghost"
                    className="h-11 rounded-xl text-sm font-bold uppercase tracking-[0.08em] text-red-600 hover:text-red-700"
                    onClick={() => onOpenCancel?.(session)}
                    disabled={!session.canCancel}
                  >
                    Batal
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
