import { ImagePlus, Save, Signature, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import type {
  AdminCertificateTemplate,
  AdminDigitalCertificate,
} from "@/features/admin/constants/certificates";
import CertificateDocumentPreview from "@/features/admin/components/certificates/CertificateDocumentPreview";

interface CertificateTemplateFormModalProps {
  opened: boolean;
  mode: "create" | "edit";
  template: AdminCertificateTemplate;
  sampleCertificate: AdminDigitalCertificate | null;
  loading?: boolean;
  onChange: (
    field: keyof AdminCertificateTemplate,
    value: string | boolean,
  ) => void;
  onUpload: (
    field: "backgroundImage" | "signatureImage",
    file: File | null,
  ) => void;
  onRemoveAsset: (field: "backgroundImage" | "signatureImage") => void;
  onClose: () => void;
  onSave: () => void;
}

const inputClassName = "h-10 rounded-2xl border-0 bg-slate-100 text-base";
const labelClassName =
  "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700";

export default function CertificateTemplateFormModal({
  opened,
  mode,
  template,
  sampleCertificate,
  loading = false,
  onChange,
  onUpload,
  onRemoveAsset,
  onClose,
  onSave,
}: CertificateTemplateFormModalProps) {
  const isCreate = mode === "create";

  return (
    <Modal
      opened={opened}
      onClose={loading ? () => undefined : onClose}
      size="full"
      title={isCreate ? "Tambah Template Sertifikat" : "Edit Template Sertifikat"}
      description="Atur teks, warna, background, tanda tangan digital, dan lihat preview template sebelum disimpan."
      bodyClassName="max-h-[calc(100dvh-15rem)]"
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
            onClick={onSave}
            loading={loading}
          >
            {isCreate ? "Tambah Template" : "Simpan Perubahan"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,500px)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Input
            label="Nama Template"
            value={template.templateName}
            onChange={(event) => onChange("templateName", event.target.value)}
            labelClassName={labelClassName}
            className={inputClassName}
            disabled={loading}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nama Penyelenggara"
              value={template.institutionName}
              onChange={(event) => onChange("institutionName", event.target.value)}
              labelClassName={labelClassName}
              className={inputClassName}
              disabled={loading}
            />

            <Input
              label="Alamat / Identitas Penyelenggara"
              value={template.institutionAddress}
              onChange={(event) => onChange("institutionAddress", event.target.value)}
              labelClassName={labelClassName}
              className={inputClassName}
              disabled={loading}
            />
          </div>

          <Input
            label="Subjudul / Teks Akreditasi"
            value={template.accreditationText}
            onChange={(event) =>
              onChange("accreditationText", event.target.value)
            }
            labelClassName={labelClassName}
            className={inputClassName}
            disabled={loading}
          />

          <Input
            label="Judul Sertifikat"
            value={template.title}
            onChange={(event) => onChange("title", event.target.value)}
            labelClassName={labelClassName}
            className={inputClassName}
            disabled={loading}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Label Penerima"
              value={template.recipientLabel}
              onChange={(event) => onChange("recipientLabel", event.target.value)}
              labelClassName={labelClassName}
              className={inputClassName}
              disabled={loading}
            />

            <Input
              label="Kalimat Program"
              value={template.programPrefix}
              onChange={(event) => onChange("programPrefix", event.target.value)}
              labelClassName={labelClassName}
              className={inputClassName}
              disabled={loading}
            />
          </div>

          <TextArea
            label="Kalimat Pembuka"
            value={template.openingText}
            onChange={(event) => onChange("openingText", event.target.value)}
            rows={3}
            labelClassName={labelClassName}
            className="rounded-2xl border-0 bg-slate-100 text-base"
            disabled={loading}
          />

          <TextArea
            label="Kalimat Penutup"
            value={template.closingText}
            onChange={(event) => onChange("closingText", event.target.value)}
            rows={4}
            labelClassName={labelClassName}
            className="rounded-2xl border-0 bg-slate-100 text-base"
            disabled={loading}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nama Penandatangan"
              value={template.signerName}
              onChange={(event) => onChange("signerName", event.target.value)}
              labelClassName={labelClassName}
              className={inputClassName}
              disabled={loading}
            />

            <Input
              label="Jabatan Penandatangan"
              value={template.signerTitle}
              onChange={(event) => onChange("signerTitle", event.target.value)}
              labelClassName={labelClassName}
              className={inputClassName}
              disabled={loading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClassName}>Warna Background</label>
              <input
                type="color"
                value={template.backgroundColor}
                onChange={(event) =>
                  onChange("backgroundColor", event.target.value)
                }
                className="mt-2 h-10 w-full rounded-2xl border-0 bg-slate-100 p-2"
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClassName}>Warna Border</label>
              <input
                type="color"
                value={template.borderColor}
                onChange={(event) => onChange("borderColor", event.target.value)}
                className="mt-2 h-10 w-full rounded-2xl border-0 bg-slate-100 p-2"
                disabled={loading}
              />
            </div>

            <div>
              <label className={labelClassName}>Warna Aksen</label>
              <input
                type="color"
                value={template.accentColor}
                onChange={(event) => onChange("accentColor", event.target.value)}
                className="mt-2 h-10 w-full rounded-2xl border-0 bg-slate-100 p-2"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <label className="flex cursor-pointer flex-col justify-center hover:bg-slate-100">
                <div className="flex items-center gap-3">
                  <ImagePlus className="h-5 w-5 text-blue-700" />
                  <div>
                    <p className="font-bold text-slate-950">Upload Background</p>
                    <p className="text-xs text-slate-500">
                      PNG/JPG/WEBP maksimal 2 MB
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={loading}
                  onChange={(event) =>
                    onUpload("backgroundImage", event.target.files?.[0] ?? null)
                  }
                />
              </label>
              {template.backgroundImage ? (
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-600">
                  <span className="truncate">{template.backgroundImageFileName || "Background terpasang"}</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700"
                    onClick={() => onRemoveAsset("backgroundImage")}
                    disabled={loading}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <label className="flex cursor-pointer flex-col justify-center hover:bg-slate-100">
                <div className="flex items-center gap-3">
                  <Signature className="h-5 w-5 text-blue-700" />
                  <div>
                    <p className="font-bold text-slate-950">Upload Tanda Tangan</p>
                    <p className="text-xs text-slate-500">
                      PNG/JPG/WEBP maksimal 2 MB
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={loading}
                  onChange={(event) =>
                    onUpload("signatureImage", event.target.files?.[0] ?? null)
                  }
                />
              </label>
              {template.signatureImage ? (
                <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-600">
                  <span className="truncate">{template.signatureImageFileName || "Tanda tangan terpasang"}</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700"
                    onClick={() => onRemoveAsset("signatureImage")}
                    disabled={loading}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Hapus
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
            Live Preview
          </p>
          <CertificateDocumentPreview
            certificate={sampleCertificate}
            template={template}
          />
        </div>
      </div>
    </Modal>
  );
}
