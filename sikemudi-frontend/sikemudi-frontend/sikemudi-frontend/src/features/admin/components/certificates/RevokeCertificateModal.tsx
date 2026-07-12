import { AlertTriangle, Ban } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import Badge from "@/components/ui/Badge";
import type { AdminDigitalCertificate } from "@/features/admin/constants/certificates";

interface RevokeCertificateModalProps {
  opened: boolean;
  certificate: AdminDigitalCertificate | null;
  reason: string;
  loading?: boolean;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function RevokeCertificateModal({
  opened,
  certificate,
  reason,
  loading = false,
  onReasonChange,
  onClose,
  onSubmit,
}: RevokeCertificateModalProps) {
  const canSubmit = Boolean(certificate?.numericId) && certificate?.status === "Terbit";

  return (
    <Modal
      opened={opened}
      onClose={loading ? () => undefined : onClose}
      title="Cabut Sertifikat"
      description="Sertifikat yang dicabut tidak dapat diunduh, dibuatkan PDF baru, atau diverifikasi sebagai sertifikat aktif."
      size="md"
      compact
      closeOnOverlayClick={!loading}
      closeOnEsc={!loading}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-2xl sm:w-auto"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>

          <Button
            type="button"
            className="w-full rounded-2xl bg-red-600 font-bold hover:bg-red-700 sm:w-auto"
            leftIcon={<Ban className="h-4 w-4" />}
            onClick={onSubmit}
            disabled={loading || !canSubmit}
          >
            {loading ? "Mencabut..." : "Cabut Sertifikat"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-4">
          <div className="flex gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-black text-red-900">
                Pastikan keputusan pencabutan sudah benar.
              </p>
              <p className="mt-1 text-sm leading-6 text-red-700">
                Status peserta akan dikembalikan ke proses sertifikat sesuai respons backend. Riwayat sertifikat tetap tersimpan.
              </p>
            </div>
          </div>
        </div>

        {certificate ? (
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Sertifikat
                </p>
                <h3 className="mt-1 truncate text-base font-black text-slate-950 sm:text-lg">
                  {certificate.participantName}
                </h3>
                <p className="mt-1 break-all text-sm text-slate-600">
                  {certificate.certificateNumber || "Nomor belum tersedia"}
                </p>
              </div>

              <Badge className="w-fit bg-emerald-100 font-bold text-emerald-700">
                {certificate.status}
              </Badge>
            </div>
          </div>
        ) : null}

        <TextArea
          label="Alasan pencabutan"
          hint="Opsional. Alasan ini akan dikirim sebagai catatan ke backend jika diisi."
          placeholder="Contoh: Data sertifikat perlu diperbaiki atau sertifikat diterbitkan tidak sesuai."
          rows={4}
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
          disabled={loading}
          className="min-h-28 resize-y rounded-2xl"
        />
      </div>
    </Modal>
  );
}
