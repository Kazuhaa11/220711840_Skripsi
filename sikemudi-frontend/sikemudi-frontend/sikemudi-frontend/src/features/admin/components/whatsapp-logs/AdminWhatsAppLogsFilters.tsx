import { CalendarDays } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import AdminResponsiveFilterPanel from "@/features/admin/components/common/AdminResponsiveFilterPanel";
import type { AdminWhatsAppLogFilterOptions } from "@/types/adminWhatsAppLog";

interface AdminWhatsAppLogsFiltersProps {
  searchValue: string;
  status: string;
  eventType: string;
  startDate: string;
  endDate: string;
  filterOptions: AdminWhatsAppLogFilterOptions;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onEventTypeChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
}

export default function AdminWhatsAppLogsFilters({
  searchValue,
  status,
  eventType,
  startDate,
  endDate,
  filterOptions,
  onSearchChange,
  onStatusChange,
  onEventTypeChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}: AdminWhatsAppLogsFiltersProps) {
  const activeCount = [
    searchValue.trim(),
    status !== "all" ? status : "",
    eventType !== "all" ? eventType : "",
    startDate,
    endDate,
  ].filter(Boolean).length;

  const inputClassName =
    "h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl";
  const labelClassName =
    "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400";

  return (
    <AdminResponsiveFilterPanel
      title="Filter Log WhatsApp"
      description="Atur status, event, dan rentang tanggal pengiriman notifikasi."
      searchValue={searchValue}
      searchPlaceholder="Cari nomor, event, isi pesan, error, atau key..."
      onSearchChange={onSearchChange}
      onSearchClear={() => onSearchChange("")}
      activeCount={activeCount}
      onReset={onReset}
      bodyClassName="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className={labelClassName}>Status</p>
          <Select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            options={filterOptions.statuses}
            className={`mt-2 ${inputClassName}`}
          />
        </div>

        <div>
          <p className={labelClassName}>Event</p>
          <Select
            value={eventType}
            onChange={(event) => onEventTypeChange(event.target.value)}
            options={filterOptions.event_types}
            className={`mt-2 ${inputClassName}`}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className={labelClassName}>Tanggal Awal</p>
          <Input
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
            leftIcon={<CalendarDays className="h-4 w-4" />}
            className={`mt-2 ${inputClassName}`}
          />
        </div>

        <div>
          <p className={labelClassName}>Tanggal Akhir</p>
          <Input
            type="date"
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
            className={`mt-2 ${inputClassName}`}
          />
        </div>
      </div>
    </AdminResponsiveFilterPanel>
  );
}
