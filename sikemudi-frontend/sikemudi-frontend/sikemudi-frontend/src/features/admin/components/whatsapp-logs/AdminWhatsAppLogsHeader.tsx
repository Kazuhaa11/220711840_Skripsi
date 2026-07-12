import { MessageCircle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

interface AdminWhatsAppLogsHeaderProps {
  loading?: boolean;
  onRefresh: () => void;
}

export default function AdminWhatsAppLogsHeader({
  loading = false,
  onRefresh,
}: AdminWhatsAppLogsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-700 via-blue-800 to-slate-950 p-5 text-white shadow-sm sm:p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
          <MessageCircle className="h-4 w-4" />
          Monitoring WhatsApp
        </div>
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
          Log Notifikasi WhatsApp
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
          Pantau status pengiriman WhatsApp seperti pengingat H-1, nomor tujuan,
          isi pesan, error Fonnte, dan kirim ulang log yang gagal.
        </p>
      </div>

      <Button
        variant="secondary"
        onClick={onRefresh}
        loading={loading}
        leftIcon={<RefreshCw className="h-4 w-4" />}
        className="h-11 rounded-2xl bg-white text-blue-800 hover:bg-blue-50"
      >
        Refresh Log
      </Button>
    </div>
  );
}
