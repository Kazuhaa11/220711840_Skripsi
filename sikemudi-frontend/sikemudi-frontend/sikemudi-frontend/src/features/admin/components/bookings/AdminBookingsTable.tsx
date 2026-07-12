import {
  CalendarClock,
  CheckCircle2,
  Eye,
  FileSearch,
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";
import PaginationBar from "@/components/common/PaginationBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrapper,
} from "@/components/ui/Table";
import {
  getBookingStatusBadgeVariant,
  getPaymentStatusBadgeVariant,
} from "@/features/admin/utils/adminBookingMapper";
import type { PaginationMeta } from "@/types/api";
import type { AdminBookingRowItem } from "@/types/adminBooking";

interface AdminBookingsTableProps {
  items: AdminBookingRowItem[];
  pagination: PaginationMeta | null;
  loading?: boolean;
  onDetail: (item: AdminBookingRowItem) => void;
  onViewPaymentProof: (item: AdminBookingRowItem) => void;
  onConfirmPayment: (item: AdminBookingRowItem) => void;
  onRejectPayment: (item: AdminBookingRowItem) => void;
  onReschedule: (item: AdminBookingRowItem) => void;
  onCancel: (item: AdminBookingRowItem) => void;
  onPageChange: (page: number) => void;
}

function canConfirm(item: AdminBookingRowItem): boolean {
  return item.bookingStatus === "Menunggu Konfirmasi Pembayaran" && item.paymentStatus === "Menunggu Konfirmasi";
}

function canReject(item: AdminBookingRowItem): boolean {
  return (
    !item.isCashPayment &&
    item.bookingStatus === "Menunggu Konfirmasi Pembayaran" &&
    item.paymentStatus === "Menunggu Konfirmasi"
  );
}

function canReschedule(item: AdminBookingRowItem): boolean {
  if (item.isPackageBooking) return false;

  return [
    "Menunggu Konfirmasi Pembayaran",
    "Dikonfirmasi",
    "Dijadwalkan Ulang",
  ].includes(item.bookingStatus);
}

function canCancel(item: AdminBookingRowItem): boolean {
  return !["Selesai", "Dibatalkan"].includes(item.bookingStatus);
}

function shouldShowCancelButton(item: AdminBookingRowItem): boolean {
  return item.paymentStatus !== "Terkonfirmasi";
}

