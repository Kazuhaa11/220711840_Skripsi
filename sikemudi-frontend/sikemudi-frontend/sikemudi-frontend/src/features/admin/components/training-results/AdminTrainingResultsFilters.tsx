import { CalendarDays } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import AdminResponsiveFilterPanel from "@/features/admin/components/common/AdminResponsiveFilterPanel";
import {
  trainingResultAttendanceOptions,
  trainingResultInstructorOptions,
  trainingResultWorkflowOptions,
} from "@/features/admin/constants/trainingResults";

interface AdminTrainingResultsFiltersProps {
  searchValue: string;
  dateValue: string;
  instructorValue: string;
  attendanceValue: string;
  workflowValue: string;
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onInstructorChange: (value: string) => void;
  onAttendanceChange: (value: string) => void;
  onWorkflowChange: (value: string) => void;
  onReset: () => void;
}

export default function AdminTrainingResultsFilters({
  searchValue,
  dateValue,
  instructorValue,
  attendanceValue,
  workflowValue,
  onSearchChange,
  onDateChange,
  onInstructorChange,
  onAttendanceChange,
  onWorkflowChange,
  onReset,
}: AdminTrainingResultsFiltersProps) {
  const activeCount = [
    dateValue,
    instructorValue !== "all" ? instructorValue : "",
    attendanceValue !== "all" ? attendanceValue : "",
    workflowValue !== "all" ? workflowValue : "",
  ].filter(Boolean).length;

  return (
    <AdminResponsiveFilterPanel
      title="Filter Hasil Latihan"
      description="Atur tanggal, instruktur, kehadiran, dan status validasi."
      searchValue={searchValue}
      searchPlaceholder="Cari nama peserta atau ID..."
      onSearchChange={onSearchChange}
      onSearchClear={() => onSearchChange("")}
      activeCount={activeCount}
      onReset={onReset}
      bodyClassName="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          type="date"
          value={dateValue}
          onChange={(event) => onDateChange(event.target.value)}
          leftIcon={<CalendarDays className="h-4 w-4" />}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />

        <Select
          value={instructorValue}
          onChange={(event) => onInstructorChange(event.target.value)}
          options={trainingResultInstructorOptions}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          value={attendanceValue}
          onChange={(event) => onAttendanceChange(event.target.value)}
          options={trainingResultAttendanceOptions}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />

        <Select
          value={workflowValue}
          onChange={(event) => onWorkflowChange(event.target.value)}
          options={trainingResultWorkflowOptions}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />
      </div>
    </AdminResponsiveFilterPanel>
  );
}
