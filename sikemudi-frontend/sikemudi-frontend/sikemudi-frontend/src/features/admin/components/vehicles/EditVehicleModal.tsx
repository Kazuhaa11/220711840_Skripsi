import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import type {
  AdminVehicle,
  AdminVehicleAvailability,
  AdminVehicleFormValues,
  AdminVehicleStatus,
  AdminVehicleTransmission,
} from "@/features/admin/constants/vehicles";
import {
  vehicleFormAvailabilityOptions,
  vehicleFormStatusOptions,
  vehicleFormTransmissionOptions,
} from "@/features/admin/constants/vehicles";

interface EditVehicleModalProps {
  opened: boolean;
  vehicle: AdminVehicle | null;
  values: AdminVehicleFormValues;
  loading?: boolean;
  onChange: (field: keyof AdminVehicleFormValues, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const labelClassName =
  "text-[10px] font-black uppercase tracking-[0.18em] text-slate-700";
const inputClassName = "h-11 rounded-2xl border-0 bg-slate-100 text-sm";

export default function EditVehicleModal({
  opened,
  vehicle,
  values,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: EditVehicleModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="2xl"
      compact
      title="Ubah Data Kendaraan"
      description={
        vehicle
          ? `Perbarui konfigurasi ${vehicle.name} ${vehicle.model}.`
          : "Perbarui konfigurasi kendaraan."
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
            className="rounded-2xl bg-slate-950 px-5 font-bold uppercase tracking-[0.08em] hover:bg-slate-800"
            leftIcon={<Save className="h-4 w-4" />}
            loading={loading}
            onClick={onSubmit}
          >
            Simpan Perubahan
          </Button>
        </div>
      }
    >
      <div className="rounded-2xl bg-blue-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-blue-700">
        Detail Kendaraan
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Input
          label="Nama Kendaraan"
          requiredMark
          value={values.name}
          onChange={(event) => onChange("name", event.target.value)}
          labelClassName={labelClassName}
          className={inputClassName}
        />

        <Input
          label="Model Kendaraan"
          requiredMark
          value={values.model}
          onChange={(event) => onChange("model", event.target.value)}
          labelClassName={labelClassName}
          className={inputClassName}
        />

        <Input
          label="Plat Nomor"
          requiredMark
          value={values.plateNumber}
          onChange={(event) => onChange("plateNumber", event.target.value)}
          labelClassName={labelClassName}
          className={inputClassName}
        />

        <Select
          label="Jenis Transmisi"
          value={values.transmission}
          onChange={(event) =>
            onChange(
              "transmission",
              event.target.value as AdminVehicleTransmission,
            )
          }
          options={vehicleFormTransmissionOptions}
          className={inputClassName}
        />

        <Select
          label="Status Operasional"
          value={values.status}
          onChange={(event) =>
            onChange("status", event.target.value as AdminVehicleStatus)
          }
          options={vehicleFormStatusOptions}
          className={inputClassName}
        />

        <Select
          label="Ketersediaan"
          value={values.availability}
          onChange={(event) =>
            onChange(
              "availability",
              event.target.value as AdminVehicleAvailability,
            )
          }
          options={vehicleFormAvailabilityOptions}
          className={inputClassName}
        />

        <div className="lg:col-span-2">
          <TextArea
            label="Catatan Tambahan"
            value={values.note}
            onChange={(event) => onChange("note", event.target.value)}
            rows={3}
            placeholder="Masukkan riwayat servis terakhir atau kondisi khusus..."
            labelClassName={labelClassName}
            className="rounded-2xl border-0 bg-slate-100 text-sm"
          />
        </div>
      </div>
    </Modal>
  );
}
