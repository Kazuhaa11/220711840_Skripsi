import Select from "@/components/ui/Select";
import AdminResponsiveFilterPanel from "@/features/admin/components/common/AdminResponsiveFilterPanel";
import {
  vehicleStatusOptions,
  vehicleTransmissionOptions,
} from "@/features/admin/constants/vehicles";

interface AdminVehiclesFiltersProps {
  searchValue: string;
  statusValue: string;
  transmissionValue: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTransmissionChange: (value: string) => void;
  onReset: () => void;
}

export default function AdminVehiclesFilters({
  searchValue,
  statusValue,
  transmissionValue,
  onSearchChange,
  onStatusChange,
  onTransmissionChange,
  onReset,
}: AdminVehiclesFiltersProps) {
  const activeCount =
    (statusValue !== "all" ? 1 : 0) + (transmissionValue !== "all" ? 1 : 0);

  return (
    <AdminResponsiveFilterPanel
      title="Filter Kendaraan"
      description="Atur status dan transmisi kendaraan."
      searchValue={searchValue}
      searchPlaceholder="Cari nama kendaraan / plat nomor..."
      onSearchChange={onSearchChange}
      onSearchClear={() => onSearchChange("")}
      activeCount={activeCount}
      onReset={onReset}
      bodyClassName="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          value={statusValue}
          onChange={(event) => onStatusChange(event.target.value)}
          options={vehicleStatusOptions}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />

        <Select
          value={transmissionValue}
          onChange={(event) => onTransmissionChange(event.target.value)}
          options={vehicleTransmissionOptions}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />
      </div>
    </AdminResponsiveFilterPanel>
  );
}
