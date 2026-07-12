import type {
  AdminCertificateTemplate,
  AdminDigitalCertificate,
} from "@/features/admin/constants/certificates";

interface CertificateDocumentPreviewProps {
  certificate?: AdminDigitalCertificate | null;
  template: AdminCertificateTemplate;
  className?: string;
}

export default function CertificateDocumentPreview({
  certificate,
  template,
  className = "",
}: CertificateDocumentPreviewProps) {
  const previewName = certificate?.participantName || "Nama Peserta";
  const previewPackage = certificate?.packageName || "Nama Paket Kursus";
  const previewNumber = certificate?.certificateNumber || "SK-2024-0000";
  const previewDate =
    certificate?.issuedAt || certificate?.graduationDate || "Tanggal Terbit";
  const previewVerificationCode =
    certificate?.verificationCode || certificate?.qrCodeValue || "Kode Verifikasi";

  const backgroundStyle = template.backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(255,255,255,0.82), rgba(255,255,255,0.82)), url(${template.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundColor: template.backgroundColor,
      };

  return (
    <div className={`rounded-3xl bg-slate-100 p-5 ${className}`}>
      <div
        className="relative mx-auto aspect-[1.414/1] w-full max-w-190 overflow-hidden rounded-2xl border-14 bg-white p-5 shadow-xl"
        style={{
          ...backgroundStyle,
          borderColor: template.borderColor,
        }}
      >
        <div
          className="absolute left-8 top-5 h-10 w-10 border-l-4 border-t-4"
          style={{ borderColor: template.accentColor }}
        />
        <div
          className="absolute right-8 top-5 h-10 w-10 border-r-4 border-t-4"
          style={{ borderColor: template.accentColor }}
        />
        <div
          className="absolute bottom-8 left-8 h-10 w-10 border-b-4 border-l-4"
          style={{ borderColor: template.accentColor }}
        />
        <div
          className="absolute bottom-8 right-8 h-10 w-10 border-b-4 border-r-4"
          style={{ borderColor: template.accentColor }}
        />

        <div className="relative flex h-full flex-col items-center justify-between text-center">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-[0.28em]"
              style={{ color: template.accentColor }}
            >
              {template.institutionName}
            </p>

            {template.institutionAddress ? (
              <p className="mt-1 text-[11px] font-semibold text-slate-500">
                {template.institutionAddress}
              </p>
            ) : null}

            <h3 className="mt-4 max-w-2xl text-xl font-bold uppercase leading-tight text-slate-950">
              {template.title}
            </h3>

            <p className="mt-2 text-xs text-slate-500">
              {template.accreditationText}
            </p>

            <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              {template.recipientLabel}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-600">
              {template.openingText}
            </p>

            <p className="mt-4 text-xl font-bold text-slate-950">
              {previewName}
            </p>

            <div
              className="mx-auto mt-3 h-1 w-56 rounded-full"
              style={{ backgroundColor: template.accentColor }}
            />
          </div>

          <div>
            <p className="text-base text-slate-700">
              {template.programPrefix}:
            </p>

            <p
              className="mt-2 text-lg font-bold"
              style={{ color: template.accentColor }}
            >
              {previewPackage}
            </p>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-slate-600">
              {template.closingText}
            </p>
          </div>

          <div className="grid w-full grid-cols-3 items-end gap-5 text-sm text-slate-700">
            <div className="text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-300 bg-white text-[10px] font-black text-slate-500">
                QR
              </div>
              <p className="mt-2 font-bold uppercase tracking-[0.16em] text-slate-500">
                Kode Verifikasi
              </p>
              <p className="mt-1 break-all font-bold text-slate-950">
                {previewVerificationCode}
              </p>
            </div>

            <div>
              <p className="font-bold uppercase tracking-[0.16em] text-slate-500">
                Nomor Sertifikat
              </p>
              <p className="mt-1 font-bold text-slate-950">{previewNumber}</p>
              <p className="mt-3 font-bold uppercase tracking-[0.16em] text-slate-500">
                Tanggal Terbit
              </p>
              <p className="mt-1 font-bold text-slate-950">{previewDate}</p>
            </div>

            <div className="text-right">
              {template.signatureImage ? (
                <img
                  src={template.signatureImage}
                  alt="Tanda tangan digital"
                  className="ml-auto h-11 max-w-40 object-contain"
                />
              ) : (
                <div className="ml-auto h-11 w-40 rounded-xl border border-dashed border-slate-300 bg-white/70" />
              )}

              <p className="mt-2 font-bold text-slate-950">
                {template.signerName}
              </p>
              <p className="text-xs text-slate-500">{template.signerTitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
