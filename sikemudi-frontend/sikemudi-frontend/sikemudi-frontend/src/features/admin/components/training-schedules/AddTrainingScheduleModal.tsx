import { AlertTriangle, Save, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import type {
  AdminTrainingScheduleFormValues,
  AdminTrainingScheduleStatus,
} from "@/features/admin/constants/trainingSchedules";
import { trainingScheduleFormStatusOptions } from "@/features/admin/constants/trainingSchedules";

interface SelectOption {
  label: string;
  value: string;
}

interface AddTrainingScheduleModalProps {
  opened: boolean;
  values: AdminTrainingScheduleFormValues;
  slotOptions: SelectOption[];
  instructorOptions: SelectOption[];
  instructorHint?: string;
  instructorSelectDisabled?: boolean;
  vehicleOptions: SelectOption[];
  coursePackageOptions: SelectOption[];
  conflictMessages: string[];
  loading?: boolean;
  onChange: (
    field: keyof AdminTrainingScheduleFormValues,
    value: string,
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const labelClassName =
  "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700";
const inputClassName = "h-10 rounded-2xl border-0 bg-slate-100 text-base";

export default function AddTrainingScheduleModal({
  opened,
  values,
  slotOptions,
  instructorOptions,
  instructorHint,
  instructorSelectDisabled = false,
  vehicleOptions,
  coursePackageOptions,
  conflictMessages,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: AddTrainingScheduleModalProps) {
  const hasConflict = conflictMessages.length > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      showCloseButton={false}
      bodyClassName="p-0"
    >
      <div className="overflow-hidden rounded-[28px] bg-white">
        <div className="flex items-start justify-between gap-4 bg-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950">
              Buat Jadwal Baru
            </h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
              Data akan langsung tersimpan ke backend.
            </p>
          </div>

          <button
            type="button"
            aria-label="Tutup modal jadwal"
            className="rounded-xl p-1 text-slate-600 hover:bg-white hover:text-slate-950"
            onClick={onClose}
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[calc(100dvh-14rem)] overflow-y-auto px-6 py-6">
          {hasConflict ? (
            <div className="mb-7 flex gap-4 rounded-2xl border-l-4 border-l-red-600 bg-red-50 p-5 text-red-800">
              <AlertTriangle className="mt-1 h-6 w-6 shrink-0" />
              <div>
                <p className="font-bold">Catatan Validasi</p>
                <div className="mt-2 space-y-1 text-sm leading-6">
                  {conflictMessages.map((message) => (
                    <p key={message}>{message}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <Input
              label="Tanggal Latihan"
              requiredMark
              type="date"
              value={values.date}
              onChange={(event) => onChange("date", event.target.value)}
              labelClassName={labelClassName}
              className={inputClassName}
            />

            <Select
              label="Paket Kursus"
              value={values.coursePackageId}
              onChange={(event) => onChange("coursePackageId", event.target.value)}
              options={coursePackageOptions}
              className={inputClassName}
            />

            <Select
              label="Slot Waktu"
              value={values.slotId}
              onChange={(event) => onChange("slotId", event.target.value)}
              options={slotOptions}
              className={inputClassName}
            />

            <Select
              label="Instruktur"
              value={values.instructorId}
              onChange={(event) => onChange("instructorId", event.target.value)}
              options={instructorOptions}
              disabled={instructorSelectDisabled}
              hint={instructorHint}
              className={inputClassName}
            />

            <Select
              label="Kendaraan"
              value={values.vehicleId}
              onChange={(event) => onChange("vehicleId", event.target.value)}
              options={vehicleOptions}
              className={inputClassName}
            />

            <Input
              label="Kuota Peserta"
              requiredMark
              type="number"
              min={1}
              value={values.quota}
              onChange={(event) => onChange("quota", event.target.value)}
              placeholder="Contoh: 2"
              labelClassName={labelClassName}
              className={inputClassName}
            />

            <Select
              label="Status Jadwal"
              value={values.status}
              onChange={(event) =>
                onChange(
                  "status",
                  event.target.value as AdminTrainingScheduleStatus,
                )
              }
              options={trainingScheduleFormStatusOptions}
              className={inputClassName}
            />

            <Input
              label="Lokasi Titik"
              value={values.location}
              onChange={(event) => onChange("location", event.target.value)}
              labelClassName={labelClassName}
              className={inputClassName}
            />

            <div className="lg:col-span-2">
              <TextArea
                label="Catatan Tambahan"
                value={values.note}
                onChange={(event) => onChange("note", event.target.value)}
                rows={4}
                placeholder="Tambahkan informasi khusus untuk instruktur atau administrasi..."
                labelClassName={labelClassName}
                className="rounded-2xl border-0 bg-slate-100 text-base"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:items-center sm:justify-end">
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
            disabled={hasConflict || loading}
            className="rounded-2xl bg-slate-950 px-8 font-bold uppercase tracking-[0.08em] hover:bg-slate-800 disabled:bg-slate-400"
            leftIcon={<Save className="h-4 w-4" />}
            onClick={onSubmit}
          >
            {loading ? "Menyimpan..." : "Simpan Jadwal"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
