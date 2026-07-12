import { Award, CalendarDays, CheckCircle2, FileText } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { ParticipantDigitalCertificate } from "@/features/participant/constants/type";

interface CertificateHistoryListCardProps {
  certificates: ParticipantDigitalCertificate[];
  activeBackendId?: number | null;
  onSelect: (certificate: ParticipantDigitalCertificate) => void;
}

function getStatusVariant(
  certificate: ParticipantDigitalCertificate,
): "default" | "success" | "warning" | "danger" | "info" {
  const status = certificate.certificateStatus?.toLowerCase() ?? "";

  if (status.includes("terbit")) return "success";
  if (status.includes("draft")) return "warning";
  if (status.includes("cabut")) return "danger";
  if (certificate.isAvailable) return "success";
  return "default";
}

export default function CertificateHistoryListCard({
  certificates,
  activeBackendId,
  onSelect,
}: CertificateHistoryListCardProps) {
  if (certificates.length <= 1) {
    return null;
  }

  return (
    <Card className="rounded-[24px] p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
          <Award className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-base font-bold text-slate-950">Daftar Sertifikat</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Peserta dapat memiliki lebih dari satu sertifikat. Sertifikat yang
            dipilih akan ditampilkan sebagai preview utama.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {certificates.map((certificate) => {
          const isActive = activeBackendId === certificate.backendId;

          return (
            <div
              key={certificate.id}
              className={cn(
                "rounded-2xl border bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/40",
                isActive
                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/10"
                  : "border-slate-200",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {certificate.certificateNumber ?? certificate.packageName}
                    </p>

                    {isActive ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                    ) : null}
                  </div>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {certificate.packageName}
                  </p>
                </div>

                <Badge
                  variant={getStatusVariant(certificate)}
                  className="shrink-0 uppercase tracking-[0.08em]"
                >
                  {certificate.certificateStatus ?? certificate.verificationLabel}
                </Badge>
              </div>

              <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {certificate.issueDate ?? "Belum terbit"}
                </span>

                <span className="inline-flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {certificate.pdfAvailable ? "PDF tersedia" : "PDF belum dibuat"}
                </span>
              </div>

              <Button
                variant={isActive ? "primary" : "secondary"}
                size="sm"
                className="mt-3 w-full rounded-xl"
                onClick={() => onSelect(certificate)}
                disabled={isActive}
              >
                {isActive ? "Sedang Ditampilkan" : "Tampilkan Sertifikat"}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
