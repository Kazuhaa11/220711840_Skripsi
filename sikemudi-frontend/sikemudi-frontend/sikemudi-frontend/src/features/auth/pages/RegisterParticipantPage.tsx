import { getFriendlyApiErrorMessage } from "@/services/api";
import RegisterFormCard from "@/features/auth/components/register/RegisterFormCard";
import RegisterHeroPanel from "@/features/auth/components/register/RegisterHeroPanel";
import LoginPageFooter from "@/features/auth/components/login/LoginPageFooter";
import { useAuth } from "@/features/auth/context/AuthContext";
import { getPasswordStrengthError } from "@/features/auth/utils/passwordStrength";
import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterParticipantPage() {
  const navigate = useNavigate();
  const { registerParticipant } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const noTelepon = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const passwordConfirmation = String(
      formData.get("passwordConfirmation") ?? "",
    );

    const passwordError = getPasswordStrengthError(password, true);
    if (passwordError) {
      setSubmitError(passwordError);
      setIsSubmitting(false);
      return;
    }

    if (password !== passwordConfirmation) {
      setSubmitError("Konfirmasi password tidak sesuai.");
      setIsSubmitting(false);
      return;
    }

    try {
      await registerParticipant({
        name,
        email,
        no_telepon: noTelepon,
        password,
        password_confirmation: passwordConfirmation,
      });

      navigate("/register/success", { replace: true });
    } catch (error) {
      setSubmitError(getFriendlyApiErrorMessage(error, "Terjadi kesalahan saat proses registrasi."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto grid min-h-[calc(100vh-72px)] max-w-400 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
        <RegisterHeroPanel />

        <section className="flex items-center justify-center px-6 py-8 sm:px-8 md:px-10">
          <RegisterFormCard
            submitError={submitError}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </section>
      </div>

      <LoginPageFooter />
    </div>
  );
}
