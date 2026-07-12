import { Ban, Download, FileText, Pencil, QrCode, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type {
  AdminCertificateTemplate,
  AdminDigitalCertificate,
} from "@/features/admin/constants/certificates";
import CertificateDocumentPreview from "@/features/admin/components/certificates/CertificateDocumentPreview";

interface CertificateDetailPanelProps {
  opened: boolean;
  certificate: AdminDigitalCertificate | null;
  template: AdminCertificateTemplate;
  loading?: boolean;
  onClose: () => void;
  onEdit: (certificate: AdminDigitalCertificate) => void;
  onGeneratePdf?: (certificate: AdminDigitalCertificate) => void;
  onDownloadPdf?: (certificate: AdminDigitalCertificate) => void;
  onRevoke?: (certificate: AdminDigitalCertificate) => void;
}

export default function CertificateDetailPanel({
  opened,
  certificate,
  template,
  loading = false,
  onClose,
  onEdit,
  onGeneratePdf,
  onDownloadPdf,
  onRevoke,
}: CertificateDetailPanelProps) {
  if (!certificate) return null;

  const isPublished = certificate.status === "Terbit";
  const isRevoked = certificate.status === "Dicabut";
  const canIssue = certificate.sourceType === "candidate";
  const previewTemplate = certificate.templateData ?? template;

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        opened ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Tutup detail sertifikat"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-195 overflow-y-auto bg-white shadow-2xl">
        <div className="px-4 py-5 sm:px-5 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                Detail Sertifikat
              </p>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                Digital Credential
              </h2>
            </div>

            <Button
              variant="ghost"
              className="h-10 w-10 rounded-xl p-0"
              aria-label="Tutup detail sertifikat"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <Card className="mt-5 rounded-3xl bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/15">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Nomor Sertifikat
            </p>

            <p className="mt-2 text-lg font-bold text-white">
              {certificate.certificateNumber || "Belum Terbit"}
            </p>

            <h3 className="mt-5 text-xl font-bold text-white">
              {certificate.participantName}
            </h3>

            <p className="mt-2 text-lg italic text-slate-300">
              Telah menyelesaikan kursus mengemudi profesional
            </p>
          </Card>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Card className="rounded-2xl bg-slate-100 p-5 shadow-none">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                Paket/Kursus
              </p>
              <p className="mt-3 text-lg font-bold text-slate-950">
                {certificate.packageName}
              </p>
            </Card>

            <Card className="rounded-2xl bg-slate-100 p-5 shadow-none">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                Tanggal Terbit
              </p>
              <p className="mt-3 text-lg font-bold text-slate-950">
                {certificate.issuedAt || "Belum terbit"}
              </p>
            </Card>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <Card className="rounded-2xl bg-slate-100 p-5 text-center shadow-none">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Kelulusan
              </p>
              <p className="mt-2 font-bold text-emerald-700">Lulus</p>
            </Card>

            <Card className="rounded-2xl bg-slate-100 p-5 text-center shadow-none">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                Sertifikat
              </p>
              <p className="mt-2 font-bold text-blue-700">{certificate.status}</p>
            </Card>

            <Card className="rounded-2xl bg-slate-100 p-5 text-center shadow-none">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                PDF
              </p>
              <p className="mt-2 font-bold text-slate-700">
                {certificate.hasPdf ? "Siap" : "Belum dibuat"}
              </p>
            </Card>
          </div>

          <Card className="mt-5 rounded-3xl p-5 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 text-slate-950">
                <QrCode className="h-10 w-10" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Verifikasi Digital
                </h3>

                <p className="mt-3 break-all text-sm leading-6 text-slate-600">
                  {certificate.verificationUrl || certificate.verificationCode ||
                    "Kode verifikasi akan tersedia setelah sertifikat diterbitkan."}
                </p>

                <Badge className="mt-4 bg-emerald-100 font-bold uppercase tracking-widest text-emerald-700">
                  {certificate.verificationStatus}
                </Badge>
              </div>
            </div>
          </Card>

          <div className="mt-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              Preview Dokumen
            </p>

            <CertificateDocumentPreview certificate={certificate} template={previewTemplate} />
          </div>

          {isRevoked ? (
            <Card className="mt-5 rounded-3xl border border-red-100 bg-red-50 p-4 text-red-800 shadow-none">
              <div className="flex gap-3">
                <Ban className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-black">Sertifikat ini sudah dicabut.</p>
                  <p className="mt-1 text-sm leading-6">
                    PDF tidak dapat dibuat atau diunduh, dan verifikasi publik akan menampilkan status dicabut.
                  </p>
                </div>
              </div>
            </Card>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
            {isRevoked ? (
              <Button
                size="lg"
                className="rounded-2xl bg-slate-300 font-bold uppercase tracking-[0.08em] text-slate-600"
                disabled
              >
                Sertifikat Dicabut
              </Button>
            ) : isPublished && certificate.hasPdf ? (
              <Button
                size="lg"
                className="rounded-2xl bg-emerald-600 font-bold uppercase tracking-[0.08em] hover:bg-emerald-700"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={() => onDownloadPdf?.(certificate)}
                disabled={loading}
              >
                Unduh Sertifikat
              </Button>
            ) : isPublished ? (
              <Button
                size="lg"
                className="rounded-2xl bg-slate-950 font-bold uppercase tracking-[0.08em] hover:bg-slate-800"
                leftIcon={<FileText className="h-4 w-4" />}
                onClick={() => onGeneratePdf?.(certificate)}
                disabled={loading}
              >
                Buat PDF
              </Button>
            ) : (
              <Button
                size="lg"
                className="rounded-2xl bg-slate-950 font-bold uppercase tracking-[0.08em] hover:bg-slate-800"
                leftIcon={<Pencil className="h-4 w-4" />}
                onClick={() => onEdit(certificate)}
                disabled={loading || !canIssue}
              >
                Terbitkan
              </Button>
            )}

            <div className="flex flex-col gap-2">
              {isPublished ? (
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-2xl border-red-200 font-bold uppercase tracking-[0.08em] text-red-700 hover:bg-red-50"
                  leftIcon={<Ban className="h-4 w-4" />}
                  onClick={() => onRevoke?.(certificate)}
                  disabled={loading}
                >
                  Cabut
                </Button>
              ) : null}

              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl font-bold uppercase tracking-[0.08em]"
                onClick={onClose}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
