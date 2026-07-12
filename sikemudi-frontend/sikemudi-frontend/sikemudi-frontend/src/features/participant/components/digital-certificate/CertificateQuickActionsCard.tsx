import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Copy, Download, Eye } from "lucide-react";

interface CertificateQuickActionsCardProps {
  copied: boolean;
  onDownloadPdf: () => void;
  onViewDetail: () => void;
  onCopyLink: () => void;
  importantNote: string;
  downloadLoading?: boolean;
  downloadDisabled?: boolean;
  pdfInfoLabel?: string | null;
}

export default function CertificateQuickActionsCard({
  copied,
  onDownloadPdf,
  onViewDetail,
  onCopyLink,
  importantNote,
  downloadLoading = false,
  downloadDisabled = false,
  pdfInfoLabel = null,
}: CertificateQuickActionsCardProps) {
  return (
    <Card className="rounded-2xl p-4 shadow-sm sm:rounded-3xl sm:p-5">
      <h3 className="text-lg font-extrabold tracking-tight text-slate-950">
        Tindakan Cepat
      </h3>

      <Button
        fullWidth
        onClick={onDownloadPdf}
        leftIcon={<Download className="h-4 w-4" />}
        loading={downloadLoading}
        disabled={downloadDisabled}
        className="mt-4 h-10 rounded-xl text-xs font-bold sm:mt-6 sm:h-11 sm:text-sm"
      >
        {downloadLoading ? "Mengunduh..." : "Unduh PDF"}
      </Button>

      {pdfInfoLabel ? (
        <p className="mt-2 text-center text-xs leading-5 text-slate-500">
          {pdfInfoLabel}
        </p>
      ) : null}

      <Button
        fullWidth
        variant="outline"
        onClick={onViewDetail}
        leftIcon={<Eye className="h-4 w-4" />}
        className="mt-3 h-10 rounded-xl text-xs font-bold sm:h-11 sm:text-sm"
      >
        Lihat Detail
      </Button>

      <Button
        fullWidth
        variant="outline"
        onClick={onCopyLink}
        leftIcon={<Copy className="h-4 w-4" />}
        className="mt-3 h-10 rounded-xl text-xs font-bold sm:h-11 sm:text-sm"
      >
        {copied ? "Tautan Tersalin" : "Salin Tautan"}
      </Button>

      <div className="mt-4 border-t border-slate-200 pt-4 sm:mt-6 sm:pt-5">
        <p className="text-sm font-semibold text-slate-700">Catatan Penting:</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{importantNote}</p>
      </div>
    </Card>
  );
}
