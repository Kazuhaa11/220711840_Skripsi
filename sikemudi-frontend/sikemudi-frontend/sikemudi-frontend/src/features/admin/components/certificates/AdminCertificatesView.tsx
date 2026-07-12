/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import SuccesBanner from "@/components/feedback/SuccesBanner";
import Card from "@/components/ui/Card";
import AdminCertificatesFilters from "@/features/admin/components/certificates/AdminCertificatesFilters";
import AdminCertificatesHeader from "@/features/admin/components/certificates/AdminCertificatesHeader";
import AdminCertificatesTable from "@/features/admin/components/certificates/AdminCertificatesTable";
import CertificateTemplateFormModal from "@/features/admin/components/certificates/CertificateTemplateFormModal";
import CertificateTemplateSettingsSection from "@/features/admin/components/certificates/CertificateTemplateSettingsSection";
import IssueCertificateModal from "@/features/admin/components/certificates/IssueCertificateModal";
import RevokeCertificateModal from "@/features/admin/components/certificates/RevokeCertificateModal";
import {
  createAdminCertificateTemplate,
  deleteAdminCertificateTemplate,
  downloadAdminCertificatePdf,
  generateAdminCertificatePdf,
  getAllAdminCertificateCandidates,
  getAllAdminCertificates,
  getAllAdminCertificateTemplates,
  issueAdminCertificate,
  revokeAdminCertificate,
  setDefaultAdminCertificateTemplate,
  updateAdminCertificateTemplate,
} from "@/services/adminCertificate.service";
import {
  buildCertificateRows,
  mapApiTemplateToAdminCertificateTemplate,
  mapCertificateToAdminCertificate,
  mapTemplateToPayload,
} from "@/features/admin/utils/adminCertificateMapper";
import type {
  AdminCertificateIssueFormValues,
  AdminCertificateTemplate,
  AdminDigitalCertificate,
} from "@/features/admin/constants/certificates";
import {
  adminCertificateDefaultTemplate,
  adminCertificateMessages,
  emptyCertificateIssueFormValues,
} from "@/features/admin/constants/certificates";

const CERTIFICATES_PER_PAGE = 10;

interface TemplateAssetState {
  backgroundImageFile: File | null;
  signatureImageFile: File | null;
  removeBackgroundImage: boolean;
  removeSignatureImage: boolean;
}