export default function AdminBookingsTable({
  items,
  pagination,
  loading = false,
  onDetail,
  onViewPaymentProof,
  onConfirmPayment,
  onRejectPayment,
  onReschedule,
  onCancel,
  onPageChange,
}: AdminBookingsTableProps) {
  if (!loading && items.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock className="h-8 w-8" />}
        title="Belum ada data booking"
        description="Data booking peserta akan muncul setelah peserta melakukan booking paket."
      />
    );
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow-sm">
            Memuat data booking...
          </div>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-base font-extrabold text-slate-950">{item.code}</p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                    {item.participantName}
                  </p>
                  <p className="mt-1 break-all text-xs text-slate-500">{item.participantEmail}</p>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <Badge
                    variant={getBookingStatusBadgeVariant(item.bookingStatus)}
                    className="text-[10px] font-bold uppercase tracking-[0.08em]"
                  >
                    {item.bookingStatusLabel}
                  </Badge>
                  <Badge
                    variant={getPaymentStatusBadgeVariant(item.paymentStatus)}
                    className="text-[10px] font-bold uppercase tracking-[0.08em]"
                  >
                    {item.paymentMethodLabel} • {item.paymentStatus}
                  </Badge>
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Paket & Jadwal
                  </p>
                  <p className="mt-1 font-bold text-slate-950">{item.packageName}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {item.dateLabel} • {item.timeLabel}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Instruktur
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">{item.instructorName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Kendaraan
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">{item.vehicleName}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Pembayaran
                  </p>
                  <p className="mt-1 font-bold text-slate-950">{item.paymentAmountLabel}</p>
                  <p className="mt-1 break-words text-xs text-slate-500">
                    {item.isCashPayment ? "Tidak perlu upload bukti" : item.hasPaymentProof ? item.paymentProofName : "Belum ada bukti"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Progress
                  </p>
                  <p className="mt-1 font-bold text-blue-700">
                    {item.isPackageBooking ? item.progressLabel : "Booking sesi"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.priceLabel}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-200 pt-4 sm:grid-cols-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 justify-center rounded-xl px-3 text-xs"
                  leftIcon={<Eye className="h-4 w-4" />}
                  onClick={() => onDetail(item)}
                >
                  Detail
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 justify-center rounded-xl px-3 text-xs"
                  leftIcon={<FileSearch className="h-4 w-4" />}
                  onClick={() => onViewPaymentProof(item)}
                  disabled={item.isCashPayment || !item.hasPaymentProof}
                >
                  {item.isCashPayment ? "Cash" : "Bukti"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 justify-center rounded-xl px-3 text-xs text-emerald-700"
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  onClick={() => onConfirmPayment(item)}
                  disabled={!canConfirm(item)}
                >
                  {item.isCashPayment ? "Konfirmasi Cash" : "Konfirmasi"}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 justify-center rounded-xl px-3 text-xs text-red-700"
                  leftIcon={<XCircle className="h-4 w-4" />}
                  onClick={() => onRejectPayment(item)}
                  disabled={!canReject(item)}
                >
                  Tolak
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 justify-center rounded-xl px-3 text-xs"
                  leftIcon={<RotateCcw className="h-4 w-4" />}
                  onClick={() => onReschedule(item)}
                  disabled={!canReschedule(item)}
                >
                  Ubah
                </Button>

                {shouldShowCancelButton(item) ? (
                  <Button
                    variant="danger"
                    size="sm"
                    className="h-9 justify-center rounded-xl px-3 text-xs"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    onClick={() => onCancel(item)}
                    disabled={!canCancel(item)}
                  >
                    Batal
                  </Button>
                ) : null}
              </div>
            </article>
          ))
        )}

        {!loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <PaginationBar
              currentPage={pagination?.current_page ?? 1}
              totalPages={pagination?.last_page ?? 1}
              label={
                <>
                  Menampilkan <span className="font-bold">{items.length}</span> dari{" "}
                  <span className="font-bold">{pagination?.total ?? items.length}</span> booking
                </>
              }
              onPageChange={onPageChange}
            />
          </div>
        ) : null}
      </div>

      <TableWrapper className="hidden lg:block">
      <Table className="text-sm">
        <TableHead>
          <TableRow>
            <TableHeaderCell className="px-4 py-3">Booking & Peserta</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3">Paket & Jadwal</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3">Status</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3">Pembayaran</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3 text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                Memuat data booking...
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50/70">
                <TableCell className="px-4 py-3">
                  <div className="max-w-[260px]">
                    <p className="truncate font-bold text-slate-950">{item.code}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                      {item.participantName}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">{item.participantEmail}</p>
                    <p className="mt-1 text-xs font-semibold text-blue-700">
                      {item.isPackageBooking ? item.progressLabel : "Booking sesi"}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div className="max-w-[310px]">
                    <p className="truncate font-semibold text-slate-950">{item.packageName}</p>
                    <p className="mt-1 text-xs text-slate-600">
                      {item.dateLabel} • {item.timeLabel}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {item.instructorName} • {item.vehicleName}
                    </p>
                    <p className="mt-1 text-xs font-bold text-blue-700">{item.priceLabel}</p>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <Badge
                    variant={getBookingStatusBadgeVariant(item.bookingStatus)}
                    className="text-[10px] font-bold uppercase tracking-[0.08em]"
                  >
                    {item.bookingStatusLabel}
                  </Badge>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div className="max-w-[190px]">
                    <Badge
                      variant={getPaymentStatusBadgeVariant(item.paymentStatus)}
                      className="text-[10px] font-bold uppercase tracking-[0.08em]"
                    >
                      {item.paymentStatus}
                    </Badge>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-blue-700">{item.paymentMethodLabel}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-700">{item.paymentAmountLabel}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {item.isCashPayment ? "Tidak perlu upload bukti" : item.hasPaymentProof ? item.paymentProofName : "Belum ada bukti"}
                    </p>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-lg p-0"
                      aria-label={`Detail ${item.code}`}
                      onClick={() => onDetail(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-lg p-0"
                      aria-label={`Bukti bayar ${item.code}`}
                      onClick={() => onViewPaymentProof(item)}
                      disabled={item.isCashPayment || !item.hasPaymentProof}
                    >
                      <FileSearch className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-lg p-0 text-emerald-700"
                      aria-label={`Konfirmasi pembayaran ${item.code}`}
                      onClick={() => onConfirmPayment(item)}
                      disabled={!canConfirm(item)}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-lg p-0 text-red-700"
                      aria-label={`Tolak pembayaran ${item.code}`}
                      onClick={() => onRejectPayment(item)}
                      disabled={!canReject(item)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 rounded-lg p-0"
                      aria-label={`Ubah jadwal ${item.code}`}
                      onClick={() => onReschedule(item)}
                      disabled={!canReschedule(item)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>

                    {shouldShowCancelButton(item) ? (
                      <Button
                        variant="danger"
                        size="sm"
                        className="h-8 w-8 rounded-lg p-0"
                        aria-label={`Batalkan ${item.code}`}
                        onClick={() => onCancel(item)}
                        disabled={!canCancel(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <TableFooter className="bg-slate-50 px-4 py-3">
        <PaginationBar
          currentPage={pagination?.current_page ?? 1}
          totalPages={pagination?.last_page ?? 1}
          label={
            <>
              Menampilkan <span className="font-bold">{items.length}</span> dari{" "}
              <span className="font-bold">{pagination?.total ?? items.length}</span> booking
            </>
          }
          onPageChange={onPageChange}
        />
      </TableFooter>
    </TableWrapper>
    </>
  );
}
