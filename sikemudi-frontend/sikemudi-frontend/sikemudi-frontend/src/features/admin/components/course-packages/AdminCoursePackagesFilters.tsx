import Select from "@/components/ui/Select";
import AdminResponsiveFilterPanel from "@/features/admin/components/common/AdminResponsiveFilterPanel";

const coursePackageStatusFilterOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Aktif", value: "Aktif" },
  { label: "Nonaktif", value: "Nonaktif" },
];

interface AdminCoursePackagesFiltersProps {
  searchValue: string;
  statusValue: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

export default function AdminCoursePackagesFilters({
  searchValue,
  statusValue,
  onSearchChange,
  onStatusChange,
  onReset,
}: AdminCoursePackagesFiltersProps) {
  return (
    <AdminResponsiveFilterPanel
      title="Filter Paket Kursus"
      description="Pilih status paket kursus."
      searchValue={searchValue}
      searchPlaceholder="Cari nama paket, kode, durasi, atau status..."
      onSearchChange={onSearchChange}
      onSearchClear={() => onSearchChange("")}
      activeCount={statusValue !== "all" ? 1 : 0}
      onReset={onReset}
    >
      <Select
        value={statusValue}
        onChange={(event) => onStatusChange(event.target.value)}
        options={coursePackageStatusFilterOptions}
        className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
      />
    </AdminResponsiveFilterPanel>
  );
}
