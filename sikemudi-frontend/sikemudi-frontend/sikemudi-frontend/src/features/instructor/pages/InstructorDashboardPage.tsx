import { useEffect, useState } from "react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import Button from "@/components/ui/Button";
import InstructorDashboardView from "@/features/instructor/components/dashboard/InstructorDashboardView";
import { getInstructorDashboard } from "@/services/dashboard.service";
import type { InstructorDashboardData } from "@/types/dashboard";

export default function InstructorDashboardPage() {
  const [dashboard, setDashboard] = useState<InstructorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getInstructorDashboard();
      setDashboard(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Dashboard instruktur gagal dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner label="Memuat dashboard instruktur..." />;
  }

  if (errorMessage || !dashboard) {
    return (
      <ErrorMessage
        title="Dashboard instruktur gagal dimuat"
        message={errorMessage ?? "Data dashboard instruktur tidak ditemukan."}
        action={<Button onClick={() => void loadDashboard()}>Coba Lagi</Button>}
      />
    );
  }

  return <InstructorDashboardView dashboard={dashboard} />;
}
