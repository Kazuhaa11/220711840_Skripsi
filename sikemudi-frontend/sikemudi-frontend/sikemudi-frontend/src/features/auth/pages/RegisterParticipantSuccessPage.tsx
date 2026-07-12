import Card from "@/components/ui/Card";
import LoginPageFooter from "@/features/auth/components/login/LoginPageFooter";
import RegisterSuccessContentCard from "@/features/auth/components/register/RegisterSuccessContentCard";
import RegisterSuccessVisualPanel from "@/features/auth/components/register/RegisterSuccessVisualPanel";

export default function RegisterParticipantSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center px-6 py-10 sm:px-8 md:px-10">
        <Card className="grid w-full overflow-hidden rounded-4xl p-0 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="min-h-80 lg:min-h-160">
            <RegisterSuccessVisualPanel />
          </div>

          <RegisterSuccessContentCard />
        </Card>
      </div>

      <LoginPageFooter />
    </div>
  );
}
