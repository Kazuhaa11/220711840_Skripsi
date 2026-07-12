import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { PASSWORD_STRENGTH_HINT } from "@/features/auth/utils/passwordStrength";

interface AccountSecurityValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AccountSecurityCardProps {
  values: AccountSecurityValues;
  isVerified: boolean;
  title?: string;
  onChange: (field: keyof AccountSecurityValues, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

const securityInputClassName =
  "h-11 rounded-xl bg-slate-50 text-sm font-medium text-slate-800 focus:bg-white";
const securityLabelClassName =
  "text-[10px] font-bold uppercase tracking-[0.18em] text-slate-700";

export default function AccountSecurityCard({
  values,
  isVerified,
  title = "Keamanan Akun",
  onChange,
  onSave,
  onCancel,
  isSaving = false,
}: AccountSecurityCardProps) {
  return (
    <Card className="rounded-2xl p-4 shadow-sm sm:rounded-3xl sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <ShieldAlert className="h-4 w-4" />
          </div>

          <h3 className="text-lg font-extrabold tracking-tight text-slate-950">
            {title}
          </h3>
        </div>

        {isVerified ? (
          <Badge variant="info" className="gap-2 px-3 py-1.5 text-[11px] font-bold">
            <ShieldCheck className="h-4 w-4" />
            Akun Terverifikasi
          </Badge>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-3">
        <Input
          label="Password Saat Ini"
          type="password"
          value={values.currentPassword}
          onChange={(event) => onChange("currentPassword", event.target.value)}
          labelClassName={securityLabelClassName}
          className={securityInputClassName}
          placeholder="Masukkan password saat ini"
        />

        <Input
          label="Kata Sandi Baru"
          type="password"
          value={values.newPassword}
          onChange={(event) => onChange("newPassword", event.target.value)}
          labelClassName={securityLabelClassName}
          className={securityInputClassName}
          placeholder="Min. 8 Karakter"
          hint={PASSWORD_STRENGTH_HINT}
        />

        <Input
          label="Konfirmasi Kata Sandi"
          type="password"
          value={values.confirmPassword}
          onChange={(event) => onChange("confirmPassword", event.target.value)}
          labelClassName={securityLabelClassName}
          className={securityInputClassName}
          placeholder="Ulangi sandi baru"
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:mt-6 sm:flex-row sm:items-center sm:gap-3">
        <Button
          onClick={onSave}
          loading={isSaving}
          className="h-10 rounded-xl px-5 text-xs font-bold uppercase tracking-wide sm:h-11 sm:px-6 sm:text-sm"
        >
          Simpan Perubahan
        </Button>

        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isSaving}
          className="h-10 px-4 text-xs font-bold uppercase tracking-wide text-slate-700 hover:text-slate-950 sm:h-11"
        >
          Batal
        </Button>
      </div>
    </Card>
  );
}
