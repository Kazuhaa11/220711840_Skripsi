import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import type { ParticipantDigitalCertificate } from "@/features/participant/constants/type";
import {
  Award,
  CalendarDays,
  FileBadge2,
  FileText,
  QrCode,
  ShieldCheck,
  UserRound,
} from "lucide-react";

interface CertificateDetailModalProps {
  opened: boolean;
  onClose: () => void;
  certificate: ParticipantDigitalCertificate;
}

export default function CertificateDetailModal({
  opened,
  onClose,
  certificate,
}: CertificateDetailModalProps) {
  const [qrImageFailed, setQrImageFailed] = useState(false);
  const shouldShowQrImage = Boolean(certificate.qrCodeImageUrl && !qrImageFailed);

  useEffect(() => {
    setQrImageFailed(false);
  }, [certificate.backendId, certificate.qrCodeImageUrl, opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title="Detail Sertifikat Digital"
      description="Tinjau informasi lengkap sertifikat dan status kelulusan Anda."
      headerClassName="px-5 py-4 sm:px-6 sm:py-5 [&_h2]:text-2xl [&_h2]:font-extrabold [&_p]:text-sm [&_p]:leading-7"
      bodyClassName="px-5 py-5 sm:px-6 sm:py-5"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <Card className="rounded-3xl p-4 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Award className="mt-1 h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Status Kelulusan
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {certificate.graduationStatus === "LULUS"
                      ? "Lulus"
                      : "Dalam Proses"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-1 h-4 w-4 text-emerald-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Status Verifikasi
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {certificate.verificationLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CalendarDays className="mt-1 h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Tanggal Terbit
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {certificate.issueDate ?? "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileBadge2 className="mt-1 h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                    Nomor Sertifikat
                  </p>
                  <p className="mt-1 text-base font-bold text-slate-900">
                    {certificate.certificateNumber ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl p-4 shadow-sm">
            <h3 className="text-base font-extrabold uppercase tracking-[0.14em] text-slate-900">
              Ringkasan Pelatihan
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Peserta
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {certificate.participantName}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Paket
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {certificate.packageName}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Nilai Akhir
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {certificate.averageScore}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Sesi Selesai
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {certificate.completedSessions}/{certificate.totalSessions}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Instruktur
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {certificate.instructorName ?? "-"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Tanggal Latihan
                </p>
                <p className="mt-1 text-base font-bold text-slate-900">
                  {certificate.trainingDate ?? "-"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl p-4 shadow-sm">
            <h3 className="text-base font-extrabold uppercase tracking-[0.14em] text-slate-900">
              Detail Nilai
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Praktik
                </p>
                <p className="mt-1 text-lg font-extrabold text-slate-950">
                  {certificate.practiceScore ?? "--"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Sikap
                </p>
                <p className="mt-1 text-lg font-extrabold text-slate-950">
                  {certificate.attitudeScore ?? "--"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Pemahaman
                </p>
                <p className="mt-1 text-lg font-extrabold text-slate-950">
                  {certificate.understandingScore ?? "--"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {certificate.qrCodeImageUrl || certificate.verificationCode ? (
            <Card className="rounded-3xl p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                QR Verifikasi
              </p>

              <div className="mt-3 flex justify-center rounded-2xl bg-slate-50 p-4">
                {shouldShowQrImage ? (
                  <img
                    src={certificate.qrCodeImageUrl ?? undefined}
                    alt="QR Code verifikasi sertifikat"
                    className="h-32 w-32 rounded-xl bg-white object-contain p-2 shadow-sm"
                    onError={() => setQrImageFailed(true)}
                  />
                ) : (
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-xl bg-white p-3 text-center shadow-sm">
                    <QrCode className="h-10 w-10 text-slate-400" />
                    <p className="mt-2 break-all text-[10px] font-bold leading-4 text-slate-500">
                      {certificate.verificationCode ?? "QR belum tersedia"}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ) : null}

          <Card className="rounded-3xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <UserRound className="mt-1 h-4 w-4 text-blue-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Kode Verifikasi
                </p>
                <p className="mt-2 break-all text-sm font-bold text-slate-900">
                  {certificate.verificationCode ?? "-"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <FileText className="mt-1 h-4 w-4 text-blue-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  File PDF
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {certificate.pdfAvailable
                    ? certificate.pdfOriginalName ?? "PDF sertifikat tersedia."
                    : "PDF sertifikat belum tersedia."}
                </p>
                {certificate.pdfSizeLabel ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Ukuran file: {certificate.pdfSizeLabel}
                  </p>
                ) : null}
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Catatan
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-700">
              {certificate.adminNote || certificate.instructorNote || certificate.importantNote}
            </p>
          </Card>

          <Button
            fullWidth
            variant="outline"
            onClick={onClose}
            className="h-10 rounded-xl text-xs font-bold uppercase tracking-wide"
          >
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