const emptyTemplateAssets: TemplateAssetState = {
  backgroundImageFile: null,
  signatureImageFile: null,
  removeBackgroundImage: false,
  removeSignatureImage: false,
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function openBlobInNewTab(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const openedWindow = window.open(objectUrl, "_blank", "noopener,noreferrer");

  if (!openedWindow) {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

function buildPdfFileName(certificate: AdminDigitalCertificate) {
  if (certificate.pdfOriginalName) {
    return certificate.pdfOriginalName;
  }

  const safeNumber = certificate.certificateNumber || `sertifikat-${certificate.numericId}`;
  return `${safeNumber}.pdf`.replace(/[\\/:*?"<>|]/g, "-");
}

function formValuesFromCertificate(
  certificate: AdminDigitalCertificate,
  templateId: string,
): AdminCertificateIssueFormValues {
  return {
    sourceResultId: certificate.sourceResultId,
    templateId,
    certificateNumber: certificate.certificateNumber,
    issuedAt: todayInputValue(),
    status: certificate.status === "Draft" ? "Terbit" : "Terbit",
  };
}

function makeNewTemplate(): AdminCertificateTemplate {
  return {
    ...adminCertificateDefaultTemplate,
    id: "new",
    numericId: null,
    templateName: "Template Baru",
    isDefault: false,
    certificatesCount: 0,
  };
}

function pickDefaultTemplate(templates: AdminCertificateTemplate[]) {
  return (
    templates.find((item) => item.status === "Aktif" && item.isDefault) ??
    templates.find((item) => item.status === "Aktif") ??
    templates[0] ??
    adminCertificateDefaultTemplate
  );
}

export default function AdminCertificatesView() {
  const { showNotification } = useFloatingNotification();

  const [activeSection, setActiveSection] = useState<"management" | "template">(
    "management",
  );
  const [certificates, setCertificates] = useState<AdminDigitalCertificate[]>([]);
  const [templates, setTemplates] = useState<AdminCertificateTemplate[]>([]);
  const [template, setTemplate] = useState<AdminCertificateTemplate>(
    adminCertificateDefaultTemplate,
  );
  const [templateAssets, setTemplateAssets] = useState<TemplateAssetState>(emptyTemplateAssets);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateModalMode, setTemplateModalMode] = useState<"create" | "edit">("edit");

  const [searchValue, setSearchValue] = useState("");
  const [statusValue, setStatusValue] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedCertificate, setSelectedCertificate] =
    useState<AdminDigitalCertificate | null>(null);

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState("");

  const [issueFormValues, setIssueFormValues] =
    useState<AdminCertificateIssueFormValues>(emptyCertificateIssueFormValues);

  const fetchTemplates = useCallback(async (preferredTemplateId?: string) => {
    const response = await getAllAdminCertificateTemplates();
    const mappedTemplates = response.items.map(mapApiTemplateToAdminCertificateTemplate);

    setTemplates(mappedTemplates);

    const nextTemplate =
      mappedTemplates.find((item) => item.id === preferredTemplateId) ??
      pickDefaultTemplate(mappedTemplates);

    setTemplate(nextTemplate);
    setTemplateAssets(emptyTemplateAssets);

    return mappedTemplates;
  }, []);

  const fetchCertificates = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const normalizedSearch = searchValue.trim();
      const baseQuery = {
        q: normalizedSearch || undefined,
      };

      const shouldFetchCandidates =
        statusValue === "all" || statusValue === "Menunggu Penerbitan";
      const shouldFetchCertificates =
        statusValue === "all" || statusValue !== "Menunggu Penerbitan";

      const [candidateResponse, certificateResponse] = await Promise.all([
        shouldFetchCandidates
          ? getAllAdminCertificateCandidates(baseQuery)
          : Promise.resolve({ items: [] }),
        shouldFetchCertificates
          ? getAllAdminCertificates({
              ...baseQuery,
              status: statusValue === "all" ? undefined : statusValue,
            })
          : Promise.resolve({ items: [] }),
      ]);

      const nextCertificates = buildCertificateRows(
        candidateResponse.items,
        certificateResponse.items,
      );

      setCertificates(nextCertificates);
      setSelectedCertificate((current) => {
        if (!current) return current;

        const syncedCertificate = nextCertificates.find((certificate) => {
          if (current.numericId && certificate.numericId) {
            return certificate.numericId === current.numericId;
          }

          return certificate.id === current.id;
        });

        return syncedCertificate ?? current;
      });

      return nextCertificates;
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Data sertifikat gagal dimuat dari backend.",
      );
      return [];
    } finally {
      setLoading(false);
    }
  }, [searchValue, statusValue]);

  useEffect(() => {
    void fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    void fetchTemplates().catch((err) => {
      setErrorMessage(
        err instanceof Error ? err.message : "Template sertifikat gagal dimuat dari backend.",
      );
    });
  }, [fetchTemplates]);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  const totalPages = Math.max(1, Math.ceil(certificates.length / CERTIFICATES_PER_PAGE));
  const pageStartIndex = (currentPage - 1) * CERTIFICATES_PER_PAGE;
  const paginatedCertificates = useMemo(
    () => certificates.slice(pageStartIndex, pageStartIndex + CERTIFICATES_PER_PAGE),
    [certificates, pageStartIndex],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, statusValue]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const certificateOptions = useMemo(
    () =>
      certificates
        .filter((certificate) => certificate.sourceType === "candidate")
        .map((certificate) => ({
          label: `${certificate.participantName} - ${certificate.packageName}${certificate.completedSessions !== null && certificate.completedSessions !== undefined && certificate.totalSessions ? ` (${certificate.completedSessions}/${certificate.totalSessions} sesi)` : ""}`,
          value: certificate.sourceResultId,
        })),
    [certificates],
  );

  const activeTemplates = useMemo(
    () => templates.filter((item) => item.status === "Aktif"),
    [templates],
  );

  const defaultIssueTemplate = pickDefaultTemplate(activeTemplates.length > 0 ? activeTemplates : templates);

  const issueTemplateOptions = useMemo(
    () => activeTemplates.map((item) => ({
      label: `${item.templateName}${item.isDefault ? " — Default" : ""}`,
      value: item.id,
    })),
    [activeTemplates],
  );

  const selectedIssueTemplate =
    activeTemplates.find((item) => item.id === issueFormValues.templateId) ??
    defaultIssueTemplate;

  const sampleCertificate = certificates[0] ?? null;

  function resetMessages() {
    setSuccessMessage("");
    setErrorMessage("");
  }

  function notifySuccess(message: string, title = "Berhasil") {
    setSuccessMessage(message);
    showNotification({ type: "success", title, message, duration: 3500 });
  }

  function notifyError(message: string, title = "Gagal") {
    setErrorMessage(message);
    showNotification({ type: "error", title, message, duration: 4500 });
  }

  function handleOpenIssue(certificate?: AdminDigitalCertificate) {
    resetMessages();

    const targetCertificate =
      certificate?.sourceType === "candidate"
        ? certificate
        : certificates.find((item) => item.sourceType === "candidate") ?? null;

    if (!targetCertificate) {
      setErrorMessage(
        "Belum ada peserta lulus yang dapat diterbitkan sertifikat. Pastikan admin sudah validasi hasil latihan sebagai Lulus dan sertifikat belum pernah diterbitkan.",
      );
      return;
    }

    if (activeTemplates.length === 0) {
      setErrorMessage("Belum ada template sertifikat aktif. Aktifkan atau tambah template terlebih dahulu.");
      setActiveSection("template");
      return;
    }

    setSelectedCertificate(targetCertificate);
    setIssueFormValues(formValuesFromCertificate(targetCertificate, defaultIssueTemplate.id));
    setIssueModalOpen(true);
  }

  function handleIssueChange(
    field: keyof AdminCertificateIssueFormValues,
    value: string,
  ) {
    resetMessages();

    if (field === "sourceResultId") {
      const foundCertificate = certificates.find(
        (certificate) => certificate.sourceResultId === value,
      );

      if (foundCertificate) {
        setSelectedCertificate(foundCertificate);
        setIssueFormValues((current) => ({
          ...formValuesFromCertificate(foundCertificate, current.templateId || defaultIssueTemplate.id),
          templateId: current.templateId || defaultIssueTemplate.id,
        }));
      }

      return;
    }

    setIssueFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmitIssue() {
    if (!selectedCertificate) {
      setErrorMessage("Pilih peserta terlebih dahulu.");
      return;
    }

    if (!issueFormValues.templateId) {
      setErrorMessage("Pilih template sertifikat terlebih dahulu.");
      return;
    }

    if (!issueFormValues.issuedAt && issueFormValues.status === "Terbit") {
      setErrorMessage("Tanggal terbit wajib diisi.");
      return;
    }

    try {
      setActionLoading(true);
      resetMessages();

      await issueAdminCertificate({
        hasil_latihan_id:
          selectedCertificate.sourceResultNumericId ?? Number(selectedCertificate.sourceResultId),
        template_id: Number(issueFormValues.templateId),
        tanggal_terbit: issueFormValues.issuedAt || undefined,
        status: issueFormValues.status,
      });

      setSuccessMessage(
        issueFormValues.status === "Terbit"
          ? `${adminCertificateMessages.issueSuccess} QR dan PDF sertifikat sudah dibuat otomatis.`
          : adminCertificateMessages.draftSuccess,
      );

      setIssueModalOpen(false);
      setSelectedCertificate(null);
      await fetchCertificates();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Sertifikat gagal diterbitkan.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleGeneratePdf(certificate: AdminDigitalCertificate) {
    if (!certificate.numericId) return;

    try {
      setActionLoading(true);
      resetMessages();
      const response = await generateAdminCertificatePdf(certificate.numericId);
      const updatedCertificate = mapCertificateToAdminCertificate(response.item);

      setCertificates((current) =>
        current.map((item) =>
          item.numericId === updatedCertificate.numericId ? updatedCertificate : item,
        ),
      );
      setSelectedCertificate((current) =>
        current?.numericId === updatedCertificate.numericId ? updatedCertificate : current,
      );
      setSuccessMessage(adminCertificateMessages.pdfSuccess);
      await fetchCertificates();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "PDF sertifikat gagal dibuat.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDownloadPdf(certificate: AdminDigitalCertificate) {
    if (!certificate.numericId) return;

    try {
      setActionLoading(true);
      resetMessages();
      const blob = await downloadAdminCertificatePdf(certificate.numericId);
      openBlobInNewTab(blob, buildPdfFileName(certificate));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "PDF sertifikat gagal diunduh.");
    } finally {
      setActionLoading(false);
    }
  }



  function handleOpenRevoke(certificate: AdminDigitalCertificate) {
    resetMessages();

    if (certificate.sourceType !== "certificate" || !certificate.numericId) {
      notifyError("Sertifikat belum terbit sehingga belum dapat dicabut.");
      return;
    }

    if (certificate.status !== "Terbit") {
      notifyError("Hanya sertifikat berstatus Terbit yang dapat dicabut.");
      return;
    }

    setSelectedCertificate(certificate);
    setRevokeReason("");
    setRevokeModalOpen(true);
  }

  async function handleSubmitRevoke() {
    if (!selectedCertificate?.numericId) {
      notifyError("Pilih sertifikat yang akan dicabut terlebih dahulu.");
      return;
    }

    try {
      setActionLoading(true);
      resetMessages();

      const response = await revokeAdminCertificate(selectedCertificate.numericId, {
        catatan: revokeReason.trim() || null,
      });
      const revokedCertificate = mapCertificateToAdminCertificate(response.item);

      setCertificates((current) =>
        current.map((item) =>
          item.numericId === revokedCertificate.numericId ? revokedCertificate : item,
        ),
      );
      setSelectedCertificate((current) =>
        current?.numericId === revokedCertificate.numericId ? revokedCertificate : current,
      );
      setRevokeModalOpen(false);
      setRevokeReason("");
      notifySuccess(adminCertificateMessages.revokeSuccess, "Sertifikat dicabut");
      await fetchCertificates();
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Sertifikat gagal dicabut.");
    } finally {
      setActionLoading(false);
    }
  }

  function handleSelectTemplate(templateId: string) {
    resetMessages();
    const foundTemplate = templates.find((item) => item.id === templateId);

    if (foundTemplate) {
      setTemplate(foundTemplate);
      setTemplateAssets(emptyTemplateAssets);
    }
  }

  function handleCreateTemplate() {
    resetMessages();
    setTemplate(makeNewTemplate());
    setTemplateAssets(emptyTemplateAssets);
    setTemplateModalMode("create");
    setTemplateModalOpen(true);
  }

  function handleEditTemplate() {
    resetMessages();

    if (!template.numericId) {
      setErrorMessage("Pilih template yang akan diedit terlebih dahulu.");
      return;
    }

    setTemplateAssets(emptyTemplateAssets);
    setTemplateModalMode("edit");
    setTemplateModalOpen(true);
  }

  function handleTemplateChange(
    field: keyof AdminCertificateTemplate,
    value: string | boolean,
  ) {
    resetMessages();
    setTemplate((current) => {
      const nextTemplate = {
        ...current,
        [field]: value,
      };

      if (field === "status" && value === "Nonaktif") {
        nextTemplate.isDefault = false;
      }

      if (field === "isDefault" && value === true) {
        nextTemplate.status = "Aktif";
      }

      if (field === "backgroundImage" && value) {
        nextTemplate.backgroundType = "Gambar";
      }

      return nextTemplate;
    });
  }

  function handleUploadTemplateAsset(
    field: "backgroundImage" | "signatureImage",
    file: File | null,
  ) {
    resetMessages();

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("File template harus berupa gambar.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Ukuran file template maksimal 2 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setTemplate((current) => ({
        ...current,
        [field]: String(reader.result),
        ...(field === "backgroundImage" ? {
          backgroundType: "Gambar" as const,
          backgroundImageFileName: file.name,
        } : {
          signatureImageFileName: file.name,
        }),
      }));
    };

    reader.readAsDataURL(file);

    setTemplateAssets((current) => ({
      ...current,
      ...(field === "backgroundImage"
        ? {
            backgroundImageFile: file,
            removeBackgroundImage: false,
          }
        : {
            signatureImageFile: file,
            removeSignatureImage: false,
          }),
    }));
  }

  function handleRemoveTemplateAsset(field: "backgroundImage" | "signatureImage") {
    resetMessages();

    setTemplate((current) => ({
      ...current,
      [field]: "",
      ...(field === "backgroundImage" ? {
        backgroundType: "Warna" as const,
        backgroundImageFileName: null,
      } : {
        signatureImageFileName: null,
      }),
    }));

    setTemplateAssets((current) => ({
      ...current,
      ...(field === "backgroundImage"
        ? {
            backgroundImageFile: null,
            removeBackgroundImage: true,
          }
        : {
            signatureImageFile: null,
            removeSignatureImage: true,
          }),
    }));
  }

  async function handleSaveTemplate() {
    if (!template.templateName.trim()) {
      setErrorMessage("Nama template wajib diisi.");
      return;
    }

    if (!template.title.trim()) {
      setErrorMessage("Judul sertifikat wajib diisi.");
      return;
    }

    try {
      setActionLoading(true);
      resetMessages();

      const payload = mapTemplateToPayload(template, templateAssets);
      const response = template.numericId
        ? await updateAdminCertificateTemplate(template.numericId, payload)
        : await createAdminCertificateTemplate(payload);
      const savedTemplate = mapApiTemplateToAdminCertificateTemplate(response.item);

      setTemplate(savedTemplate);
      setTemplateAssets(emptyTemplateAssets);
      setTemplateModalOpen(false);
      setSuccessMessage(adminCertificateMessages.templateSuccess);
      await fetchTemplates(savedTemplate.id);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Template sertifikat gagal disimpan.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSetDefaultTemplate() {
    if (!template.numericId) {
      setErrorMessage("Simpan template terlebih dahulu sebelum dijadikan default.");
      return;
    }

    try {
      setActionLoading(true);
      resetMessages();
      const response = await setDefaultAdminCertificateTemplate(template.numericId);
      const savedTemplate = mapApiTemplateToAdminCertificateTemplate(response.item);

      setTemplate(savedTemplate);
      setSuccessMessage(adminCertificateMessages.templateDefaultSuccess);
      await fetchTemplates(savedTemplate.id);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Template default gagal diperbarui.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteTemplate() {
    if (!template.numericId) {
      setErrorMessage("Template baru belum tersimpan sehingga tidak perlu dihapus.");
      return;
    }

    const confirmed = window.confirm(
      template.certificatesCount && template.certificatesCount > 0
        ? "Template ini sudah pernah dipakai. Template akan dinonaktifkan agar riwayat sertifikat tidak rusak. Lanjutkan?"
        : "Hapus template sertifikat ini?",
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      resetMessages();
      await deleteAdminCertificateTemplate(template.numericId);
      setSuccessMessage(adminCertificateMessages.templateDeleteSuccess);
      await fetchTemplates();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Template sertifikat gagal dihapus.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-295">
      {successMessage ? (
        <div className="mb-6">
          <SuccesBanner message={successMessage} />
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mb-6">
          <ErrorMessage title="Validasi Gagal" message={errorMessage} />
        </div>
      ) : null}

      <AdminCertificatesHeader
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onIssue={() => handleOpenIssue()}
      />

      {activeSection === "management" ? (
        <>
          <div className="mt-5">
            <AdminCertificatesFilters
              searchValue={searchValue}
              statusValue={statusValue}
              onSearchChange={setSearchValue}
              onStatusChange={setStatusValue}
            />
          </div>

          <div className="mt-5">
            {loading ? (
              <Card className="rounded-3xl p-8 shadow-sm">
                <LoadingSpinner label="Memuat data sertifikat dari backend..." />
              </Card>
            ) : (
              <AdminCertificatesTable
                certificates={paginatedCertificates}
                loading={actionLoading}
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={certificates.length}
                startItem={certificates.length === 0 ? 0 : pageStartIndex + 1}
                endItem={Math.min(pageStartIndex + CERTIFICATES_PER_PAGE, certificates.length)}
                onPageChange={setCurrentPage}
                onIssue={handleOpenIssue}
                onGeneratePdf={handleGeneratePdf}
                onDownloadPdf={handleDownloadPdf}
                onRevoke={handleOpenRevoke}
              />
            )}
          </div>
        </>
      ) : (
        <div className="mt-5">
          <CertificateTemplateSettingsSection
            templates={templates}
            template={template}
            sampleCertificate={sampleCertificate}
            loading={actionLoading}
            onSelectTemplate={handleSelectTemplate}
            onCreateTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
            onSetDefault={handleSetDefaultTemplate}
            onDelete={handleDeleteTemplate}
          />
        </div>
      )}

      <IssueCertificateModal
        opened={issueModalOpen}
        certificate={selectedCertificate}
        values={issueFormValues}
        certificateOptions={certificateOptions}
        templateOptions={issueTemplateOptions}
        template={selectedIssueTemplate}
        loading={actionLoading}
        onChange={handleIssueChange}
        onClose={() => {
          if (actionLoading) return;
          setIssueModalOpen(false);
        }}
        onSubmit={handleSubmitIssue}
      />

      <CertificateTemplateFormModal
        opened={templateModalOpen}
        mode={templateModalMode}
        template={template}
        sampleCertificate={sampleCertificate}
        loading={actionLoading}
        onChange={handleTemplateChange}
        onUpload={handleUploadTemplateAsset}
        onRemoveAsset={handleRemoveTemplateAsset}
        onClose={() => {
          if (actionLoading) return;
          const currentTemplateId = template.numericId ? template.id : undefined;

          setTemplateModalOpen(false);
          setTemplateAssets(emptyTemplateAssets);

          void fetchTemplates(currentTemplateId);
        }}
        onSave={handleSaveTemplate}
      />

      <RevokeCertificateModal
        opened={revokeModalOpen}
        certificate={selectedCertificate}
        reason={revokeReason}
        loading={actionLoading}
        onReasonChange={setRevokeReason}
        onClose={() => {
          if (actionLoading) return;
          setRevokeModalOpen(false);
          setRevokeReason("");
        }}
        onSubmit={handleSubmitRevoke}
      />
    </div>
  );
}
