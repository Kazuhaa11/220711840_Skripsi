import { CalendarDays, List } from "lucide-react";
import DataTabs, { type DataTabItem } from "@/components/common/DataTabs";
import PageHeader from "@/components/common/PageHeader";
import { adminTrainingScheduleHeader } from "@/features/admin/constants/trainingSchedules";

type TrainingScheduleViewMode = "table" | "calendar";

interface AdminTrainingSchedulesHeaderProps {
  viewMode: TrainingScheduleViewMode;
  onViewModeChange: (mode: TrainingScheduleViewMode) => void;
}

const trainingScheduleViewTabs: DataTabItem<TrainingScheduleViewMode>[] = [
  {
    id: "table",
    label: "Tampilan Tabel",
    icon: List,
  },
  {
    id: "calendar",
    label: "Tampilan Kalender",
    icon: CalendarDays,
  },
];

export default function AdminTrainingSchedulesHeader({
  viewMode,
  onViewModeChange,
}: AdminTrainingSchedulesHeaderProps) {
  return (
    <PageHeader
      className="mb-0 xl:items-end"
      contentClassName="max-w-3xl"
      eyebrow={adminTrainingScheduleHeader.eyebrow}
      title={adminTrainingScheduleHeader.title}
      description="Pantau jadwal latihan berdasarkan booking paket. Satu baris mewakili satu booking paket, sedangkan daftar sesi dapat dilihat melalui halaman detail."
      actions={
        <DataTabs
          variant="segmented"
          tabs={trainingScheduleViewTabs}
          activeTab={viewMode}
          onChange={onViewModeChange}
          listClassName="min-w-0 grid-flow-row grid-cols-2"
        />
      }
    />
  );
}
