import { Info, Save, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import type {
  AdminTrainingAttendance,
  AdminTrainingGraduationStatus,
  AdminTrainingResult,
  AdminTrainingResultFormValues,
} from "@/features/admin/constants/trainingResults";
import {
  trainingResultAttendanceOptions,
  trainingResultGraduationOptions,
} from "@/features/admin/constants/trainingResults";

interface InputTrainingResultModalProps {
  opened: boolean;
  result: AdminTrainingResult | null;
  values: AdminTrainingResultFormValues;
  resultOptions: { label: string; value: string }[];
  onChange: (field: keyof AdminTrainingResultFormValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const labelClassName =
  "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700";
const inputClassName = "h-10 rounded-2xl border-0 bg-slate-100 text-base";

export default function InputTrainingResultModal({
  opened,
  result,
  values,
  resultOptions,
  onChange,
  onClose,
  onSubmit,
}: InputTrainingResultModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      showCloseButton={false}
      bodyClassName="p-0"
    >
      <div className="overflow-hidden rounded-[28px] bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950">
              Input Hasil Latihan
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Lengkapi evaluasi sesi latihan berkendara.
            </p>
          </div>

          <button
            type="button"
            aria-label="Tutup modal input hasil"
            className="rounded-xl p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-950"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid gap-5 px-6 py-6 lg:grid-cols-2">
          <Select
            label="Peserta Kursus"
            value={values.participantId}
            onChange={(event) => onChange("participantId", event.target.value)}
            options={resultOptions}
            className={inputClassName}
          />

          <Input
            label="Jadwal / Tanggal Sesi"
            value={
              result
                ? `${result.sessionDate}, ${result.sessionTime}`
                : "Pilih peserta terlebih dahulu"
            }
            readOnly
            labelClassName={labelClassName}
            className={inputClassName}
          />

          <Input
            label="Instruktur"
            value={result?.instructorName ?? "-"}
            readOnly
            labelClassName={labelClassName}
            className={inputClassName}
          />

          <Input
            label="Kendaraan"
            value={
              result ? `${result.vehicleName} (${result.vehiclePlate})` : "-"
            }
            readOnly
            labelClassName={labelClassName}
            className={inputClassName}
          />

          <Select
            label="Kehadiran"
            value={values.attendance}
            onChange={(event) =>
              onChange(
                "attendance",
                event.target.value as AdminTrainingAttendance,
              )
            }
            options={trainingResultAttendanceOptions.filter(
              (option) => option.value !== "all",
            )}
            className={inputClassName}
          />

          <Select
            label="Status Kelulusan"
            value={values.graduationStatus}
            onChange={(event) =>
              onChange(
                "graduationStatus",
                event.target.value as AdminTrainingGraduationStatus,
              )
            }
            options={trainingResultGraduationOptions}
            className={inputClassName}
          />

          <div className="lg:col-span-2">
            <TextArea
              label="Evaluasi Latihan"
              value={values.evaluation}
              onChange={(event) => onChange("evaluation", event.target.value)}
              rows={4}
              placeholder="Deskripsikan performa teknis peserta..."
              labelClassName={labelClassName}
              className="rounded-2xl border-0 bg-slate-100 text-base"
            />
          </div>

          <div className="lg:col-span-2">
            <TextArea
              label="Catatan Tambahan"
              value={values.instructorNote}
              onChange={(event) =>
                onChange("instructorNote", event.target.value)
              }
              rows={3}
              placeholder="Catatan internal untuk instruktur lain..."
              labelClassName={labelClassName}
              className="rounded-2xl border-0 bg-slate-100 text-base"
            />
          </div>

          <div className="rounded-2xl border-l-4 border-l-blue-600 bg-blue-50 p-5 lg:col-span-2">
            <div className="flex gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <p className="text-sm leading-6 text-blue-800">
                Status kelulusan dari instruktur akan masuk ke tahap verifikasi
                admin sebelum sertifikat digital diterbitkan.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
            size="lg"
            className="rounded-2xl px-5 font-bold"
            onClick={onClose}
          >
            Batal
          </Button>

          <Button
            size="lg"
            className="rounded-2xl bg-slate-950 px-8 font-bold uppercase tracking-widest hover:bg-slate-800"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={onSubmit}
          >
            Simpan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
