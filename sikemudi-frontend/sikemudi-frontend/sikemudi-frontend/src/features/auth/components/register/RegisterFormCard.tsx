import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import {
  LockKeyhole,
  Mail,
  Phone,
  RotateCcw,
  User,
} from "lucide-react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { PASSWORD_STRENGTH_HINT } from "@/features/auth/utils/passwordStrength";

interface RegisterFormCardProps {
  submitError?: string | null;
  isSubmitting?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

const registerInputClassName =
  "h-12 rounded-2xl bg-slate-50 text-sm focus:bg-white";
const registerLabelClassName =
  "text-xs font-bold uppercase tracking-wide text-slate-800";

export default function RegisterFormCard({
  submitError = null,
  isSubmitting = false,
  onSubmit,
}: RegisterFormCardProps) {
  return (
    <div className="w-full max-w-110">
      <Card className="rounded-4xl px-6 py-6 shadow-sm sm:px-7 sm:py-7">
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            id="fullName"
            name="fullName"
            label="Nama Lengkap"
            type="text"
            placeholder="Masukkan nama lengkap Anda"
            leftIcon={<User className="h-4.5 w-4.5" />}
            labelClassName={registerLabelClassName}
            className={registerInputClassName}
          />

          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            placeholder="contoh@email.com"
            hint="Gunakan email aktif untuk verifikasi akun."
            leftIcon={<Mail className="h-4.5 w-4.5" />}
            labelClassName={registerLabelClassName}
            hintClassName="text-[11px] italic text-slate-500"
            className={registerInputClassName}
          />

          <Input
            id="phone"
            name="phone"
            label="Nomor Telepon"
            type="tel"
            placeholder="0812xxxxxx"
            hint="Nomor telepon digunakan untuk notifikasi jadwal."
            leftIcon={<Phone className="h-4.5 w-4.5" />}
            labelClassName={registerLabelClassName}
            hintClassName="text-[11px] italic text-slate-500"
            className={registerInputClassName}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="password"
              name="password"
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              hint={PASSWORD_STRENGTH_HINT}
              leftIcon={<LockKeyhole className="h-4.5 w-4.5" />}
              labelClassName={registerLabelClassName}
              className={registerInputClassName}
            />

            <Input
              id="passwordConfirmation"
              name="passwordConfirmation"
              label="Konfirmasi"
              type="password"
              placeholder="••••••••"
              leftIcon={<RotateCcw className="h-4.5 w-4.5" />}
              labelClassName={registerLabelClassName}
              className={registerInputClassName}
            />
          </div>

          {submitError ? (
            <ErrorMessage
              title="Registrasi gagal"
              message={submitError}
              className="rounded-3xl px-4 py-3.5"
            />
          ) : null}

          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-slate-700">
            <input
              type="checkbox"
              className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>
              Saya menyetujui{" "}
              <span className="font-semibold text-blue-700">
                Syarat & Kebijakan Layanan
              </span>{" "}
              SIKEMUDI.
            </span>
          </label>

          <Button
            type="submit"
            fullWidth
            className="h-12 rounded-2xl bg-slate-950 text-sm font-bold text-white hover:bg-slate-800"
            loading={isSubmitting}
          >
            Daftar sebagai Peserta
          </Button>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-center text-sm text-slate-600">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-700 transition hover:text-blue-800"
            >
              Masuk ke Sistem
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
