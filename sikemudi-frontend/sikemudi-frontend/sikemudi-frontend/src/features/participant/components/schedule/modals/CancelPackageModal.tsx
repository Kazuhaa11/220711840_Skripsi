import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import { cancelParticipantBookingPackage } from "@/services/booking.service";
import type {
  BookingGroupApiItem,
  BookingGroupSessionApiItem,
} from "@/types/booking";

interface CancelPackageModalProps {
  opened: boolean;
  group: BookingGroupApiItem | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function resolveDate(value?: string | null): string {
  if (!value) return "Tanggal belum tersedia";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function resolveTime(session: BookingGroupSessionApiItem): string {
  const start = session.training_schedule?.time_slot?.jam_mulai;
  const end = session.training_schedule?.time_slot?.jam_selesai;
  return start && end ? `${start} - ${end}` : "Jam belum tersedia";
}

function getNearestActiveSession(
  group: BookingGroupApiItem | null,
): BookingGroupSessionApiItem | null {
  if (!group) return null;

  return (
    [...group.sessions]
      .filter((session) => !["Selesai", "Dibatalkan"].includes(session.status))
      .sort((a, b) => {
        const aDate = a.training_schedule?.tanggal_latihan ?? "9999-12-31";
        const bDate = b.training_schedule?.tanggal_latihan ?? "9999-12-31";
        const aTime = a.training_schedule?.time_slot?.jam_mulai ?? "23:59:59";
        const bTime = b.training_schedule?.time_slot?.jam_mulai ?? "23:59:59";
        return `${aDate} ${aTime}`.localeCompare(`${bDate} ${bTime}`);
      })[0] ?? null
  );
}

function shouldRequestRefund(group: BookingGroupApiItem | null): boolean {
  const payment = group?.payment;
  if (!payment) return false;

  return (
    payment.status === "Terkonfirmasi" ||
    (payment.status === "Menunggu Konfirmasi" && payment.ada_bukti_bayar)
  );
}

function resolveRefundInfo(group: BookingGroupApiItem | null): string {
  const payment = group?.payment;

  if (!payment) {
    return "Pembayaran paket belum tersedia, sehingga pembatalan paket tidak membuat pengajuan refund.";
  }

  if (payment.status === "Terkonfirmasi") {
    return "Karena pembayaran paket sudah dikonfirmasi admin, pembatalan akan membuat pengajuan refund. Admin akan memproses refund berdasarkan data rekening di bawah ini.";
  }

  if (payment.status === "Menunggu Konfirmasi" && payment.ada_bukti_bayar) {
    return "Bukti pembayaran sudah diunggah tetapi belum dikonfirmasi admin. Pembatalan tetap membuat pengajuan refund, lalu admin akan memeriksa bukti pembayaran sebelum memproses refund.";
  }

  return "Pembayaran paket belum diunggah atau tidak valid, sehingga pembatalan paket tidak membuat pengajuan refund.";
}

export default function CancelPackageModal({
  opened,
  group,
  onClose,
  onSuccess,
}: CancelPackageModalProps) {
  const { showNotification } = useFloatingNotification();
  const [reason, setReason] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nearestSession = useMemo(() => getNearestActiveSession(group), [group]);
  const needsRefund = shouldRequestRefund(group);
  const refundAmount = group?.payment?.nominal_bayar ?? group?.harga_paket ?? 0;

  useEffect(() => {
    if (!opened) return;
    setReason("");
    setBankName("");
    setAccountNumber("");
    setAccountHolderName("");
  }, [opened]);

  async function handleSubmit() {
    if (!group) return;

    if (
      needsRefund &&
      (!bankName.trim() || !accountNumber.trim() || !accountHolderName.trim())
    ) {
      showNotification({
        type: "error",
        title: "Data refund belum lengkap",
        message:
          "Bank tujuan, nomor rekening, dan nama penerima wajib diisi untuk pengajuan refund.",
        duration: 3500,
      });
      return;
    }

    try {
      setSubmitting(true);

      await cancelParticipantBookingPackage(group.id, {
        alasan_pembatalan: reason.trim() || null,
        bank_tujuan: needsRefund ? bankName.trim() : null,
        nomor_rekening: needsRefund ? accountNumber.trim() : null,
        nama_penerima: needsRefund ? accountHolderName.trim() : null,
        catatan_refund: null,
      });

      await onSuccess();
      onClose();
    } catch (err) {
      showNotification({
        type: "error",
        title: "Pembatalan gagal",
        message:
          err instanceof Error ? err.message : "Booking paket gagal dibatalkan.",
        duration: 4000,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={submitting ? () => undefined : onClose}
      size="md"
      compact
      title="Batalkan Booking Paket"
      description="Pembatalan berlaku untuk seluruh sesi dalam paket."
      className="max-h-[90dvh]"
      bodyClassName="max-h-[70dvh] px-4 py-4 sm:px-6"
      footerClassName="px-4 py-3 sm:px-6"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="h-10 w-full rounded-2xl px-5 sm:w-auto"
          >
            Tutup
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            loading={submitting}
            className="h-10 w-full rounded-2xl px-5 sm:w-auto"
          >
            Batalkan Paket
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {group ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-xs text-red-800">
            <p className="font-bold">Paket yang akan dibatalkan</p>
            <p className="mt-1 font-semibold text-red-950">
              {group.course_package?.nama_paket ?? "Paket Kursus"}
            </p>
            <p>
              {group.kode_group} • {group.total_sesi} sesi
            </p>
            {nearestSession ? (
              <p className="mt-2">
                Sesi terdekat: Sesi {nearestSession.sesi_ke}/
                {nearestSession.total_sesi} •{" "}
                {resolveDate(nearestSession.training_schedule?.tanggal_latihan)}{" "}
                • {resolveTime(nearestSession)}
              </p>
            ) : null}
            <p className="mt-2 font-semibold">
              Semua sesi aktif pada paket ini akan dibatalkan dan kapasitas
              jadwalnya dilepas kembali.
            </p>
          </div>
        ) : null}

        {needsRefund ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
            <p className="text-sm font-bold text-blue-950">Pengajuan refund</p>
            <p className="mt-1 text-xs leading-relaxed text-blue-800">
              {resolveRefundInfo(group)} Nominal maksimal refund:{" "}
              <span className="font-bold">{formatCurrency(refundAmount)}</span>.
            </p>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <Input
                label="Bank Tujuan"
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
                placeholder="Contoh: BCA, BRI, Mandiri"
                requiredMark
              />
              <Input
                label="Nomor Rekening"
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value)}
                placeholder="Nomor rekening penerima refund"
                requiredMark
              />
              <Input
                label="Nama Penerima"
                value={accountHolderName}
                onChange={(event) => setAccountHolderName(event.target.value)}
                placeholder="Nama sesuai rekening"
                requiredMark
                wrapperClassName="md:col-span-2"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
            {resolveRefundInfo(group)}
          </div>
        )}

        <TextArea
          label="Alasan Pembatalan"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Opsional, tuliskan alasan pembatalan paket."
          rows={2}
        />
      </div>
    </Modal>
  );
}
