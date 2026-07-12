import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import type {
  AdminCertificateIssueFormValues,
  AdminCertificateTemplate,
  AdminDigitalCertificate,
} from "@/features/admin/constants/certificates";
import { certificateIssueStatusOptions } from "@/features/admin/constants/certificates";
import CertificateDocumentPreview from "@/features/admin/components/certificates/CertificateDocumentPreview";

interface IssueCertificateModalProps {
  opened: boolean;
  certificate: AdminDigitalCertificate | null;
  values: AdminCertificateIssueFormValues;
  certificateOptions: { label: string; value: string }[];
  templateOptions: { label: string; value: string }[];
  template: AdminCertificateTemplate;
  loading?: boolean;
  onChange: (
    field: keyof AdminCertificateIssueFormValues,
    value: string,
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const inputClassName = "h-10 rounded-2xl border-0 bg-slate-100 text-base";

export default function IssueCertificateModal({
  opened,
  certificate,
  values,
  certificateOptions,
  templateOptions,
  template,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: IssueCertificateModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={loading ? () => undefined : onClose}
      size="full"
      showCloseButton={false}
      title="Terbitkan Sertifikat"
      description="Sertifikat hanya tersedia untuk peserta yang sudah dinyatakan lulus dan belum memiliki sertifikat."
      bodyClassName="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            size="lg"
            className="rounded-2xl px-5 font-bold"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>

          <Button
            size="lg"
            className="rounded-2xl bg-slate-950 px-8 font-bold uppercase tracking-widest hover:bg-slate-800"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={onSubmit}
            loading={loading}
          >
            {values.status === "Terbit" ? "Terbitkan Sertifikat" : "Simpan Draft"}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <Select
          label="Peserta Lulus"
          value={values.sourceResultId}
          onChange={(event) => onChange("sourceResultId", event.target.value)}
          options={certificateOptions}
          className={inputClassName}
          disabled={loading}
        />

        <Select
          label="Template Sertifikat"
          value={values.templateId}
          onChange={(event) => onChange("templateId", event.target.value)}
          options={templateOptions}
          className={inputClassName}
          disabled={loading || templateOptions.length === 0}
          hint="Template aktif yang dipilih akan dipakai backend saat generate QR dan PDF sertifikat."
        />

        <Input
          label="Nomor Sertifikat"
          value={values.certificateNumber || "Dibuat otomatis oleh backend"}
          className={inputClassName}
          disabled
          hint="Nomor sertifikat dibuat otomatis oleh backend saat sertifikat diterbitkan."
        />

        <Input
          label="Tanggal Terbit"
          type="date"
          value={values.issuedAt}
          onChange={(event) => onChange("issuedAt", event.target.value)}
          className={inputClassName}
          disabled={loading}
        />

        <Select
          label="Status Sertifikat"
          value={values.status}
          onChange={(event) => onChange("status", event.target.value)}
          options={certificateIssueStatusOptions}
          className={inputClassName}
          disabled={loading}
        />
      </div>

      <div className="min-w-0">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
          Preview Sertifikat
        </p>

        <CertificateDocumentPreview
          certificate={
            certificate
              ? {
                  ...certificate,
                  certificateNumber:
                    values.certificateNumber || "Dibuat otomatis",
                  issuedAt: values.issuedAt,
                  status: values.status,
                }
              : null
          }
          template={template}
        />
      </div>
    </Modal>
  );
}
