import PaginationBar from "@/components/common/PaginationBar";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import type { BookingHistoryItem } from "@/features/participant/constants/type";
import BookingHistoryStatusBadge from "@/features/participant/components/booking-history/BookingHistoryStatusBadge";
import { CalendarX2, CarFront } from "lucide-react";
import { cn } from "@/lib/cn";

interface BookingHistoryTableProps {
  items: BookingHistoryItem[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewDetail: (item: BookingHistoryItem) => void;
}

export default function BookingHistoryTable({
  items,
  totalCount,
  currentPage,
  totalPages,
  onPageChange,
  onViewDetail,
}: BookingHistoryTableProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<CalendarX2 className="h-7 w-7" />}
        title="Riwayat booking paket belum ada"
        description="Booking paket selesai, dibatalkan, atau pembayaran ditolak akan tampil di sini."
      />
    );
  }

  return (
    <>
      <Card className="hidden rounded-3xl p-0 shadow-sm lg:block">
        <div className="grid grid-cols-[1.1fr_1fr_1fr_1fr_120px] gap-4 border-b border-slate-200 px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
            Tanggal Booking
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
            Instruktur / Kendaraan
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
            Booking Paket
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
            Status
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700">
            Aksi
          </p>
        </div>

        <div>
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1.1fr_1fr_1fr_1fr_120px] gap-4 border-b border-slate-200 px-5 py-4 last:border-b-0"
            >
              <div>
                <p className="text-base font-bold text-slate-950">
                  {item.code}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {item.dateLabel}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.timeRange}
                </p>
              </div>

              <div>
                <p className="text-base font-semibold text-slate-950">
                  {item.instructorName}
                </p>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                  <CarFront className="h-4 w-4" />
                  <span>{item.vehicleName}</span>
                </div>
              </div>

              <div>
                <p className="text-base font-semibold text-slate-950">
                  {item.packageName}
                </p>
                <p className="mt-1 text-sm text-slate-600">{item.priceLabel}</p>
              </div>

              <div className="pt-1">
                <BookingHistoryStatusBadge status={item.status} />
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {item.paymentMethodLabel} • {item.paymentStatus}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => onViewDetail(item)}
                  className={cn(
                    "text-xs font-bold uppercase tracking-[0.08em] transition",
                    item.status === "DIBATALKAN"
                      ? "text-slate-400 hover:text-slate-500"
                      : "text-blue-600 hover:text-blue-700",
                  )}
                >
                  Lihat Detail
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <PaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            label={`Menampilkan ${items.length} dari ${totalCount} riwayat booking paket`}
            onPageChange={onPageChange}
          />
        </div>
      </Card>

      <div className="space-y-3 lg:hidden">
        {items.map((item) => (
          <Card key={item.id} className="min-w-0 rounded-2xl p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="break-words text-sm font-bold text-slate-950">
                  {item.code}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {item.dateLabel}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {item.timeRange}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <BookingHistoryStatusBadge status={item.status} />
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                  {item.paymentMethodLabel}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Instruktur
                </p>
                <p className="mt-1 break-words text-xs font-semibold text-slate-900">
                  {item.instructorName}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Kendaraan
                </p>
                <p className="mt-1 break-words text-xs font-semibold text-slate-900">
                  {item.vehicleName}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Booking Paket
                </p>
                <p className="mt-1 break-words text-xs font-semibold text-slate-900">
                  {item.packageName}
                </p>
              </div>

              <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Pembayaran
                </p>
                <p className="mt-1 break-words text-xs font-semibold text-slate-900">
                  {item.paymentMethodLabel} • {item.paymentStatus}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onViewDetail(item)}
              className="mt-4 text-xs font-bold uppercase tracking-wide text-blue-600 transition hover:text-blue-700"
            >
              Lihat Detail
            </button>
          </Card>
        ))}
      </div>
    </>
  );
}
