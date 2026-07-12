import ActiveParticipantsCard from "@/features/instructor/components/dashboard/ActiveParticipantsCard";
import InstructorDashboardHeader from "@/features/instructor/components/dashboard/InstructorDashboardHeader";
import InstructorDashboardStats from "@/features/instructor/components/dashboard/InstructorDashboardStats";
import {
  QuickAccessCard,
  TaskReminderCard,
} from "@/features/instructor/components/dashboard/InstructorDashboardSideCards";
import NextSessionCard from "@/features/instructor/components/dashboard/NextSessionCard";
import TodayScheduleCard from "@/features/instructor/components/dashboard/TodayScheduleCard";
import type { InstructorDashboardData } from "@/types/dashboard";

interface InstructorDashboardViewProps {
  dashboard: InstructorDashboardData;
}

export default function InstructorDashboardView({
  dashboard,
}: InstructorDashboardViewProps) {
  return (
    <div className="mx-auto w-full max-w-295">
      <InstructorDashboardHeader />

      <div className="mt-6">
        <InstructorDashboardStats summaryCards={dashboard.summary_cards} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <TodayScheduleCard schedules={dashboard.jadwal_hari_ini} />
          <ActiveParticipantsCard
            activeParticipants={dashboard.peserta_sesi_aktif}
          />
        </div>

        <aside className="space-y-6">
          <NextSessionCard session={dashboard.sesi_berikutnya} />
          <TaskReminderCard reminders={dashboard.tugas_pengingat} />
          <QuickAccessCard />
        </aside>
      </div>
    </div>
  );
}
