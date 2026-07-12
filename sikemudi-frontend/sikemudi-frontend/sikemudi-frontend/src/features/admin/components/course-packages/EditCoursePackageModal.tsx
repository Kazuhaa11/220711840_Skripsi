import { Save } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import type {
  AdminCoursePackage,
  AdminCoursePackageFormValues,
  AdminCoursePackageStatus,
} from "@/features/admin/constants/coursePackages";
import {
  coursePackageFormStatusOptions,
} from "@/features/admin/constants/coursePackages";

interface EditCoursePackageModalProps {
  opened: boolean;
  coursePackage: AdminCoursePackage | null;
  values: AdminCoursePackageFormValues;
  loading?: boolean;
  onChange: (
    field: keyof AdminCoursePackageFormValues,
    value: string | boolean,
  ) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const labelClassName =
  "text-[11px] font-bold uppercase tracking-[0.16em] text-slate-700";
const inputClassName = "h-11 rounded-2xl bg-slate-100 text-sm";

const priceFields: {
  field: keyof Pick<
    AdminCoursePackageFormValues,
    "priceNoPickup" | "pricePickup" | "priceSimNoPickup" | "priceSimPickup"
  >;
  label: string;
}[] = [
  { field: "priceNoPickup", label: "Tanpa Antar Jemput" },
  { field: "pricePickup", label: "Antar Jemput" },
  { field: "priceSimNoPickup", label: "SIM + Tanpa Jemput" },
  { field: "priceSimPickup", label: "SIM + Antar Jemput" },
];

export default function EditCoursePackageModal({
  opened,
  coursePackage,
  values,
  loading = false,
  onChange,
  onClose,
  onSubmit,
}: EditCoursePackageModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={<span className="text-white">Edit Paket Kursus</span>}
      description={
        <span className="text-blue-100">
          {coursePackage
            ? `Perbarui data paket ${coursePackage.name}.`
            : "Perbarui data paket kursus."}
        </span>
      }
      showCloseButton={false}
      headerClassName="bg-blue-700 text-white"
      bodyClassName="px-5 py-5 sm:px-6 sm:py-5"
      footerClassName="px-5 py-4 sm:px-6"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="ghost"
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
      <div className="pr-1">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4 lg:col-span-2">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
              Data Utama Paket
            </p>
          </div>

          <Input
            label="Nama Paket Kursus"
            requiredMark
            value={values.name}
            onChange={(event) => onChange("name", event.target.value)}
            labelClassName={labelClassName}
            className={inputClassName}
            wrapperClassName="lg:col-span-2"
          />

          <Input
            label="Deskripsi Singkat"
            value={values.shortDescription}
            onChange={(event) => onChange("shortDescription", event.target.value)}
            labelClassName={labelClassName}
            className={inputClassName}
            wrapperClassName="lg:col-span-2"
          />

          <Input
            label="Durasi Pelatihan (Jam)"
            requiredMark
            value={values.durationHours}
            onChange={(event) => onChange("durationHours", event.target.value)}
            inputMode="numeric"
            labelClassName={labelClassName}
            className={inputClassName}
          />

          <Select
            label="Status Paket"
            value={values.status}
            onChange={(event) =>
              onChange("status", event.target.value as AdminCoursePackageStatus)
            }
            options={coursePackageFormStatusOptions}
            className={inputClassName}
          />

          <button
            type="button"
            onClick={() =>
              onChange("certificateIncluded", !values.certificateIncluded)
            }
            className="flex h-11 items-center justify-between rounded-2xl bg-slate-100 px-4 text-left lg:col-span-2"
          >
            <span>
              <span className="block text-sm font-black text-slate-950">
                Sertifikat Termasuk
              </span>
              <span className="text-[11px] font-bold uppercase text-slate-500">
                E-certificate dan sertifikat fisik
              </span>
            </span>

            <span
              className={`flex h-7 w-10 items-center rounded-full p-1 transition ${
                values.certificateIncluded ? "bg-emerald-500" : "bg-slate-300"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white transition ${
                  values.certificateIncluded ? "translate-x-3" : ""
                }`}
              />
            </span>
          </button>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
            <div className="mb-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                Harga Paket
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Perubahan harga akan langsung dipakai pada booking baru. Pilihan manual/matic serta antar jemput dipilih peserta saat booking.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {priceFields.map((item) => (
                <Input
                  key={item.field}
                  label={item.label}
                  requiredMark
                  value={values[item.field]}
                  onChange={(event) => onChange(item.field, event.target.value)}
                  inputMode="numeric"
                  labelClassName={labelClassName}
                  className={inputClassName}
                />
              ))}
            </div>
          </div>

          <TextArea
            label="Deskripsi Paket"
            value={values.description}
            onChange={(event) => onChange("description", event.target.value)}
            rows={4}
            labelClassName={labelClassName}
            className="rounded-2xl bg-slate-100 text-sm"
            wrapperClassName="lg:col-span-2"
          />
        </div>
      </div>
    </Modal>
  );
}
