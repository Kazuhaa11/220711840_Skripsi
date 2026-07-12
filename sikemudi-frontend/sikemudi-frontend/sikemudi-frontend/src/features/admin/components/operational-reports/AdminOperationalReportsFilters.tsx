import { CalendarDays } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import AdminResponsiveFilterPanel from "@/features/admin/components/common/AdminResponsiveFilterPanel";
import type { AdminReportFilterValues } from "@/features/admin/constants/operationalReports";
import {
  periodTypeOptions,
  reportPaymentMethodOptions,
  reportStatusOptions,
} from "@/features/admin/constants/operationalReports";

interface FilterOption {
  label: string;
  value: string;
}

interface AdminOperationalReportsFiltersProps {
  values: AdminReportFilterValues;
  instructorOptions: FilterOption[];
  packageOptions: FilterOption[];
  isLoading?: boolean;
  onChange: (field: keyof AdminReportFilterValues, value: string) => void;
  onReset: () => void;
  onApply: () => void;
}

const inputClassName =
  "h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl";
const labelClassName =
  "text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400";

export default function AdminOperationalReportsFilters({
  values,
  instructorOptions,
  packageOptions,
  isLoading = false,
  onChange,
  onReset,
  onApply,
}: AdminOperationalReportsFiltersProps) {
  void isLoading;

  const activeCount = [
    values.startDate,
    values.endDate,
    values.periodType !== "monthly" ? values.periodType : "",
    values.status !== "all" ? values.status : "",
    values.instructor !== "all" ? values.instructor : "",
    values.packageName !== "all" ? values.packageName : "",
    values.paymentMethod !== "all" ? values.paymentMethod : "",
  ].filter(Boolean).length;

  return (
    <AdminResponsiveFilterPanel
      title="Filter Laporan"
      description="Atur periode, status, instruktur, paket, dan metode pembayaran."
      searchValue={values.search}
      searchPlaceholder="Cari kode, peserta, instruktur, kendaraan, atau paket..."
      onSearchChange={(value) => onChange("search", value)}
      onSearchClear={() => onChange("search", "")}
      activeCount={activeCount}
      onReset={onReset}
      onApply={onApply}
      bodyClassName="space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className={labelClassName}>Tanggal Awal</p>
          <Input
            type="date"
            value={values.startDate}
            onChange={(event) => onChange("startDate", event.target.value)}
            leftIcon={<CalendarDays className="h-4 w-4" />}
            className={`mt-2 ${inputClassName}`}
          />
        </div>

        <div>
          <p className={labelClassName}>Tanggal Akhir</p>
          <Input
            type="date"
            value={values.endDate}
            onChange={(event) => onChange("endDate", event.target.value)}
            className={`mt-2 ${inputClassName}`}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className={labelClassName}>Periode</p>
          <Select
            value={values.periodType}
            onChange={(event) => onChange("periodType", event.target.value)}
            options={periodTypeOptions}
            className={`mt-2 ${inputClassName}`}
          />
        </div>

        <div>
          <p className={labelClassName}>Status</p>
          <Select
            value={values.status}
            onChange={(event) => onChange("status", event.target.value)}
            options={reportStatusOptions}
            className={`mt-2 ${inputClassName}`}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className={labelClassName}>Instruktur</p>
          <Select
            value={values.instructor}
            onChange={(event) => onChange("instructor", event.target.value)}
            options={instructorOptions}
            className={`mt-2 ${inputClassName}`}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <p className={labelClassName}>Paket</p>
          <Select
            value={values.packageName}
            onChange={(event) => onChange("packageName", event.target.value)}
            options={packageOptions}
            className={`mt-2 ${inputClassName}`}
          />
        </div>

        <div>
          <p className={labelClassName}>Metode Bayar</p>
          <Select
            value={values.paymentMethod}
            onChange={(event) => onChange("paymentMethod", event.target.value)}
            options={reportPaymentMethodOptions}
            className={`mt-2 ${inputClassName}`}
          />
        </div>
      </div>
    </AdminResponsiveFilterPanel>
  );
}
