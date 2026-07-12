import { AlertTriangle, Copy, RefreshCw } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { AdminWhatsAppLogItem, WhatsAppLogStatus } from "@/types/adminWhatsAppLog";

interface AdminWhatsAppLogDetailModalProps {
  opened: boolean;
  item: AdminWhatsAppLogItem | null;
  loading?: boolean;
  onClose: () => void;
  onRetry: (item: AdminWhatsAppLogItem) => void;
}

function statusVariant(status: WhatsAppLogStatus) {
  if (status === "Terkirim") return "success";
  if (status === "Pending") return "warning";
  if (status === "Gagal") return "danger";
  return "default";
}





export default function AdminWhatsAppLogDetailModal({
  opened,
  item,
  loading = false,
  onClose,
  onRetry,
}: AdminWhatsAppLogDetailModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      compact
      title="Detail Log WhatsApp"
      description={item ? `${item.event_type_label} • ${item.target || "nomor tidak tersedia"}` : undefined}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Tutup
          </Button>
          {item?.can_retry ? (
            <Button
              onClick={() => onRetry(item)}
              loading={loading}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              className="rounded-xl bg-blue-700 hover:bg-blue-800"
            >
              Kirim Ulang
            </Button>
          ) : null}
        </div>
      }
    >
      {!item ? (
        <p className="text-sm text-slate-500">Detail log tidak tersedia.</p>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Status</p>
              <div className="mt-2"><Badge variant={statusVariant(item.status)}>{item.status_label}</Badge></div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Event</p>
              <p className="mt-2 text-sm font-black text-slate-900">{item.event_type_label}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Tujuan</p>
              <p className="mt-2 text-sm font-black text-slate-900">{item.target || "-"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Waktu</p>
              <p className="mt-2 text-sm font-black text-slate-900">{item.created_at_label || "-"}</p>
            </div>
          </div>

          {item.error_message ? (
            <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Pengiriman bermasalah</p>
                <p className="mt-1 text-sm leading-6">{item.error_message}</p>
              </div>
            </div>
          ) : null}

          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-black text-slate-950">Isi Pesan</p>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl"
                leftIcon={<Copy className="h-4 w-4" />}
                onClick={() => item.message && navigator.clipboard?.writeText(item.message)}
              >
                Salin
              </Button>
            </div>
            <div className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
              {item.message || "Pesan tidak tersedia."}
            </div>
          </section>
        </div>
      )}
    </Modal>
  );
}
