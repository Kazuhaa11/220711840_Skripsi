import {
  CalendarDays,
  CarFront,
  CreditCard,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import {
  getBookingStatusBadgeVariant,
  getPaymentStatusBadgeVariant,
} from "@/features/admin/utils/adminBookingMapper";
import type { AdminBookingDetailItem } from "@/types/adminBooking";

interface AdminBookingDetailModalProps {
  opened: boolean;
  item: AdminBookingDetailItem | null;
  onClose: () => void;
  onViewPaymentProof: (item: AdminBookingDetailItem) => void;
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export default function AdminBookingDetailModal({
  opened,
  item,
  onClose,
  onViewPaymentProof,
}: AdminBookingDetailModalProps) {
  if (!item) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="2xl"
      title="Detail Booking"
      description={item.code}
      bodyClassName="max-h-[calc(100dvh-15rem)]"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={onClose} className="rounded-2xl">
            Tutup
          </Button>

          <Button
            variant="outline"
            onClick={() => onViewPaymentProof(item)}
            disabled={!item.hasPaymentProof}
            className="rounded-2xl"
          >
            Lihat Bukti Bayar
          </Button>
        </div>
      }
    >
      <div className="min-w-0 space-y-4 sm:space-y-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-3xl bg-slate-50 p-5 shadow-none lg:col-span-1">
            <div className="flex items-center gap-3">
              <UserRound className="h-5 w-5 text-blue-700" />
              <p className="font-bold text-slate-950">Data Peserta</p>
            </div>

            <div className="mt-5 space-y-4">
              <InfoItem label="Nama Peserta" value={item.participantName} />
              <InfoItem label="Kode Peserta" value={item.participantCode} />
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="h-4 w-4" />
                {item.participantEmail}
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Phone className="h-4 w-4" />
                {item.participantPhone}
              </p>
            </div>
          </Card>

          <Card className="rounded-3xl bg-slate-50 p-5 shadow-none lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Status Booking
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    variant={getBookingStatusBadgeVariant(item.bookingStatus)}
                    className="font-bold uppercase tracking-[0.08em]"
                  >
                    {item.bookingStatusLabel}
                  </Badge>
                  <Badge
                    variant={getPaymentStatusBadgeVariant(item.paymentStatus)}
                    className="font-bold uppercase tracking-[0.08em]"
                  >
                    {item.paymentStatus}
                  </Badge>
                  <Badge variant="info" className="font-bold uppercase tracking-[0.08em]">
                    {item.paymentMethodLabel}
                  </Badge>
                </div>
              </div>

              <p className="text-right text-lg font-black text-blue-700">{item.priceLabel}</p>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoItem label="Tanggal Booking" value={item.createdAtLabel} />
              <InfoItem label="Tanggal Konfirmasi" value={item.confirmedAtLabel} />
              <InfoItem label="Tanggal Batal" value={item.canceledAtLabel} />
              <InfoItem label="Alasan Batal" value={item.cancellationReason} />
            </div>
          </Card>
        </div>

        <Card className="rounded-3xl p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-blue-700" />
            <p className="font-bold text-slate-950">Jadwal Latihan</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem label="Tanggal" value={item.dateLabel} />
            <InfoItem label="Jam" value={item.timeLabel} />
            <InfoItem label="Instruktur" value={item.instructorName} />
            <InfoItem label="Paket" value={item.packageName} />
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <CarFront className="mt-1 h-5 w-5 shrink-0 text-slate-500" />
            <div>
              <p className="font-semibold text-slate-950">{item.vehicleName}</p>
              <p className="mt-1 text-sm text-slate-600">
                {item.pickupLabel} • {item.simLabel}
              </p>
              <p className="mt-1 text-sm text-slate-600">Alamat jemput: {item.pickupAddress}</p>
            </div>
          </div>
        </Card>


        {item.sessions.length > 0 ? (
          <Card className="rounded-3xl p-4 shadow-sm sm:p-5">
            <p className="font-bold text-slate-950">Daftar Sesi Paket</p>
            <div className="mt-4 space-y-3">
              {item.sessions.map((session) => (
                <div key={session.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold text-slate-950">{session.sessionLabel}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{session.code}</p>
                    </div>
                    <Badge
                      variant={getBookingStatusBadgeVariant(session.status)}
                      className="w-fit font-bold uppercase tracking-[0.08em]"
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <InfoItem label="Tanggal" value={session.dateLabel} />
                    <InfoItem label="Jam" value={session.timeLabel} />
                    <InfoItem label="Hasil" value={session.resultStatus} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <Card className="rounded-3xl p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-blue-700" />
            <p className="font-bold text-slate-950">Pembayaran</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <InfoItem label="Metode" value={item.paymentMethodLabel} />
            <InfoItem label="Nominal" value={item.paymentAmountLabel} />
            <InfoItem label={item.isCashPayment ? "Keterangan" : "Pengirim"} value={item.paymentSender} />
            <InfoItem label="Bank" value={item.paymentBank} />
            <InfoItem label="Upload" value={item.paymentUploadedAt} />
            <InfoItem label="Verifikasi" value={item.paymentVerifiedAt} />
            <InfoItem label="Bukti Bayar" value={item.paymentProofName} />
            <InfoItem label="Catatan Peserta" value={item.paymentParticipantNote} />
            <InfoItem label="Catatan Admin" value={item.paymentAdminNote} />
          </div>

          {item.isCashPayment ? (
            <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-medium text-amber-700">
              Booking ini menggunakan metode cash. Admin hanya perlu mengonfirmasi setelah pembayaran diterima.
            </div>
          ) : null}

          {item.paymentRejectionReason !== "-" ? (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
              Alasan penolakan: {item.paymentRejectionReason}
            </div>
          ) : null}
        </Card>

        {item.histories.length > 0 ? (
          <Card className="rounded-3xl p-4 shadow-sm sm:p-5">
            <p className="font-bold text-slate-950">Riwayat Perubahan</p>
            <div className="mt-4 space-y-3">
              {item.histories.map((history) => (
                <div key={history.id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-semibold text-slate-950">{history.action}</p>
                    <p className="text-xs text-slate-500">{history.createdAt}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {history.statusBefore} → {history.statusAfter}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{history.note}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Oleh: {history.changedBy}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </Modal>
  );
}
