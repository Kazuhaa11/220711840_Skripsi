import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { Lock } from "lucide-react";

interface CertificateUnavailableCardProps {
  verificationLabel: string;
  message: string;
}

export default function CertificateUnavailableCard({
  verificationLabel,
  message,
}: CertificateUnavailableCardProps) {
  return (
    <Card className="rounded-2xl border-2 border-dashed border-slate-300 bg-white/60 p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex justify-end">
        <Badge
          variant="default"
          className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600"
        >
          {verificationLabel}
        </Badge>
      </div>

      <div className="flex min-h-56 flex-col items-center justify-center text-center sm:min-h-72">
        <div className="relative flex h-24 w-24 items-center justify-center sm:h-32 sm:w-32">
          <div className="absolute inset-0 rotate-45 rounded-[32px] bg-slate-100/60" />
          <div className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500">
            <Lock className="h-7 w-7" />
          </div>
        </div>

        <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
          Sertifikat Belum Tersedia
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          {message}
        </p>
      </div>
    </Card>
  );
}
