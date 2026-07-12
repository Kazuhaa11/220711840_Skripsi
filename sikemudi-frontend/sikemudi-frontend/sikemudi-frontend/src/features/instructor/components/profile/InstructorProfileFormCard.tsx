import { UserRound } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import type { InstructorProfileFormValues } from "@/features/instructor/constants/instructorProfile";
import { instructorSpecializationOptions } from "@/features/instructor/constants/instructorProfile";

interface InstructorProfileFormCardProps {
  values: InstructorProfileFormValues;
  onChange: (field: keyof InstructorProfileFormValues, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const inputClassName =
  "h-11 rounded-xl border-slate-100 bg-slate-50 text-sm font-medium text-slate-900 focus:bg-white";
const labelClassName =
  "text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700";

export default function InstructorProfileFormCard({
  values,
  onChange,
  onSave,
  onCancel,
  isSaving = false,
}: InstructorProfileFormCardProps) {
  return (
    <Card className="rounded-3xl p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <UserRound className="h-4 w-4" />
        </div>

        <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
          Detail Informasi Pribadi
        </h2>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Input
          label="Nama Lengkap"
          value={values.fullName}
          onChange={(event) => onChange("fullName", event.target.value)}
          labelClassName={labelClassName}
          className={inputClassName}
        />

        <Input
          label="Email Instruktur"
          type="email"
          value={values.email}
          onChange={(event) => onChange("email", event.target.value)}
          labelClassName={labelClassName}
          className={inputClassName}
        />

        <Input
          label="Nomor Telepon"
          value={values.phoneNumber}
          onChange={(event) => onChange("phoneNumber", event.target.value)}
          leftIcon={
            <span className="text-sm font-bold text-slate-700">
              {values.phoneCountryCode}
            </span>
          }
          labelClassName={labelClassName}
          className={`${inputClassName} pl-16`}
        />

        <Select
          label="Spesialisasi Mengemudi"
          value={values.specialization}
          onChange={(event) => onChange("specialization", event.target.value)}
          options={instructorSpecializationOptions}
          className="h-11 rounded-xl border-slate-100 bg-slate-50 text-sm font-medium text-slate-900 focus:bg-white"
        />
      </div>

      <div className="mt-5">
        <TextArea
          label="Alamat Lengkap"
          value={values.address}
          onChange={(event) => onChange("address", event.target.value)}
          rows={4}
          labelClassName={labelClassName}
          className="rounded-xl border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 focus:bg-white"
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
        <Button
          variant="ghost"
          className="h-11 rounded-xl px-6 text-xs font-bold text-slate-700 hover:bg-slate-100"
          onClick={onCancel}
          disabled={isSaving}
        >
          Batal
        </Button>

        <Button
          className="h-11 rounded-xl bg-slate-950 px-8 text-sm font-bold text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800"
          onClick={onSave}
          loading={isSaving}
        >
          Simpan Perubahan
        </Button>
      </div>
    </Card>
  );
}
