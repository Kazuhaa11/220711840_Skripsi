import Select, { type SelectOption } from "@/components/ui/Select";
import AdminResponsiveFilterPanel from "@/features/admin/components/common/AdminResponsiveFilterPanel";
import {
  participantPackageOptions,
  participantStatusOptions,
} from "@/features/admin/constants/participants";

interface AdminParticipantsFiltersProps {
  searchValue: string;
  statusValue: string;
  packageValue: string;
  packageOptions?: SelectOption[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPackageChange: (value: string) => void;
  onReset: () => void;
}

export default function AdminParticipantsFilters({
  searchValue,
  statusValue,
  packageValue,
  packageOptions = participantPackageOptions,
  onSearchChange,
  onStatusChange,
  onPackageChange,
  onReset,
}: AdminParticipantsFiltersProps) {
  const activeCount =
    (statusValue !== "all" ? 1 : 0) + (packageValue !== "all" ? 1 : 0);

  return (
    <AdminResponsiveFilterPanel
      title="Filter Peserta"
      description="Atur status akun dan paket aktif peserta."
      searchValue={searchValue}
      searchPlaceholder="Cari nama, email, nomor telepon, atau ID peserta..."
      onSearchChange={onSearchChange}
      onSearchClear={() => onSearchChange("")}
      activeCount={activeCount}
      onReset={onReset}
      bodyClassName="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Status Akun
          </p>

          <Select
            value={statusValue}
            onChange={(event) => onStatusChange(event.target.value)}
            options={participantStatusOptions}
            className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
          />
        </div>

        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
            Paket Aktif
          </p>

          <Select
            value={packageValue}
            onChange={(event) => onPackageChange(event.target.value)}
            options={packageOptions}
            className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
          />
        </div>
      </div>
    </AdminResponsiveFilterPanel>
  );
}
