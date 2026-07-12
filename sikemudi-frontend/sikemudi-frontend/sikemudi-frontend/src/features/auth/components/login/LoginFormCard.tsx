import ErrorMessage from "@/components/feedback/ErrorMessage";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import {
  AtSign,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  LogIn,
} from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface LoginFormCardProps {
  submitError?: string | null;
  isSubmitting?: boolean;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

const authInputClassName =
  "h-13 rounded-2xl bg-slate-50 text-base focus:bg-white";

export default function LoginFormCard({
  submitError = null,
  isSubmitting = false,
  onSubmit,
}: LoginFormCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-107.5">
      <Card className="rounded-4xl px-6 py-6 shadow-sm sm:px-7 sm:py-7">
        <Badge
          variant="info"
          className="gap-2 bg-blue-50 font-semibold uppercase tracking-[0.22em]"
        >
          <LockKeyhole className="h-4 w-4 text-blue-700" />
          Secure Login
        </Badge>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-[2.2rem]">
          Login
        </h1>

        <form
          id="sikemudi-login-form"
          name="login"
          className="mt-7 space-y-5"
          autoComplete="on"
          onSubmit={onSubmit}
        >
          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            inputMode="email"
            placeholder="contoh@sikemudi.com"
            leftIcon={<AtSign className="h-5 w-5" />}
            labelClassName="text-sm font-semibold text-slate-800"
            className={authInputClassName}
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
          />

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-800"
              >
                Kata Sandi
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-blue-700 transition hover:text-blue-800"
              >
                Lupa kata sandi?
              </Link>
            </div>

            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Masukkan kata sandi"
              leftIcon={<KeyRound className="h-5 w-5" />}
              rightIcon={
                showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )
              }
              rightIconAriaLabel={
                showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"
              }
              onRightIconClick={() => setShowPassword((current) => !current)}
              className={authInputClassName}
              autoComplete="current-password"
              spellCheck={false}
              required
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
            <input
              name="remember"
              type="checkbox"
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Ingat saya</span>
          </label>

          {submitError ? (
            <ErrorMessage
              title="Login gagal"
              message={submitError}
              className="rounded-3xl px-4 py-3.5"
            />
          ) : null}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={<LogIn className="h-4 w-4" />}
            className="h-12 rounded-2xl bg-slate-950 text-base font-bold tracking-wide text-white hover:bg-slate-800"
            loading={isSubmitting}
          >
            MASUK KE SISTEM
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-slate-600">
        Belum punya akun?{" "}
        <Link
          to="/register"
          className="font-semibold text-blue-700 transition hover:text-blue-800"
        >
          Daftar sebagai Peserta
        </Link>
      </p>
    </div>
  );
}
