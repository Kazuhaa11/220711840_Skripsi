import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import type { AdminBookingRefundApiItem } from "@/types/adminBooking";

type RefundActionMode = "process" | "complete" | "reject";

interface AdminBookingRefundActionModalProps {
  opened: boolean;
  mode: RefundActionMode;
  item: AdminBookingRefundApiItem | null;
  loading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: (values: {
    nominal_refund?: number | null;
    tipe_refund?: "Penuh" | "Sebagian" | null;
    catatan_admin?: string | null;
  }) => void | Promise<void>;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function resolveTitle(mode: RefundActionMode): string {
  if (mode === "process") return "Verifikasi Refund Booking";
  if (mode === "complete") return "Selesaikan Refund Booking";
  return "Tolak Refund Booking";
}

function resolveButtonLabel(mode: RefundActionMode): string {
  if (mode === "process") return "Verifikasi Refund";
  if (mode === "complete") return "Selesaikan Refund";
  return "Tolak Refund";
}

export default function AdminBookingRefundActionModal({
  opened,
  mode,
  item,
  loading = false,
  error,
  onClose,
  onConfirm,
}: AdminBookingRefundActionModalProps) {
  const [nominalRefund, setNominalRefund] = useState("");
  const [refundType, setRefundType] = useState<"Penuh" | "Sebagian">("Penuh");
  const [adminNote, setAdminNote] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!opened || !item) return;
    const timeoutId = window.setTimeout(() => {
      setNominalRefund(String(item.nominal_refund));
      setRefundType(item.tipe_refund === "Sebagian" ? "Sebagian" : "Penuh");
      setAdminNote("");
      setLocalError(null);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [opened, item]);

  function handleSubmit() {
    if (!item) return;

    if (mode === "reject" && !adminNote.trim()) {
      setLocalError("Catatan penolakan refund wajib diisi.");
      return;
    }

    const parsedNominal = Number(nominalRefund);

    if (mode === "complete" && (!Number.isFinite(parsedNominal) || parsedNominal < 0)) {
      setLocalError("Nominal refund tidak valid.");
      return;
    }

    setLocalError(null);
    void onConfirm({
      nominal_refund: mode === "complete" ? parsedNominal : undefined,
      tipe_refund: mode === "complete" ? refundType : undefined,
      catatan_admin: adminNote.trim() || null,
    });
  }

  return (
    <Modal
      opened={opened}
      onClose={loading ? () => undefined : onClose}
      size="lg"
      title={resolveTitle(mode)}
      description="Gunakan data rekening peserta untuk memproses refund di luar sistem, lalu tandai status refund di sini."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-2xl">
            Tutup
          </Button>
          <Button
            variant={mode === "reject" ? "danger" : "primary"}
            onClick={handleSubmit}
            loading={loading}
            className="rounded-2xl"
          >
            {resolveButtonLabel(mode)}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {item ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-bold text-slate-950">{item.kode_group ?? "Booking Paket"}</p>
            <p className="mt-1">Peserta: {item.participant?.nama_peserta ?? "-"}</p>
            <p className="mt-1">Paket: {item.course_package?.nama_paket ?? "-"}</p>
            <p className="mt-3 font-semibold text-slate-950">Rekening Refund</p>
            <p>{item.bank_tujuan} • {item.nomor_rekening} • a.n. {item.nama_penerima}</p>
            <p className="mt-3 font-semibold text-slate-950">Nominal usulan: {formatCurrency(item.nominal_refund)}</p>
            {item.alasan_refund ? <p className="mt-2">Alasan: {item.alasan_refund}</p> : null}
            {item.catatan_peserta ? <p className="mt-1">Catatan peserta: {item.catatan_peserta}</p> : null}
          </div>
        ) : null}

        {mode === "complete" ? (
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Nominal Refund"
              type="number"
              min={0}
              value={nominalRefund}
              onChange={(event) => setNominalRefund(event.target.value)}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Tipe Refund</label>
              <select
                value={refundType}
                onChange={(event) => setRefundType(event.target.value as "Penuh" | "Sebagian")}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
              >
                <option value="Penuh">Penuh</option>
                <option value="Sebagian">Sebagian</option>
              </select>
            </div>
          </div>
        ) : null}

        <TextArea
          label={mode === "reject" ? "Alasan Penolakan" : "Catatan Admin"}
          value={adminNote}
          onChange={(event) => setAdminNote(event.target.value)}
          placeholder={mode === "reject" ? "Tuliskan alasan refund ditolak." : "Opsional, tuliskan catatan proses refund."}
          rows={4}
          requiredMark={mode === "reject"}
        />

        {localError ? <ErrorMessage message={localError} /> : null}
        {error ? <ErrorMessage message={error} /> : null}
      </div>
    </Modal>
  );
}
