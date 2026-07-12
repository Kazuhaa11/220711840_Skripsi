import { CalendarDays } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import AdminResponsiveFilterPanel from "@/features/admin/components/common/AdminResponsiveFilterPanel";

interface FilterOption {
  label: string;
  value: string;
}

interface AdminTrainingSchedulesFiltersProps {
  searchValue: string;
  dateValue: string;
  coursePackageValue: string;
  statusValue: string;
  coursePackageOptions: FilterOption[];
  onSearchChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onCoursePackageChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

const schedulePackageStatusOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Menunggu Pembayaran", value: "Menunggu Pembayaran" },
  {
    label: "Menunggu Konfirmasi Pembayaran",
    value: "Menunggu Konfirmasi Pembayaran",
  },
  { label: "Dikonfirmasi", value: "Dikonfirmasi" },
  { label: "Dijadwalkan Ulang", value: "Dijadwalkan Ulang" },
  { label: "Selesai", value: "Selesai" },
  { label: "Dibatalkan", value: "Dibatalkan" },
];

export default function AdminTrainingSchedulesFilters({
  searchValue,
  dateValue,
  coursePackageValue,
  statusValue,
  coursePackageOptions,
  onSearchChange,
  onDateChange,
  onCoursePackageChange,
  onStatusChange,
  onReset,
}: AdminTrainingSchedulesFiltersProps) {
  const activeCount =
    (dateValue ? 1 : 0) +
    (coursePackageValue !== "all" ? 1 : 0) +
    (statusValue !== "all" ? 1 : 0);

  return (
    <AdminResponsiveFilterPanel
      title="Filter Jadwal Latihan"
      description="Atur tanggal, paket kursus, dan status booking."
      searchValue={searchValue}
      searchPlaceholder="Cari booking, peserta, paket, instruktur, atau kendaraan..."
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
          value={coursePackageValue}
          onChange={(event) => onCoursePackageChange(event.target.value)}
          options={coursePackageOptions}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          value={statusValue}
          onChange={(event) => onStatusChange(event.target.value)}
          options={schedulePackageStatusOptions}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />
      </div>
    </AdminResponsiveFilterPanel>
  );
}
