import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { QrCode, ShieldCheck } from "lucide-react";

interface DigitalCertificatePreviewCardProps {
  participantName: string;
  achievementText: string;
  packageName: string;
  certificateNumber: string;
  verificationCode?: string | null;
  qrCodeImageUrl?: string | null;
}

export default function DigitalCertificatePreviewCard({
  participantName,
  achievementText,
  packageName,
  certificateNumber,
  verificationCode,
  qrCodeImageUrl,
}: DigitalCertificatePreviewCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl bg-linear-to-br from-[#081b45] via-[#10275b] to-[#1d3265] p-0 text-white shadow-[0_24px_70px_rgba(8,27,69,0.25)] sm:rounded-3xl">
      <div className="relative min-h-[24rem] overflow-hidden px-4 py-5 sm:min-h-[32rem] sm:px-8 sm:py-8">
        <div className="absolute -right-10 top-10 opacity-10">
          <ShieldCheck className="h-56 w-56" />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-extrabold tracking-tight sm:text-2xl">SIKEMUDI</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Official Digital Certificate
              </p>
            </div>

            <Badge className="gap-2 border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Terverifikasi
            </Badge>
          </div>

          <div className="mt-8 text-center sm:mt-14">
            <p className="text-sm italic text-white/75">
              Sertifikat ini diberikan kepada:
            </p>

            <h2 className="mt-3 break-words text-2xl font-extrabold tracking-tight text-white sm:mt-4 sm:text-4xl">
              {participantName}
            </h2>

            <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-emerald-400" />

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/90 sm:mt-6 sm:text-base sm:leading-7">
              {achievementText}
            </p>

            <p className="mt-5 text-lg font-bold text-white/95 sm:mt-7 sm:text-xl">
              {packageName}
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between gap-4 sm:mt-14 sm:gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
                Nomor Sertifikat
              </p>
              <p className="mt-2 break-words text-base font-bold text-white sm:text-xl">
                {certificateNumber}
              </p>

              {verificationCode ? (
                <>
                  <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
                    Kode Verifikasi
                  </p>
                  <p className="mt-2 text-base font-semibold text-white/90">
                    {verificationCode}
                  </p>
                </>
              ) : null}
            </div>

            <div className="rounded-2xl bg-white p-3 text-slate-950 shadow-lg">
              {qrCodeImageUrl ? (
                <img
                  src={qrCodeImageUrl}
                  alt="QR Code verifikasi sertifikat"
                  className="h-16 w-16 rounded-xl object-contain"
                />
              ) : (
                <QrCode className="h-14 w-14" />
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
