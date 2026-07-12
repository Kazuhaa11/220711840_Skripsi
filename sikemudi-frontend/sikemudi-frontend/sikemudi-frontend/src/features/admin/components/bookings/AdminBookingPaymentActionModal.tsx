import { useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import type { AdminBookingRowItem } from "@/types/adminBooking";

type PaymentActionMode = "confirm" | "reject";

interface AdminBookingPaymentActionModalProps {
  opened: boolean;
  mode: PaymentActionMode;
  item: AdminBookingRowItem | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (values: { catatan_admin?: string; alasan_penolakan?: string }) => void;
}

export default function AdminBookingPaymentActionModal({
  opened,
  mode,
  item,
  loading = false,
  onClose,
  onConfirm,
}: AdminBookingPaymentActionModalProps) {
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const isReject = mode === "reject";
  const isCash = item?.isCashPayment ?? false;

  useEffect(() => {
    if (!opened) {
      setAdminNote("");
      setRejectionReason("");
    }
  }, [opened]);

  if (!item) return null;

  function handleSubmit() {
    onConfirm({
      catatan_admin: adminNote.trim() || undefined,
      alasan_penolakan: rejectionReason.trim() || undefined,
    });
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      title={isReject ? "Tolak Pembayaran" : isCash ? "Konfirmasi Pembayaran Cash" : "Konfirmasi Pembayaran"}
      description={item.code}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Tutup
          </Button>

          <Button
            variant={isReject ? "danger" : "primary"}
            onClick={handleSubmit}
            disabled={loading || (isReject && !rejectionReason.trim())}
            loading={loading}
            leftIcon={isReject ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          >
            {isReject ? "Tolak Pembayaran" : isCash ? "Konfirmasi Cash" : "Konfirmasi Pembayaran"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Card className="rounded-3xl bg-slate-50 p-4 shadow-none">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Booking
          </p>
          <p className="mt-2 text-lg font-black text-slate-950">{item.participantName}</p>
          <p className="mt-1 text-sm text-slate-600">
            {item.packageName} • {item.paymentAmountLabel}
          </p>
          <p className="mt-1 text-sm text-slate-600">Metode: {item.paymentMethodLabel}</p>
          <p className="mt-1 text-sm text-slate-600">Status bayar: {item.paymentStatus}</p>
          {isCash ? (
            <p className="mt-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
              Pembayaran cash tidak membutuhkan bukti upload. Konfirmasi hanya jika uang sudah diterima admin.
            </p>
          ) : null}
        </Card>

        {isReject ? (
          <TextArea
            label="Alasan Penolakan"
            requiredMark
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder="Contoh: nominal tidak sesuai / bukti bayar tidak terbaca..."
            rows={4}
            disabled={loading}
          />
        ) : null}

        <TextArea
          label="Catatan Admin"
          value={adminNote}
          onChange={(event) => setAdminNote(event.target.value)}
          placeholder="Catatan opsional untuk riwayat pembayaran..."
          rows={3}
          disabled={loading}
        />
      </div>
    </Modal>
  );
}
