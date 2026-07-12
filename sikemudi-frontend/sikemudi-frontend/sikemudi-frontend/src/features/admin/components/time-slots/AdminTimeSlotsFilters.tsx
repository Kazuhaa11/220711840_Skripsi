import Select from '@/components/ui/Select'
import AdminResponsiveFilterPanel from '@/features/admin/components/common/AdminResponsiveFilterPanel'
import { timeSlotStatusOptions } from '@/features/admin/constants/timeSlots'

interface AdminTimeSlotsFiltersProps {
  searchValue: string
  statusValue: string
  onSearchChange: (value: string) => void
  onStatusChange: (value: string) => void
}

export default function AdminTimeSlotsFilters({
  searchValue,
  statusValue,
  onSearchChange,
  onStatusChange,
}: AdminTimeSlotsFiltersProps) {
  return (
    <AdminResponsiveFilterPanel
      title="Filter Slot Waktu"
      description="Pilih status slot waktu."
      searchValue={searchValue}
      searchPlaceholder="Cari nama slot..."
      onSearchChange={onSearchChange}
      onSearchClear={() => onSearchChange("")}
      activeCount={statusValue !== "all" ? 1 : 0}
    >
      <Select
        value={statusValue}
        onChange={(event) => onStatusChange(event.target.value)}
        options={timeSlotStatusOptions}
        className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
      />
    </AdminResponsiveFilterPanel>
  )
}
