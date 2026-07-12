import ErrorMessage from "@/components/feedback/ErrorMessage";
import SuccesBanner from "@/components/feedback/SuccesBanner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import LoginHeroPanel from "@/features/auth/components/login/LoginHeroPanel";
import LoginPageFooter from "@/features/auth/components/login/LoginPageFooter";
import {
  getPasswordStrengthError,
  PASSWORD_STRENGTH_HINT,
} from "@/features/auth/utils/passwordStrength";
import { getFriendlyApiErrorMessage } from "@/services/api";
import { resetPassword } from "@/services/auth.service";
import { ArrowLeft, KeyRound } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

function getErrorMessage(error: unknown): string {
  return getFriendlyApiErrorMessage(error, "Reset password gagal.");
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    if (!token) {
      setErrorMessage("Token reset password tidak ditemukan pada URL.");
      return;
    }

    const passwordError = getPasswordStrengthError(password, true);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (password !== passwordConfirmation) {
      setErrorMessage("Konfirmasi password tidak sesuai.");
      return;
    }

    try {
      setIsSubmitting(true);
      await resetPassword({
        email: email.trim(),
        token,
        password,
        password_confirmation: passwordConfirmation,
      });
      setPassword("");
      setPasswordConfirmation("");
      setSuccessMessage("Password berhasil direset. Silakan login memakai password baru.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <LoginHeroPanel />

        <section className="flex items-center justify-center px-6 py-6 sm:px-8 md:px-10">
          <Card className="w-full max-w-107.5 rounded-4xl px-6 py-6 shadow-sm sm:px-7 sm:py-7">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke login
            </Link>

            <div className="mt-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <KeyRound className="h-6 w-6" />
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              Reset Password
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Buat password baru untuk akun SIKEMUDI Anda.
            </p>

            <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-13 rounded-2xl bg-slate-50 text-base focus:bg-white"
                autoComplete="email"
                required
              />

              <Input
                label="Password Baru"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                hint={PASSWORD_STRENGTH_HINT}
                className="h-13 rounded-2xl bg-slate-50 text-base focus:bg-white"
                autoComplete="new-password"
                required
              />

              <Input
                label="Konfirmasi Password Baru"
                type="password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                className="h-13 rounded-2xl bg-slate-50 text-base focus:bg-white"
                autoComplete="new-password"
                required
              />

              {successMessage ? <SuccesBanner message={successMessage} /> : null}
              {errorMessage ? <ErrorMessage title="Reset gagal" message={errorMessage} /> : null}

              <Button
                type="submit"
                size="lg"
                fullWidth
                loading={isSubmitting}
                className="h-12 rounded-2xl bg-slate-950 text-base font-bold tracking-wide text-white hover:bg-slate-800"
              >
                SIMPAN PASSWORD BARU
              </Button>
            </form>
          </Card>
        </section>
      </div>

      <LoginPageFooter />
    </div>
  );
}
