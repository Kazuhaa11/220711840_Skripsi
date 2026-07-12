import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import { CalendarDays, CarFront, CreditCard, FileText, MapPin, PackageCheck, UserRound } from "lucide-react";
import type { BookingApiItem } from "@/types/booking";
import type { UpcomingSessionItem } from "@/features/participant/constants/mySchedule";

interface BookingScheduleDetailModalProps {
  opened: boolean;
  onClose: () => void;
  item: UpcomingSessionItem | null;
  detail?: BookingApiItem | null;
  loading?: boolean;
  error?: string | null;
}

function getStatusVariant(status?: string) {
  if (status === "Dikonfirmasi" || status === "Dijadwalkan Ulang") return "info";
  if (status === "Menunggu Konfirmasi Pembayaran") return "warning";
  if (status === "Dibatalkan") return "danger";
  if (status === "Selesai") return "success";
  return "default";
}

function formatBooleanLabel(value?: boolean | null, trueLabel = "Ya", falseLabel = "Tidak") {
  return value ? trueLabel : falseLabel;
}

export default function BookingScheduleDetailModal({
  opened,
  onClose,
  item,
  detail,
  loading = false,
  error = null,
}: BookingScheduleDetailModalProps) {
  if (!item && !loading) return null;

  const schedule = detail?.training_schedule;
  const payment = detail?.payment;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title="Detail Booking"
      description="Informasi lengkap jadwal latihan dan pembayaran peserta."
      footer={
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose} className="h-11 rounded-2xl">
            Tutup
          </Button>
        </div>
      }
    >
      {loading ? (
        <LoadingSpinner label="Memuat detail booking..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : item ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <Card className="rounded-3xl p-5 shadow-sm">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Jadwal Latihan
                    </p>
                    <p className="mt-1 text-base font-bold text-slate-950">{item.date}</p>
                    <p className="text-sm text-blue-700">{item.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <UserRound className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Instruktur
                    </p>
                    <p className="mt-1 text-base font-bold text-slate-950">{item.instructor}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CarFront className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Kendaraan
                    </p>
                    <p className="mt-1 text-base font-bold text-slate-950">{item.vehicle}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PackageCheck className="mt-1 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Paket
                    </p>
                    <p className="mt-1 text-base font-bold text-slate-950">{item.packageName}</p>
                    <p className="text-sm text-slate-600">{item.pickupLabel} • {item.simLabel}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Catatan Booking</h3>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Kode Booking
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {detail?.kode_booking ?? `#${item.bookingId}`}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Kode Jadwal
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {schedule?.kode_jadwal ?? "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Antar Jemput
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatBooleanLabel(detail?.pakai_antar_jemput, "Ya", "Tidak")}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Layanan SIM
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {formatBooleanLabel(detail?.pakai_sim, "Dengan SIM", "Tanpa SIM")}
                  </p>
                </div>
              </div>

              {detail?.alamat_jemput ? (
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                  <MapPin className="mt-0.5 h-5 w-5 text-slate-600" />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Alamat Jemput
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{detail.alamat_jemput}</p>
                  </div>
                </div>
              ) : null}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl p-5 shadow-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Status Booking
              </p>
              <div className="mt-3">
                <Badge variant={getStatusVariant(detail?.status)} className="px-3 font-bold uppercase tracking-[0.08em]">
                  {item.status}
                </Badge>
              </div>

              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Harga Paket
              </p>
              <p className="mt-2 text-2xl font-black text-slate-950">{item.priceLabel}</p>
            </Card>

            <Card className="rounded-3xl p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Pembayaran</h3>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>Status: <span className="font-semibold text-slate-950">{payment?.status ?? item.paymentStatus}</span></p>
                <p>Nominal: <span className="font-semibold text-slate-950">{item.priceLabel}</span></p>
                <p>Nama Pengirim: <span className="font-semibold text-slate-950">{payment?.nama_pengirim ?? "-"}</span></p>
                <p>Bank Pengirim: <span className="font-semibold text-slate-950">{payment?.bank_pengirim ?? "-"}</span></p>
                <p>Tanggal Upload: <span className="font-semibold text-slate-950">{payment?.tanggal_upload ?? "-"}</span></p>
              </div>
            </Card>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
