import Card from "@/components/ui/Card";
import { BadgeCheck, FileLock2, Info, Share2 } from "lucide-react";

interface CertificateInfoNoticeCardProps {
  isAvailable: boolean;
  importantNote: string;
}

export default function CertificateInfoNoticeCard({
  isAvailable,
  importantNote,
}: CertificateInfoNoticeCardProps) {
  if (!isAvailable) {
    return (
      <div className="space-y-5">
        <Card className="rounded-3xl border border-slate-300 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-800" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-800">
                Informasi Penting
              </p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {importantNote}
              </p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
          <div className="flex min-h-44 items-end bg-linear-to-br from-slate-200 via-slate-100 to-slate-300 p-4">
            <div className="rounded-2xl bg-white/80 px-3 py-2 backdrop-blur-sm">
              <p className="text-xs font-semibold leading-5 text-slate-700">
                Sertifikat akan terbuka setelah status kelulusan valid dan admin menerbitkan sertifikat.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="rounded-3xl p-5 shadow-sm">
      <h3 className="text-lg font-extrabold tracking-tight text-slate-950">
        Informasi Tambahan
      </h3>

      <div className="mt-5 space-y-4">
        <div className="flex items-start gap-3">
          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Verifikasi Publik</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Kode verifikasi dapat dicek melalui halaman verifikasi sertifikat publik.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <FileLock2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">PDF Private</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              File PDF diunduh melalui endpoint backend, bukan lewat URL storage publik.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Tautan Sertifikat</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Salin tautan untuk membagikan status validasi sertifikat kepada pihak lain.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
