import SearchInput from "@/components/common/SearchInput";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { certificateStatusOptions } from "@/features/admin/constants/certificates";

interface AdminCertificatesFiltersProps {
  searchValue: string;
  statusValue: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export default function AdminCertificatesFilters({
  searchValue,
  statusValue,
  onSearchChange,
  onStatusChange,
}: AdminCertificatesFiltersProps) {
  return (
    <Card className="rounded-3xl border-0 bg-slate-100/80 p-3 shadow-none sm:p-5">
      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_200px]">
        <SearchInput
          value={searchValue}
          placeholder="Cari nama peserta, nomor sertifikat, kode verifikasi, paket, atau status..."
          onChange={(event) => onSearchChange(event.target.value)}
          onClear={() => onSearchChange("")}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />

        <Select
          value={statusValue}
          onChange={(event) => onStatusChange(event.target.value)}
          options={certificateStatusOptions}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />
      </div>
    </Card>
  );
}
