import Card from "@/components/ui/Card";
import { Award } from "lucide-react";
import type { ParticipantDashboardCertificateCard } from "@/types/dashboard";

interface CertificateProgressCardProps {
  certificate: ParticipantDashboardCertificateCard;
}

export default function CertificateProgressCard({
  certificate,
}: CertificateProgressCardProps) {
  return (
    <Card className="rounded-2xl bg-slate-950 px-4 py-4 text-white sm:rounded-3xl sm:px-6 sm:py-7">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 sm:h-12 sm:w-12">
        <Award className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      <h3 className="mt-4 text-xl font-bold leading-tight tracking-tight text-white sm:mt-6 sm:text-3xl">
        {certificate.title}
      </h3>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 sm:mt-6 sm:rounded-3xl sm:px-4 sm:py-4">
        <p className="text-sm leading-6 text-slate-200 sm:text-base sm:leading-8">
          {certificate.is_verified
            ? `Nomor sertifikat: ${certificate.certificate?.nomor_sertifikat ?? "-"}`
            : "Sertifikat digital akan tersedia setelah Anda dinyatakan lulus dan diterbitkan oleh admin."}
        </p>
      </div>

      <div className="mt-5 sm:mt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/80 sm:text-xs sm:tracking-[0.2em]">
          Progres Kelulusan
        </p>

        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/15 sm:mt-4">
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${certificate.progress.percentage}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-white/80 sm:text-sm">
          <span>{certificate.progress.label}</span>
          <span>{certificate.progress.step_label}</span>
        </div>
      </div>
    </Card>
  );
}
