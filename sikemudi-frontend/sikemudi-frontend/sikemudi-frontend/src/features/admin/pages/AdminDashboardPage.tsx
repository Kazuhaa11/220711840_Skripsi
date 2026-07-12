import { useEffect, useState } from "react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import Button from "@/components/ui/Button";
import AdminDashboardView from "@/features/admin/components/dashboard/AdminDashboardView";
import { getAdminDashboard } from "@/services/dashboard.service";
import type { AdminDashboardData } from "@/types/dashboard";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadDashboard() {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await getAdminDashboard();
      setDashboard(data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Dashboard admin gagal dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  if (isLoading) {
    return <LoadingSpinner label="Memuat dashboard admin..." />;
  }

  if (errorMessage || !dashboard) {
    return (
      <ErrorMessage
        title="Dashboard admin gagal dimuat"
        message={errorMessage ?? "Data dashboard admin tidak ditemukan."}
        action={<Button onClick={() => void loadDashboard()}>Coba Lagi</Button>}
      />
    );
  }

  return <AdminDashboardView dashboard={dashboard} />;
}
