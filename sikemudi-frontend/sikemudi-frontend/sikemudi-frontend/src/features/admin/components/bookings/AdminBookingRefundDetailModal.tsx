import {
  CalendarClock,
  CreditCard,
  FileText,
  Landmark,
  ReceiptText,
  UserRound,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import type { AdminBookingRefundApiItem } from "@/types/adminBooking";

interface AdminBookingRefundDetailModalProps {
  opened: boolean;
  item: AdminBookingRefundApiItem | null;
  onClose: () => void;
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

function InfoItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-950">
        {value ?? "-"}
      </p>
    </div>
  );
}

export default function AdminBookingRefundDetailModal({
  opened,
  item,
  onClose,
}: AdminBookingRefundDetailModalProps) {
  if (!item) return null;

  const paymentProofUrl = item.payment?.bukti_bayar_url ?? null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="2xl"
      title="Detail Refund"
      description={item.kode_group ?? `Refund #${item.id}`}
      bodyClassName="max-h-[calc(100dvh-15rem)]"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={onClose} className="rounded-2xl">
            Tutup
          </Button>

          {paymentProofUrl ? (
            <a href={paymentProofUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" className="w-full rounded-2xl sm:w-auto">
                Lihat Bukti Bayar
              </Button>
            </a>
          ) : null}
        </div>
      }
    >
      <div className="space-y-4 sm:space-y-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-3xl bg-slate-50 p-5 shadow-none lg:col-span-1">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-blue-700" />
              <p className="font-bold text-slate-950">Peserta</p>
            </div>

            <div className="mt-5 space-y-4">
              <InfoItem label="Nama Peserta" value={item.participant?.nama_peserta} />
              <InfoItem label="Kode Peserta" value={item.participant?.kode_peserta} />
              <InfoItem label="Paket" value={item.course_package?.nama_paket ?? "Paket Kursus"} />
              <InfoItem label="Kode Booking" value={item.kode_group} />
            </div>
          </Card>

          <Card className="rounded-3xl bg-slate-50 p-5 shadow-none lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Status Refund
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    variant={statusVariant(item.status_refund)}
                    className="font-bold uppercase tracking-[0.08em]"
                  >
                    {item.status_refund}
                  </Badge>
                  <Badge variant="info" className="font-bold uppercase tracking-[0.08em]">
                    {item.tipe_refund}
                  </Badge>
                </div>
              </div>

              <p className="text-right text-lg font-black text-blue-700">
                {formatCurrency(item.nominal_refund)}
              </p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <InfoItem label="Tanggal Pengajuan" value={item.tanggal_pengajuan} />
              <InfoItem label="Tanggal Diproses" value={item.tanggal_diproses} />
              <InfoItem label="Tanggal Refund" value={item.tanggal_refund} />
              <InfoItem label="Diajukan Oleh" value={item.requested_by?.name} />
              <InfoItem label="Diproses Oleh" value={item.processed_by?.name} />
              <InfoItem label="Diperbarui" value={item.updated_at} />
            </div>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="rounded-3xl p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3">
              <Landmark className="h-5 w-5 text-blue-700" />
              <p className="font-bold text-slate-950">Rekening Refund</p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoItem label="Bank Tujuan" value={item.bank_tujuan} />
              <InfoItem label="Nomor Rekening" value={item.nomor_rekening} />
              <InfoItem label="Nama Penerima" value={item.nama_penerima} />
              <InfoItem label="Tipe Refund" value={item.tipe_refund} />
            </div>
          </Card>

          <Card className="rounded-3xl p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-blue-700" />
              <p className="font-bold text-slate-950">Pembayaran</p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoItem label="Status Pembayaran" value={item.payment?.status} />
              <InfoItem
                label="Nominal Bayar"
                value={
                  item.payment?.nominal_bayar !== undefined
                    ? formatCurrency(item.payment.nominal_bayar)
                    : "-"
                }
              />
              <InfoItem
                label="Bukti Bayar"
                value={item.payment?.ada_bukti_bayar ? "Ada" : "Tidak ada"}
              />
              <InfoItem label="Tanggal Verifikasi" value={item.payment?.tanggal_verifikasi} />
            </div>
          </Card>
        </div>

        <Card className="rounded-3xl p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-700" />
            <p className="font-bold text-slate-950">Catatan Refund</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <InfoItem label="Alasan Refund" value={item.alasan_refund} />
            <InfoItem label="Catatan Peserta" value={item.catatan_peserta} />
            <InfoItem label="Catatan Admin" value={item.catatan_admin} />
          </div>
        </Card>

        <Card className="rounded-3xl p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <CalendarClock className="h-5 w-5 text-blue-700" />
            <p className="font-bold text-slate-950">Metadata</p>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <InfoItem label="ID Refund" value={item.id} />
            <InfoItem label="ID Booking Paket" value={item.booking_group_id} />
            <InfoItem label="ID Pembayaran" value={item.booking_payment_id} />
            <InfoItem label="Dibuat" value={item.created_at} />
            <InfoItem label="Diubah" value={item.updated_at} />
            <InfoItem label="Status" value={item.status_refund} />
          </div>
        </Card>

        <Card className="rounded-3xl bg-blue-50 p-4 text-sm font-medium text-blue-800 shadow-none sm:p-5">
          <div className="flex items-start gap-3">
            <ReceiptText className="mt-0.5 h-5 w-5 shrink-0" />
            <p>
              Gunakan detail rekening dan nominal di atas untuk proses transfer refund manual,
              lalu tandai status refund melalui tombol aksi pada tabel.
            </p>
          </div>
        </Card>
      </div>
    </Modal>
  );
}
