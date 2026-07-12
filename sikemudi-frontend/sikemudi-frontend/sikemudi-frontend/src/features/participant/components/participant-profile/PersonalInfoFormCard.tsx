import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import { BriefcaseBusiness } from "lucide-react";

export interface PersonalInfoFormValues {
  fullName: string;
  email: string;
  phoneNumber: string;
  joinDate: string;
  address: string;
}

interface PersonalInfoFormCardProps {
  values: PersonalInfoFormValues;
  onChange: (field: keyof PersonalInfoFormValues, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const profileInputClassName =
  "h-11 rounded-xl bg-slate-50 text-sm font-medium text-slate-800 focus:bg-white";
const profileLabelClassName =
  "text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700";

export default function PersonalInfoFormCard({
  values,
  onChange,
  onSave,
  onCancel,
  isSaving = false,
}: PersonalInfoFormCardProps) {
  return (
    <Card className="rounded-2xl p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
          <BriefcaseBusiness className="h-4 w-4" />
        </div>

        <h3 className="text-lg font-extrabold tracking-tight text-slate-950">
          Informasi Pribadi
        </h3>
      </div>

      <div className="mt-4 grid gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4">
        <Input
          label="Nama Lengkap"
          type="text"
          value={values.fullName}
          onChange={(event) => onChange("fullName", event.target.value)}
          labelClassName={profileLabelClassName}
          className={profileInputClassName}
        />

        <Input
          label="Email"
          type="email"
          value={values.email}
          onChange={(event) => onChange("email", event.target.value)}
          labelClassName={profileLabelClassName}
          className={profileInputClassName}
        />

        <Input
          label="Nomor Telepon"
          type="text"
          value={values.phoneNumber}
          onChange={(event) => onChange("phoneNumber", event.target.value)}
          labelClassName={profileLabelClassName}
          className={profileInputClassName}
        />

        <Input
          label="Tanggal Bergabung"
          type="text"
          value={values.joinDate}
          disabled
          readOnly
          labelClassName={profileLabelClassName}
          className={profileInputClassName}
        />
      </div>

      <div className="mt-4 sm:mt-5">
        <TextArea
          label="Alamat Lengkap"
          value={values.address}
          onChange={(event) => onChange("address", event.target.value)}
          rows={3}
          labelClassName={profileLabelClassName}
          className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 focus:bg-white"
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:pt-5">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving}
          className="h-10 rounded-xl px-5 text-xs font-bold text-slate-700 hover:bg-slate-100 sm:h-11 sm:px-6"
        >
          Batal
        </Button>

        <Button
          onClick={onSave}
          loading={isSaving}
          className="h-10 rounded-xl bg-slate-950 px-6 text-xs font-bold text-white shadow-lg shadow-slate-900/15 hover:bg-slate-800 sm:h-11 sm:px-8 sm:text-sm"
        >
          Simpan Perubahan
        </Button>
      </div>
    </Card>
  );
}
