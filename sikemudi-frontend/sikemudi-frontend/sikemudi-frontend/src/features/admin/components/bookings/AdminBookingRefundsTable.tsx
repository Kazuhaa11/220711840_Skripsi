import { CheckCircle2, Clock3, Eye, ShieldCheck, XCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrapper,
} from "@/components/ui/Table";
import type { AdminBookingRefundApiItem } from "@/types/adminBooking";

interface AdminBookingRefundsTableProps {
  items: AdminBookingRefundApiItem[];
  loading?: boolean;
  onDetail: (item: AdminBookingRefundApiItem) => void;
  onProcess: (item: AdminBookingRefundApiItem) => void;
  onComplete: (item: AdminBookingRefundApiItem) => void;
  onReject?: (item: AdminBookingRefundApiItem) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function statusVariant(status: string): "default" | "success" | "warning" | "danger" | "info" {
  if (status === "Selesai") return "success";
  if (status === "Diproses") return "info";
  if (status === "Ditolak") return "danger";
  return "warning";
}

function renderActionButton(
  item: AdminBookingRefundApiItem,
  onDetail: (item: AdminBookingRefundApiItem) => void,
  onProcess: (item: AdminBookingRefundApiItem) => void,
  onComplete: (item: AdminBookingRefundApiItem) => void,
  onReject?: (item: AdminBookingRefundApiItem) => void,
) {
  const iconButtonClass =
    "h-9 w-9 rounded-lg p-0 [&>span]:sr-only [&>svg]:h-4 [&>svg]:w-4";

  if (item.status_refund === "Diajukan") {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className={`${iconButtonClass} text-slate-700`}
          aria-label={`Lihat detail refund ${item.kode_group ?? item.id}`}
          title="Detail refund"
          leftIcon={<Eye />}
          onClick={() => onDetail(item)}
        >
          Detail refund
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`${iconButtonClass} text-blue-700`}
          aria-label={`Verifikasi refund ${item.kode_group ?? item.id}`}
          title="Verifikasi refund"
          leftIcon={<ShieldCheck />}
          onClick={() => onProcess(item)}
        >
          Verifikasi refund
        </Button>
        {onReject ? (
          <Button
            variant="outline"
            size="sm"
            className={`${iconButtonClass} text-red-700`}
            aria-label={`Tolak refund ${item.kode_group ?? item.id}`}
            title="Tolak refund"
            leftIcon={<XCircle />}
            onClick={() => onReject(item)}
          >
            Tolak refund
          </Button>
        ) : null}
      </div>
    );
  }

  if (item.status_refund === "Diproses") {
    return (
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className={`${iconButtonClass} text-slate-700`}
          aria-label={`Lihat detail refund ${item.kode_group ?? item.id}`}
          title="Detail refund"
          leftIcon={<Eye />}
          onClick={() => onDetail(item)}
        >
          Detail refund
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={`${iconButtonClass} text-emerald-700`}
          aria-label={`Selesaikan refund ${item.kode_group ?? item.id}`}
          title="Selesaikan refund"
          leftIcon={<CheckCircle2 />}
          onClick={() => onComplete(item)}
        >
          Selesaikan refund
        </Button>
        {onReject ? (
          <Button
            variant="outline"
            size="sm"
            className={`${iconButtonClass} text-red-700`}
            aria-label={`Tolak refund ${item.kode_group ?? item.id}`}
            title="Tolak refund"
            leftIcon={<XCircle />}
            onClick={() => onReject(item)}
          >
            Tolak refund
          </Button>
        ) : null}
      </div>
    );
  }

  if (item.status_refund === "Selesai") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`${iconButtonClass} text-slate-700`}
        aria-label={`Lihat detail refund ${item.kode_group ?? item.id}`}
        title="Detail refund"
        leftIcon={<Eye />}
        onClick={() => onDetail(item)}
      >
        Detail refund
      </Button>
    );
  }

  if (item.status_refund === "Ditolak") {
    return (
      <Button
        variant="outline"
        size="sm"
        className={`${iconButtonClass} text-slate-700`}
        aria-label={`Lihat detail refund ${item.kode_group ?? item.id}`}
        title="Detail refund"
        leftIcon={<Eye />}
        onClick={() => onDetail(item)}
      >
        Detail refund
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`${iconButtonClass} text-slate-700`}
      aria-label={`Lihat detail refund ${item.kode_group ?? item.id}`}
      title="Detail refund"
      leftIcon={<Eye />}
      onClick={() => onDetail(item)}
    >
      Detail refund
    </Button>
  );
}

