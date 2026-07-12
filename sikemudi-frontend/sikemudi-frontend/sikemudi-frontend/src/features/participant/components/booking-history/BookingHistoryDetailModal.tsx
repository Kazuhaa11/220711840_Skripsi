import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import type { BookingHistoryItem } from "@/features/participant/constants/type";
import type { BookingApiItem } from "@/types/booking";
import BookingHistoryStatusBadge from "@/features/participant/components/booking-history/BookingHistoryStatusBadge";
import { CalendarDays, CarFront, CreditCard, FileText, History, PackageCheck, UserRound } from "lucide-react";

interface BookingHistoryDetailModalProps {
  opened: boolean;
  onClose: () => void;
  item: BookingHistoryItem | null;
  detail?: BookingApiItem | null;
  loading?: boolean;
  error?: string | null;
}

export default function BookingHistoryDetailModal({
  opened,
  onClose,
  item,
  detail,
  loading = false,
  error = null,
}: BookingHistoryDetailModalProps) {
  if (!item && !loading) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title="Detail Riwayat Booking Paket"
      description="Lihat ringkasan booking paket yang sudah selesai, dibatalkan, atau pembayaran ditolak."
      headerClassName="px-5 py-4 sm:px-6 sm:py-5 [&_h2]:text-2xl [&_h2]:font-extrabold [&_p]:text-sm [&_p]:leading-7"
      bodyClassName="px-5 py-5 sm:px-6 sm:py-5"
    >
      {loading ? (
        <LoadingSpinner label="Memuat detail riwayat booking..." />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : item ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <Card className="rounded-3xl p-4 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Tanggal Riwayat
                    </p>
                    <p className="mt-1 text-base font-bold text-slate-900">
                      {item.dateLabel}
                    </p>
                    <p className="text-sm text-blue-700">{item.timeRange}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Instruktur
                    </p>
                    <p className="mt-1 text-base font-bold text-slate-900">
                      {item.instructorName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <CarFront className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Kendaraan
                    </p>
                    <p className="mt-1 text-base font-bold text-slate-900">
                      {item.vehicleName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <PackageCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Paket
                    </p>
                    <p className="mt-1 text-base font-bold text-slate-900">
                      {item.packageName}
                    </p>
                    <p className="text-sm text-slate-600">{item.pickupLabel} • {item.simLabel}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Catatan Riwayat</h3>
              </div>

              <p className="mt-3 text-sm leading-7 text-slate-700">{item.notes}</p>
            </Card>

            {detail?.histories?.length ? (
              <Card className="rounded-3xl p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <History className="h-4 w-4 text-slate-700" />
                  <h3 className="text-base font-bold text-slate-900">Log Perubahan</h3>
                </div>

                <div className="mt-4 space-y-3">
                  {detail.histories.map((history) => (
                    <div key={history.id} className="rounded-2xl bg-slate-50 p-4 text-sm">
                      <p className="font-bold text-slate-900">{history.aksi}</p>
                      <p className="mt-1 text-slate-600">{history.catatan ?? "Tidak ada catatan."}</p>
                      <p className="mt-2 text-xs text-slate-500">{history.created_at ?? "-"}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card className="rounded-3xl p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Status Booking
              </p>

              <div className="mt-3">
                <BookingHistoryStatusBadge status={item.status} />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {item.statusLabel}
              </p>
            </Card>

            <Card className="rounded-3xl p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Pembayaran</h3>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-700">
                <p>Kode: <span className="font-semibold text-slate-950">{item.code}</span></p>
                <p>Harga: <span className="font-semibold text-slate-950">{item.priceLabel}</span></p>
                <p>Metode: <span className="font-semibold text-slate-950">{item.paymentMethodLabel}</span></p>
                <p>Status bayar: <span className="font-semibold text-slate-950">{item.paymentStatus}</span></p>
                <p>Progress: <span className="font-semibold text-slate-950">{item.timeRange.replace("Booking paket • ", "")}</span></p>
                <p>Nama pengirim: <span className="font-semibold text-slate-950">{detail?.payment?.nama_pengirim ?? "-"}</span></p>
                <p>Bank pengirim: <span className="font-semibold text-slate-950">{detail?.payment?.bank_pengirim ?? "-"}</span></p>
              </div>
            </Card>

            {detail?.training_result ? (
              <Card className="rounded-3xl p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Hasil Latihan
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p>Kehadiran: <span className="font-semibold text-slate-950">{detail.training_result.status_kehadiran ?? "-"}</span></p>
                  <p>Nilai akhir: <span className="font-semibold text-slate-950">{detail.training_result.nilai_akhir ?? "-"}</span></p>
                  <p>Kelulusan: <span className="font-semibold text-slate-950">{detail.training_result.status_kelulusan ?? "-"}</span></p>
                </div>
              </Card>
            ) : null}

            <Button
              fullWidth
              variant="outline"
              onClick={onClose}
              className="h-10 rounded-xl text-xs font-bold uppercase tracking-wide"
            >
              Tutup
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
