import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import type {
  AdminTimeSlot,
  AdminTimeSlotFormValues,
  AdminTimeSlotStatus,
} from "@/features/admin/constants/timeSlots";
import {
  timeSlotActiveDayOptions,
  timeSlotFormStatusOptions,
} from "@/features/admin/constants/timeSlots";

interface EditTimeSlotModalProps {
  opened: boolean;
  timeSlot: AdminTimeSlot | null;
  values: AdminTimeSlotFormValues;
  loading?: boolean;
  onChange: (field: keyof AdminTimeSlotFormValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const labelClassName =
  "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700";
const inputClassName = "h-11 rounded-2xl bg-slate-100 text-sm";

export default function EditTimeSlotModal({
  opened,
  timeSlot,
  values,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: EditTimeSlotModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      compact
      title="Ubah Slot Waktu"
      description={
        timeSlot
          ? `Perbarui data ${timeSlot.name}. Kode slot tetap dipertahankan oleh sistem.`
          : "Perbarui data slot waktu."
      }
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            className="rounded-2xl px-5 font-bold uppercase tracking-[0.08em]"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>

          <Button
            className="rounded-2xl bg-slate-950 px-7 font-bold uppercase tracking-[0.08em] hover:bg-slate-800"
            leftIcon={<Save className="h-4 w-4" />}
            loading={loading}
            onClick={onSubmit}
          >
            Simpan Perubahan
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
          Data Utama Slot
        </div>

        <Input
          label="Nama Slot"
          requiredMark
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
          labelClassName={labelClassName}
          className={inputClassName}
        />

        <Input
          label="Deskripsi Singkat"
          value={values.subtitle}
          onChange={(event) => onChange("subtitle", event.target.value)}
          labelClassName={labelClassName}
          className={inputClassName}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Jam Mulai"
            requiredMark
            type="time"
            value={values.startTime}
            onChange={(event) => onChange("startTime", event.target.value)}
            labelClassName={labelClassName}
            className={inputClassName}
          />

          <Input
            label="Jam Selesai"
            requiredMark
            type="time"
            value={values.endTime}
            onChange={(event) => onChange("endTime", event.target.value)}
            labelClassName={labelClassName}
            className={inputClassName}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Status Slot"
            value={values.status}
            onChange={(event) =>
              onChange("status", event.target.value as AdminTimeSlotStatus)
            }
            options={timeSlotFormStatusOptions}
            className={inputClassName}
          />

          <Select
            label="Berlaku Pada"
            value={values.activeDays}
            onChange={(event) => onChange("activeDays", event.target.value)}
            options={timeSlotActiveDayOptions}
            className={inputClassName}
          />
        </div>

        <TextArea
          label="Catatan"
          value={values.note}
          onChange={(event) => onChange("note", event.target.value)}
          rows={3}
          placeholder="Tambahkan informasi tambahan jika ada..."
          labelClassName={labelClassName}
          className="rounded-2xl bg-slate-100 text-sm"
        />
      </div>
    </Modal>
  );
}