export default function AdminBookingRefundsTable({
  items,
  loading = false,
  onDetail,
  onProcess,
  onComplete,
  onReject,
}: AdminBookingRefundsTableProps) {
  if (!loading && items.length === 0) {
    return (
      <EmptyState
        icon={<Clock3 className="h-8 w-8" />}
        title="Belum ada pengajuan refund"
        description="Refund muncul setelah peserta membatalkan paket yang sudah memiliki pembayaran terkonfirmasi atau bukti bayar yang menunggu konfirmasi."
      />
    );
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm font-semibold text-slate-500 shadow-sm">
            Memuat daftar refund...
          </div>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-base font-extrabold text-slate-950">
                    {item.kode_group ?? "-"}
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                    {item.participant?.nama_peserta ?? "-"}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {item.course_package?.nama_paket ?? "Paket Kursus"}
                  </p>
                </div>

                <Badge
                  variant={statusVariant(item.status_refund)}
                  className="w-fit text-[10px] font-bold uppercase tracking-[0.08em]"
                >
                  {item.status_refund}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Rekening Refund
                  </p>
                  <p className="mt-1 font-bold text-slate-950">{item.bank_tujuan}</p>
                  <p className="mt-1 break-all text-xs text-slate-600">{item.nomor_rekening}</p>
                  <p className="mt-1 break-words text-xs text-slate-500">
                    a.n. {item.nama_penerima}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Pengajuan
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {item.tanggal_pengajuan ?? "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                      Tipe
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">{item.tipe_refund}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Pembayaran
                  </p>
                  <Badge
                    variant={item.payment?.status === "Terkonfirmasi" ? "success" : "warning"}
                    className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em]"
                  >
                    {item.payment?.status ?? "-"}
                  </Badge>
                  <p className="mt-2 text-xs text-slate-500">
                    Bukti: {item.payment?.ada_bukti_bayar ? "Ada" : "Tidak ada"}
                  </p>
                  {item.payment?.bukti_bayar_url ? (
                    <a
                      href={item.payment.bukti_bayar_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex text-xs font-bold text-blue-700 hover:text-blue-800"
                    >
                      Lihat bukti
                    </a>
                  ) : null}
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    Nominal Refund
                  </p>
                  <p className="mt-1 text-base font-extrabold text-slate-950">
                    {formatCurrency(item.nominal_refund)}
                  </p>
                  {item.alasan_refund ? (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.alasan_refund}</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
                {renderActionButton(item, onDetail, onProcess, onComplete, onReject)}
              </div>
            </article>
          ))
        )}
      </div>

      <TableWrapper className="hidden lg:block">
      <Table className="text-sm">
        <TableHead>
          <TableRow>
            <TableHeaderCell className="px-4 py-3">Booking & Peserta</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3">Rekening</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3">Pembayaran</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3">Refund</TableHeaderCell>
            <TableHeaderCell className="px-4 py-3 text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                Memuat daftar refund...
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50/70">
                <TableCell className="px-4 py-3">
                  <div className="max-w-65">
                    <p className="truncate font-bold text-slate-950">{item.kode_group ?? "-"}</p>
                    <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                      {item.participant?.nama_peserta ?? "-"}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {item.course_package?.nama_paket ?? "Paket Kursus"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Diajukan: {item.tanggal_pengajuan ?? "-"}</p>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div className="max-w-57.5">
                    <p className="truncate font-semibold text-slate-950">{item.bank_tujuan}</p>
                    <p className="mt-1 truncate text-xs text-slate-600">{item.nomor_rekening}</p>
                    <p className="mt-1 truncate text-xs text-slate-500">a.n. {item.nama_penerima}</p>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div className="max-w-47.5">
                    <Badge
                      variant={item.payment?.status === "Terkonfirmasi" ? "success" : "warning"}
                      className="text-[10px] font-bold uppercase tracking-[0.08em]"
                    >
                      {item.payment?.status ?? "-"}
                    </Badge>
                    <p className="mt-2 text-xs text-slate-500">
                      Bukti: {item.payment?.ada_bukti_bayar ? "Ada" : "Tidak ada"}
                    </p>
                    {item.payment?.bukti_bayar_url ? (
                      <a
                        href={item.payment.bukti_bayar_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex text-xs font-bold text-blue-700 hover:text-blue-800"
                      >
                        Lihat bukti
                      </a>
                    ) : null}
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div className="max-w-42.5">
                    <p className="font-bold text-slate-950">{formatCurrency(item.nominal_refund)}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.tipe_refund}</p>
                    <Badge
                      variant={statusVariant(item.status_refund)}
                      className="mt-2 text-[10px] font-bold uppercase tracking-[0.08em]"
                    >
                      {item.status_refund}
                    </Badge>
                  </div>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div className="flex justify-end">
                    {renderActionButton(item, onDetail, onProcess, onComplete, onReject)}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableWrapper>
    </>
  );
}
