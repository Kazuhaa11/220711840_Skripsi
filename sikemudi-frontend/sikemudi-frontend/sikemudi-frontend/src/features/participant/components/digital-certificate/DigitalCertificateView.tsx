import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import { getParticipantDashboard } from "@/services/dashboard.service";
import {
  downloadParticipantCertificatePdf,
  getParticipantCertificateDetail,
  getParticipantCertificates,
} from "@/services/certificate.service";
import CertificateDetailModal from "@/features/participant/components/digital-certificate/CertificateDetailModal";
import CertificateHistoryListCard from "@/features/participant/components/digital-certificate/CertificateHistoryListCard";
import CertificateInfoNoticeCard from "@/features/participant/components/digital-certificate/CertificateInfoNoticeCard";
import CertificateProgressCard from "@/features/participant/components/digital-certificate/CertificateProgressCard";
import CertificateQuickActionsCard from "@/features/participant/components/digital-certificate/CertificateQuickActionsCard";
import CertificateSummaryStats from "@/features/participant/components/digital-certificate/CertificateSummaryStats";
import CertificateUnavailableCard from "@/features/participant/components/digital-certificate/CertificateUnavailableCard";
import DigitalCertificateHeader from "@/features/participant/components/digital-certificate/DigitalCertificateHeader";
import CertificateDocumentPreview from "@/features/admin/components/certificates/CertificateDocumentPreview";
import {
  mapCertificateToDigitalCertificate,
  mapUnavailableCertificateFromDashboard,
  pickPrimaryCertificate,
} from "@/features/participant/utils/certificateMapper";
import {
  adminCertificateDefaultTemplate,
  type AdminCertificateTemplate,
  type AdminDigitalCertificate,
} from "@/features/admin/constants/certificates";
import type { ParticipantDigitalCertificate } from "@/features/participant/constants/type";
import type {
  CertificateResponseItem,
  CertificateTemplateResponse,
} from "@/types/certificate";
import type { ParticipantDashboardData } from "@/types/dashboard";

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildCertificateFileName(certificate: ParticipantDigitalCertificate): string {
  if (certificate.pdfOriginalName) {
    return certificate.pdfOriginalName;
  }

  if (certificate.certificateNumber) {
    return `sertifikat-${certificate.certificateNumber}.pdf`;
  }

  return "sertifikat-sikemudi.pdf";
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function fallback(value: unknown, fallbackValue: string): string {
  if (value === undefined || value === null || value === "") {
    return fallbackValue;
  }

  return String(value);
}

function mapTemplateToPreviewTemplate(
  template?: CertificateTemplateResponse | null,
): AdminCertificateTemplate {
  if (!template) {
    return adminCertificateDefaultTemplate;
  }

  return {
    ...adminCertificateDefaultTemplate,
    id: String(template.id),
    numericId: template.id,
    templateName: fallback(template.nama_template, adminCertificateDefaultTemplate.templateName),
    accreditationText: fallback(template.subjudul, adminCertificateDefaultTemplate.accreditationText),
    title: fallback(template.judul_sertifikat, adminCertificateDefaultTemplate.title),
    recipientLabel: fallback(template.recipient_label, adminCertificateDefaultTemplate.recipientLabel),
    programPrefix: fallback(template.program_prefix, adminCertificateDefaultTemplate.programPrefix),
    openingText: fallback(template.kalimat_pembuka, adminCertificateDefaultTemplate.openingText),
    closingText: fallback(template.kalimat_penutup, adminCertificateDefaultTemplate.closingText),
    institutionName: fallback(template.nama_penyelenggara, adminCertificateDefaultTemplate.institutionName),
    institutionAddress: fallback(template.institution_address, adminCertificateDefaultTemplate.institutionAddress),
    signerName: fallback(template.nama_penandatangan, adminCertificateDefaultTemplate.signerName),
    signerTitle: fallback(template.jabatan_penandatangan, adminCertificateDefaultTemplate.signerTitle),
    backgroundType: template.background_type === "Gambar" ? "Gambar" : "Warna",
    backgroundColor: fallback(template.background_color, adminCertificateDefaultTemplate.backgroundColor),
    borderColor: fallback(template.border_color, adminCertificateDefaultTemplate.borderColor),
    accentColor: fallback(template.accent_color, adminCertificateDefaultTemplate.accentColor),
    backgroundImage: template.background_image_url || template.background_image || "",
    signatureImage: template.ttd_digital_url || template.ttd_digital || "",
    backgroundImageFileName: template.background_image_original_name ?? null,
    signatureImageFileName: template.ttd_digital_original_name ?? null,
    status: template.status === "Nonaktif" ? "Nonaktif" : "Aktif",
    isDefault: Boolean(template.is_default),
    certificatesCount: template.certificates_count ?? 0,
  };
}

function mapParticipantCertificateToPreviewCertificate(
  certificate: ParticipantDigitalCertificate,
): AdminDigitalCertificate {
  return {
    id: certificate.id,
    numericId: certificate.backendId ?? null,
    sourceType: "certificate",
    sourceResultId: certificate.id,
    sourceResultNumericId: certificate.backendId ?? null,
    participantId: certificate.participantTier,
    participantName: certificate.participantName,
    packageName: certificate.packageName,
    graduationDate: certificate.trainingDate ?? certificate.issueDate ?? "",
    issuedAt: certificate.issueDate ?? "",
    certificateNumber: certificate.certificateNumber ?? "",
    status: certificate.certificateStatus === "Dicabut" ? "Dicabut" : "Terbit",
    verificationStatus:
      certificate.certificateStatus === "Dicabut" ? "Dicabut" : "Terverifikasi",
    verificationCode: certificate.verificationCode ?? undefined,
    verificationUrl: certificate.shareUrl,
    qrCodeValue:
      certificate.verificationCode ?? certificate.shareUrl ?? certificate.id,
    templateId: "1",
    templateData: null,
    instructorName: certificate.instructorName ?? undefined,
    score:
      certificate.averageScore === "--"
        ? null
        : Number(certificate.averageScore),
    hasPdf: certificate.pdfAvailable,
    pdfDownloadUrl: null,
    pdfOriginalName: certificate.pdfOriginalName,
    completedSessions: certificate.completedSessions,
    totalSessions: certificate.totalSessions,
    progressComplete: certificate.progressPercent >= 100,
  };
}

export default function DigitalCertificateView() {
  const navigate = useNavigate();
  const { showNotification } = useFloatingNotification();
  const [dashboard, setDashboard] = useState<ParticipantDashboardData | null>(null);
  const [certificates, setCertificates] = useState<CertificateResponseItem[]>([]);
  const [selectedCertificateId, setSelectedCertificateId] = useState<number | null>(null);
  const [detailOpened, setDetailOpened] = useState(false);
  const [detailCertificate, setDetailCertificate] =
    useState<CertificateResponseItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function loadCertificatePage() {
    try {
      setLoading(true);
      setError(null);
      setDownloadError(null);

      const [certificateResponse, dashboardResponse] = await Promise.all([
        getParticipantCertificates(),
        getParticipantDashboard(),
      ]);

      const nextCertificates = certificateResponse.items;
      const nextPrimaryCertificate = pickPrimaryCertificate(nextCertificates);

      setCertificates(nextCertificates);
      setSelectedCertificateId((currentId) => {
        if (currentId && nextCertificates.some((item) => item.id === currentId)) {
          return currentId;
        }

        return nextPrimaryCertificate?.id ?? null;
      });
      setDashboard(dashboardResponse);
      setDetailCertificate(null);
    } catch (err) {
      setError(
        getErrorMessage(err, "Sertifikat digital gagal dimuat dari backend."),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCertificatePage();
  }, []);

  const selectedCertificate = useMemo(() => {
    if (certificates.length === 0) {
      return null;
    }

    if (selectedCertificateId) {
      const found = certificates.find((item) => item.id === selectedCertificateId);

      if (found) {
        return found;
      }
    }

    return pickPrimaryCertificate(certificates);
  }, [certificates, selectedCertificateId]);

  const certificate = useMemo<ParticipantDigitalCertificate>(() => {
    if (selectedCertificate) {
      return mapCertificateToDigitalCertificate(selectedCertificate, dashboard);
    }

    return mapUnavailableCertificateFromDashboard(dashboard);
  }, [dashboard, selectedCertificate]);

  const certificateOptions = useMemo(
    () => certificates.map((item) => mapCertificateToDigitalCertificate(item, dashboard)),
    [certificates, dashboard],
  );

  const modalCertificate = useMemo<ParticipantDigitalCertificate>(() => {
    if (detailCertificate) {
      return mapCertificateToDigitalCertificate(detailCertificate, dashboard);
    }

    return certificate;
  }, [certificate, dashboard, detailCertificate]);

  const previewCertificate = useMemo(
    () => mapParticipantCertificateToPreviewCertificate(certificate),
    [certificate],
  );

  const previewTemplate = useMemo(
    () => mapTemplateToPreviewTemplate(selectedCertificate?.template),
    [selectedCertificate],
  );

  const unavailableStats = useMemo(
    () => [
      {
        label: "Status Lulus",
        value:
          certificate.graduationStatus === "LULUS" ? "Lulus" : "Dalam Proses",
        accent: "blue" as const,
      },
      {
        label: "Nilai Akhir",
        value: certificate.averageScore,
      },
      {
        label: "Sesi Selesai",
        value: `${certificate.completedSessions}/${certificate.totalSessions}`,
      },
    ],
    [certificate],
  );

  const availableStats = useMemo(
    () => [
      {
        label: "Status Kelulusan",
        value: "Lulus",
        accent: "green" as const,
      },
      {
        label: "Sertifikat Digital",
        value: "Tersedia",
      },
      {
        label: "Tanggal Terbit",
        value: certificate.issueDate ?? "-",
      },
      {
        label: "Status Verifikasi",
        value: certificate.verificationLabel,
        valueClassName: "text-emerald-600",
      },
    ],
    [certificate],
  );

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(certificate.shareUrl);
      setCopied(true);
      showNotification({
        type: "success",
        title: "Link disalin",
        message: "Link verifikasi sertifikat berhasil disalin.",
        duration: 2500,
      });

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setCopied(false);
      showNotification({
        type: "error",
        title: "Link gagal disalin",
        message: "Browser tidak mengizinkan akses clipboard. Coba salin manual dari halaman verifikasi.",
        duration: 4000,
      });
    }
  }

  function handleSelectCertificate(nextCertificate: ParticipantDigitalCertificate) {
    if (!nextCertificate.backendId) {
      return;
    }

    setSelectedCertificateId(nextCertificate.backendId);
    setDetailCertificate(null);
    setCopied(false);
    setDownloadError(null);
  }

  async function handleOpenDetail() {
    if (!certificate.backendId) {
      return;
    }

    try {
      setDownloadError(null);
      const detail = await getParticipantCertificateDetail(certificate.backendId);

      setDetailCertificate(detail);
      setCertificates((currentItems) =>
        currentItems.map((item) => (item.id === detail.id ? detail : item)),
      );
      setDetailOpened(true);
    } catch (err) {
      const message = getErrorMessage(err, "Detail sertifikat gagal dimuat.");
      setDownloadError(message);
      showNotification({
        type: "error",
        title: "Detail gagal dimuat",
        message,
        duration: 4000,
      });
    }
  }

  async function handleDownloadPdf() {
    if (!certificate.backendId) {
      const message = "Sertifikat belum tersedia untuk diunduh.";
      setDownloadError(message);
      showNotification({ type: "warning", title: "Sertifikat belum tersedia", message, duration: 3500 });
      return;
    }

    if (!certificate.pdfAvailable) {
      const message = "PDF sertifikat belum dibuat oleh admin. Silakan hubungi admin untuk generate PDF.";
      setDownloadError(message);
      showNotification({ type: "warning", title: "PDF belum tersedia", message, duration: 4000 });
      return;
    }

    try {
      setDownloadLoading(true);
      setDownloadError(null);

      const blob = await downloadParticipantCertificatePdf(certificate.backendId);
      saveBlob(blob, buildCertificateFileName(certificate));
      showNotification({
        type: "success",
        title: "Sertifikat diunduh",
        message: "PDF sertifikat berhasil diunduh.",
        duration: 3000,
      });
    } catch (err) {
      const message = getErrorMessage(err, "PDF sertifikat gagal diunduh.");
      setDownloadError(message);
      showNotification({
        type: "error",
        title: "Download gagal",
        message,
        duration: 4000,
      });
    } finally {
      setDownloadLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl overflow-x-hidden">
        <section className="rounded-2xl bg-[#eef3f9] p-3 sm:rounded-[28px] sm:p-6 lg:p-7">
          <DigitalCertificateHeader />
          <LoadingSpinner label="Memuat sertifikat digital..." />
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl overflow-x-hidden">
        <section className="rounded-2xl bg-[#eef3f9] p-3 sm:rounded-[28px] sm:p-6 lg:p-7">
          <DigitalCertificateHeader />
          <div className="mt-4 sm:mt-6">
            <ErrorMessage
              title="Sertifikat Digital Gagal Dimuat"
              message={error}
              action={
                <Button onClick={loadCertificatePage} className="h-10 rounded-xl">
                  Coba Lagi
                </Button>
              }
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl overflow-x-hidden">
        <section className="rounded-2xl bg-[#eef3f9] p-3 sm:rounded-[28px] sm:p-6 lg:p-7">
          <DigitalCertificateHeader />

          {downloadError ? (
            <div className="mt-4 sm:mt-6">
              <ErrorMessage
                title="Aksi Sertifikat Gagal"
                message={downloadError}
              />
            </div>
          ) : null}

          {certificate.isAvailable ? (
            <>
              <div className="mt-4 sm:mt-6">
                <CertificateSummaryStats items={availableStats} />
              </div>

              <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <CertificateDocumentPreview
                  certificate={previewCertificate}
                  template={previewTemplate}
                  className="h-full"
                />

                <div className="space-y-4 sm:space-y-5">
                  <CertificateQuickActionsCard
                    copied={copied}
                    onDownloadPdf={handleDownloadPdf}
                    onViewDetail={handleOpenDetail}
                    onCopyLink={handleCopyLink}
                    importantNote={certificate.importantNote}
                    downloadLoading={downloadLoading}
                    downloadDisabled={!certificate.pdfAvailable}
                    pdfInfoLabel={
                      certificate.pdfAvailable
                        ? certificate.pdfSizeLabel
                          ? `PDF tersedia · ${certificate.pdfSizeLabel}`
                          : "PDF tersedia"
                        : "PDF belum dibuat admin"
                    }
                  />

                  <CertificateInfoNoticeCard
                    isAvailable={true}
                    importantNote={certificate.importantNote}
                  />

                  <CertificateHistoryListCard
                    certificates={certificateOptions}
                    activeBackendId={certificate.backendId}
                    onSelect={handleSelectCertificate}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                <CertificateUnavailableCard
                  verificationLabel={certificate.verificationLabel}
                  message={certificate.achievementText}
                />

                <CertificateProgressCard
                  progressPercent={certificate.progressPercent}
                  requirements={certificate.requirements}
                  onOpenSchedule={() => navigate("/peserta/jadwal-saya")}
                />
              </div>

              <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                <CertificateSummaryStats items={unavailableStats} />

                <div className="space-y-4 sm:space-y-5">
                  <CertificateInfoNoticeCard
                    isAvailable={false}
                    importantNote={certificate.importantNote}
                  />

                  <CertificateHistoryListCard
                    certificates={certificateOptions}
                    activeBackendId={certificate.backendId}
                    onSelect={handleSelectCertificate}
                  />
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <CertificateDetailModal
        opened={detailOpened}
        onClose={() => setDetailOpened(false)}
        certificate={modalCertificate}
      />
    </>
  );
}
