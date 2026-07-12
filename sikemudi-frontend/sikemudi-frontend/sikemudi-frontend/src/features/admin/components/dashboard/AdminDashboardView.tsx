import AdminDashboardHeader from "@/features/admin/components/dashboard/AdminDashboardHeader";
import AdminDashboardStats from "@/features/admin/components/dashboard/AdminDashboardStats";
import AdminRecentBookingsCard from "@/features/admin/components/dashboard/AdminRecentBookingsCard";
import AdminTodayScheduleCard from "@/features/admin/components/dashboard/AdminTodayScheduleCard";
import type { AdminDashboardData } from "@/types/dashboard";

interface AdminDashboardViewProps {
  dashboard: AdminDashboardData;
}

export default function AdminDashboardView({ dashboard }: AdminDashboardViewProps) {
  return (
    <div className="mx-auto w-full max-w-295">
      <AdminDashboardHeader />

      <div className="mt-5">
        <AdminDashboardStats summaryCards={dashboard.summary_cards} />
      </div>

      <div className="mt-5 space-y-6">
        <AdminTodayScheduleCard
          dateLabel={dashboard.tanggal_hari_ini_label}
          schedules={dashboard.jadwal_hari_ini}
        />
        <AdminRecentBookingsCard
          bookings={dashboard.aktivitas_booking_terbaru}
        />
      </div>
    </div>
  );
}
