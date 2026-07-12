import { getFriendlyApiErrorMessage } from "@/services/api";
import LoginFormCard from "@/features/auth/components/login/LoginFormCard";
import LoginHeroPanel from "@/features/auth/components/login/LoginHeroPanel";
import LoginPageFooter from "@/features/auth/components/login/LoginPageFooter";
import { getRoleDashboardPath, useAuth } from "@/features/auth/context/AuthContext";
import type { FormEvent } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface LocationState {
  from?: {
    pathname?: string;
  };
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(() => {
    const authNotice = sessionStorage.getItem("sikemudi_auth_notice");

    if (authNotice) {
      sessionStorage.removeItem("sikemudi_auth_notice");
      return authNotice;
    }

    return null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const user = await login({ email, password });
      const state = location.state as LocationState | null;
      const redirectPath = state?.from?.pathname ?? getRoleDashboardPath(user.role?.slug);

      navigate(redirectPath, { replace: true });
    } catch (error) {
      setSubmitError(getFriendlyApiErrorMessage(error, "Terjadi kesalahan saat login."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
        <LoginHeroPanel />

        <section className="flex items-center justify-center px-6 py-6 sm:px-8 md:px-10">
          <LoginFormCard
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
