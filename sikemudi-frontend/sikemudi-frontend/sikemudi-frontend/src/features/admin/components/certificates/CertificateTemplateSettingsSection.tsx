import { Edit3, Plus, RefreshCw, Star, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import type {
  AdminCertificateTemplate,
  AdminDigitalCertificate,
} from "@/features/admin/constants/certificates";
import CertificateDocumentPreview from "@/features/admin/components/certificates/CertificateDocumentPreview";

interface CertificateTemplateSettingsSectionProps {
  templates: AdminCertificateTemplate[];
  template: AdminCertificateTemplate;
  sampleCertificate: AdminDigitalCertificate | null;
  loading?: boolean;
  onSelectTemplate: (templateId: string) => void;
  onCreateTemplate: () => void;
  onEditTemplate: () => void;
  onSetDefault: () => void;
  onDelete: () => void;
}

const infoLabelClassName =
  "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500";

export default function CertificateTemplateSettingsSection({
  templates,
  template,
  sampleCertificate,
  loading = false,
  onSelectTemplate,
  onCreateTemplate,
  onEditTemplate,
  onSetDefault,
  onDelete,
}: CertificateTemplateSettingsSectionProps) {
  const templateOptions = templates.map((item) => ({
    label: `${item.templateName}${item.isDefault ? " — Default" : ""}${item.status === "Nonaktif" ? " — Nonaktif" : ""}`,
    value: item.id,
  }));

  const selectedTemplateExists = Boolean(template.numericId);

  return (
    <section className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="space-y-5">
        <Card className="rounded-3xl p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                Pengaturan Template
              </p>
              <h2 className="mt-2 text-lg font-bold text-slate-950">
                Desain Sertifikat Digital
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Kelola template sertifikat melalui modal tambah dan edit. Template aktif
                dapat dipilih saat sertifikat diterbitkan.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="rounded-2xl font-bold"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={onCreateTemplate}
              disabled={loading}
            >
              Template Baru
            </Button>
          </div>

          <div className="mt-5 space-y-4">
            <Select
              label="Pilih Template"
              value={template.id}
              onChange={(event) => onSelectTemplate(event.target.value)}
              options={templateOptions}
              placeholder={templates.length === 0 ? "Belum ada template" : undefined}
              className="h-10 rounded-2xl border-0 bg-slate-100 text-base"
              disabled={loading || templates.length === 0}
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-100 px-4 py-3">
                <p className={infoLabelClassName}>Default</p>
                <p className="mt-1 text-sm font-bold text-slate-950">
                  {template.isDefault ? "Ya" : "Tidak"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-100 px-4 py-3">
                <p className={infoLabelClassName}>Status</p>
                <p className="mt-1 text-sm font-bold text-slate-950">
                  {template.status}
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
                  Dipakai
                </p>
                <p className="mt-1 text-sm font-bold text-blue-950">
                  {template.certificatesCount ?? 0} sertifikat
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                className="rounded-2xl bg-slate-950 font-bold uppercase tracking-widest hover:bg-slate-800"
                leftIcon={<Edit3 className="h-4 w-4" />}
                onClick={onEditTemplate}
                disabled={loading || !selectedTemplateExists}
              >
                Edit Template
              </Button>

              <Button
                variant="outline"
                className="rounded-2xl font-bold"
                leftIcon={<Star className="h-4 w-4" />}
                onClick={onSetDefault}
                disabled={loading || !selectedTemplateExists || template.status !== "Aktif" || template.isDefault}
              >
                Jadikan Default
              </Button>
            </div>

            <Button
              variant="danger"
              fullWidth
              className="rounded-2xl font-bold"
              leftIcon={template.certificatesCount ? <RefreshCw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
              onClick={onDelete}
              disabled={loading || !selectedTemplateExists}
            >
              {template.certificatesCount ? "Nonaktifkan Template" : "Hapus Template"}
            </Button>
          </div>
        </Card>

        <Card className="rounded-3xl bg-blue-50 p-5 shadow-none">
          <p className="font-bold text-blue-900">Catatan Template</p>
          <p className="mt-2 text-sm leading-6 text-blue-800">
            Preview mengikuti struktur template PDF yang digenerate backend.
            Perubahan desain dilakukan melalui modal tambah atau edit template.
          </p>
        </Card>
      </div>

      <div>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
          Live Preview
        </p>

        <CertificateDocumentPreview
          certificate={sampleCertificate}
          template={template}
        />
      </div>
    </section>
  );
}
