import { Save, ShieldCheck, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import type {
  AdminTrainingResult,
  AdminTrainingVerificationFormValues,
} from "@/features/admin/constants/trainingResults";

interface VerifyTrainingResultModalProps {
  opened: boolean;
  result: AdminTrainingResult | null;
  values: AdminTrainingVerificationFormValues;
  loading?: boolean;
  onChange: (
    field: keyof AdminTrainingVerificationFormValues,
    value: string,
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const labelClassName =
  "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700";

export default function VerifyTrainingResultModal({
  opened,
  result,
  values,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: VerifyTrainingResultModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      showCloseButton={false}
      compact
      headerClassName="border-b-0 bg-slate-950 px-6 py-6 text-white sm:px-8"
      bodyClassName="space-y-6 px-6 py-6 sm:px-8"
      footerClassName="border-t border-slate-200 bg-slate-50 px-6 py-5 sm:px-8"
      title={
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="block text-xl font-black tracking-tight text-white">
              Validasi Kelulusan
            </span>
            <span className="mt-2 block max-w-2xl text-sm font-medium leading-6 text-slate-300">
              Admin hanya memvalidasi hasil yang sudah diinput instruktur.
              Penerbitan sertifikat dilakukan di menu Sertifikat.
            </span>
          </div>

          <button
            type="button"
            aria-label="Tutup modal validasi"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      }
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
            Simpan Validasi
          </Button>
        </div>
      }
    >
      {result ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Peserta
          </p>
          <p className="mt-2 text-lg font-bold text-slate-950">
            {result.participantName}
          </p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            {result.id} • {result.packageName} • {result.sessionDate}
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Nilai akhir:{" "}
            <span className="font-bold text-slate-950">
              {result.nilaiAkhir ?? "-"}
            </span>
          </p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className={labelClassName}>Status Kelulusan Final</p>
        <p className="mt-2 text-lg font-bold text-emerald-800">Lulus</p>
        <p className="mt-1 text-sm leading-6 text-emerald-700">
          Status ini berasal dari hasil akhir sesi terakhir yang diinput instruktur.
          Admin hanya memberi validasi agar peserta masuk kandidat sertifikat.
        </p>
      </section>

      <TextArea
        label="Catatan Admin"
        value={values.adminNote}
        onChange={(event) => onChange("adminNote", event.target.value)}
        rows={4}
        placeholder="Tuliskan catatan validasi admin..."
        labelClassName={labelClassName}
        className="rounded-2xl border border-slate-200 bg-slate-50 text-base"
        disabled={loading}
      />

      <section className="flex w-full items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-left">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <div>
          <p className="font-bold text-slate-950">ACC untuk Proses Sertifikat</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Jika status final diset Lulus, hasil latihan akan masuk kandidat
            penerbitan sertifikat di menu Sertifikat. Admin tidak menginput
            ulang hasil latihan di halaman ini.
          </p>
        </div>
      </section>
    </Modal>
  );
}
