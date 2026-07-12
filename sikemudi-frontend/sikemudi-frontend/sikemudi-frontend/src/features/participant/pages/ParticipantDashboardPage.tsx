import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AccountInfoCard from "@/features/participant/components/dashboard/AccountInfoCard";
import AvailableScheduleSection from "@/features/participant/components/dashboard/AvailableScheduleSection";
import BookingHistorySection from "@/features/participant/components/dashboard/BookingHistorySection";
import CertificateProgressCard from "@/features/participant/components/dashboard/CertificateProgressCard";
import DashboardHeader from "@/features/participant/components/dashboard/DashboardHeader";
import DashboardStats from "@/features/participant/components/dashboard/DashboardStats";
import NearestSessionCard from "@/features/participant/components/dashboard/NearestSessionCard";
import { getParticipantDashboard } from "@/services/dashboard.service";
import type { ParticipantDashboardData } from "@/types/dashboard";

export default function ParticipantDashboardPage() {
  const [dashboard, setDashboard] = useState<ParticipantDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getParticipantDashboard();
      setDashboard(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Dashboard peserta gagal dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner label="Memuat dashboard peserta..." />;
  }

  if (errorMessage || !dashboard) {
    return (
      <ErrorMessage
        title="Dashboard peserta gagal dimuat"
        message={errorMessage ?? "Data dashboard peserta tidak ditemukan."}
        action={<Button onClick={() => void loadDashboard()}>Coba Lagi</Button>}
      />
    );
  }

  return (
    <div className="overflow-x-hidden bg-slate-100 px-3 py-4 sm:px-6 sm:py-6 md:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-375 overflow-x-hidden">
        <DashboardHeader profile={dashboard.profile} />

        <div className="mt-5 sm:mt-8">
          <DashboardStats summaryCards={dashboard.summary_cards} />
        </div>

        <div className="mt-6 grid gap-5 sm:mt-8 sm:gap-6 xl:grid-cols-[minmax(0,1.55fr)_340px]">
          <div className="space-y-5 sm:space-y-6">
            <section>
              <h3 className="text-base font-bold uppercase tracking-[0.16em] text-slate-800 sm:text-2xl sm:tracking-[0.2em]">
                Jadwal Aktif Terdekat
              </h3>

              <div className="mt-3 sm:mt-5">
                <NearestSessionCard booking={dashboard.jadwal_aktif_terdekat} />
              </div>
            </section>

            <AvailableScheduleSection
              schedules={dashboard.jadwal_tersedia.items}
              hasActivePackage={Boolean(dashboard.jadwal_tersedia.course_package_id)}
            />
            <BookingHistorySection histories={dashboard.riwayat_booking_terbaru} />
          </div>

          <div className="space-y-5 sm:space-y-6">
            <CertificateProgressCard certificate={dashboard.sertifikat_digital} />
            <AccountInfoCard accountInfo={dashboard.informasi_akun} />
          </div>
        </div>

        <div className="mt-5 xl:hidden">
          <Card className="rounded-2xl px-3 py-3 sm:rounded-3xl sm:px-5 sm:py-5">
            <NavLink to="/peserta/jadwal-tersedia">
              <Button fullWidth className="h-11 rounded-2xl text-sm">
                BOOKING SESI LATIHAN
              </Button>
            </NavLink>
          </Card>
        </div>
      </div>
    </div>
  );
}
