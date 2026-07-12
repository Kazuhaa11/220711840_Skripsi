import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import type { AdminBookingRowItem } from "@/types/adminBooking";

interface AdminBookingCancelModalProps {
  opened: boolean;
  item: AdminBookingRowItem | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export default function AdminBookingCancelModal({
  opened,
  item,
  loading = false,
  onClose,
  onConfirm,
}: AdminBookingCancelModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!opened) setReason("");
  }, [opened]);

  if (!item) return null;

  const isPackageBooking = item.isPackageBooking;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      title={isPackageBooking ? "Batalkan Booking Paket" : "Batalkan Booking"}
      description={item.code}
      bodyClassName="max-h-[calc(100dvh-16rem)]"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Tutup
          </Button>

          <Button
            variant="danger"
            onClick={() => onConfirm(reason.trim() || (isPackageBooking ? "Booking paket dibatalkan oleh admin." : "Booking dibatalkan oleh admin."))}
            disabled={loading}
            loading={loading}
          >
            {isPackageBooking ? "Ya, Batalkan Paket" : "Ya, Batalkan Booking"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Card className="rounded-3xl border-l-4 border-l-red-600 bg-red-50 p-4 shadow-none">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="font-semibold text-red-700">Informasi penting</p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-red-700">
                <li>{isPackageBooking ? "Seluruh paket dan semua sesi akan berubah menjadi Dibatalkan." : "Booking akan berubah menjadi Dibatalkan."}</li>
                <li>Slot jadwal pada sesi aktif akan dikembalikan.</li>
                <li>Peserta tidak lagi memiliki paket aktif jika tidak ada paket lain yang masih berjalan.</li>
                <li>Riwayat pembatalan akan dicatat di sistem.</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className="rounded-3xl bg-slate-50 p-4 shadow-none">
          <p className="font-bold text-slate-950">{item.participantName}</p>
          <p className="mt-1 text-sm text-slate-600">{item.packageName}</p>
          <p className="mt-1 text-sm text-slate-600">{item.dateLabel} • {item.timeLabel}</p>
        </Card>

        <TextArea
          label="Alasan Pembatalan"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={isPackageBooking ? "Tulis alasan pembatalan paket..." : "Tulis alasan pembatalan booking..."}
          rows={4}
          disabled={loading}
        />
      </div>
    </Modal>
  );
}
