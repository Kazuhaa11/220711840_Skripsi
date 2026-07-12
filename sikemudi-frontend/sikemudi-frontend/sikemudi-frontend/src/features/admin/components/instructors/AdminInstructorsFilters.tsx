import Select from "@/components/ui/Select";
import AdminResponsiveFilterPanel from "@/features/admin/components/common/AdminResponsiveFilterPanel";

const instructorSimpleStatusOptions = [
  { label: "Semua Status", value: "all" },
  { label: "Aktif", value: "Aktif" },
  { label: "Nonaktif", value: "Nonaktif" },
];

interface AdminInstructorsFiltersProps {
  searchValue: string;
  statusValue: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onReset: () => void;
}

export default function AdminInstructorsFilters({
  searchValue,
  statusValue,
  onSearchChange,
  onStatusChange,
  onReset,
}: AdminInstructorsFiltersProps) {
  return (
    <AdminResponsiveFilterPanel
      title="Filter Instruktur"
      description="Pilih status instruktur."
      searchValue={searchValue}
      searchPlaceholder="Cari nama, email, telepon, spesialisasi, atau status..."
      onSearchChange={onSearchChange}
      onSearchClear={() => onSearchChange("")}
      activeCount={statusValue !== "all" ? 1 : 0}
      onReset={onReset}
    >
      <Select
        value={statusValue}
        onChange={(event) => onStatusChange(event.target.value)}
        options={instructorSimpleStatusOptions}
        className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
      />
    </AdminResponsiveFilterPanel>
  );
}
