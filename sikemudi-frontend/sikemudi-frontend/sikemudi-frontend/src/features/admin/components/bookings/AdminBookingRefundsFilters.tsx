import Select from "@/components/ui/Select";
import AdminResponsiveFilterPanel from "@/features/admin/components/common/AdminResponsiveFilterPanel";

const refundStatusOptions = [
  { label: "Semua Status Refund", value: "all" },
  { label: "Diajukan", value: "Diajukan" },
  { label: "Diproses", value: "Diproses" },
  { label: "Selesai", value: "Selesai" },
  { label: "Ditolak", value: "Ditolak" },
];

const paymentStatusOptions = [
  { label: "Semua Status Bayar", value: "all" },
  { label: "Menunggu Konfirmasi", value: "Menunggu Konfirmasi" },
  { label: "Terkonfirmasi", value: "Terkonfirmasi" },
  { label: "Ditolak", value: "Ditolak" },
];

interface AdminBookingRefundsFiltersProps {
  searchValue: string;
  refundStatus: string;
  paymentStatus: string;
  onSearchChange: (value: string) => void;
  onRefundStatusChange: (value: string) => void;
  onPaymentStatusChange: (value: string) => void;
  onReset: () => void;
}

export default function AdminBookingRefundsFilters({
  searchValue,
  refundStatus,
  paymentStatus,
  onSearchChange,
  onRefundStatusChange,
  onPaymentStatusChange,
  onReset,
}: AdminBookingRefundsFiltersProps) {
  return (
    <AdminResponsiveFilterPanel
      title="Filter Refund"
      description="Atur status refund dan status pembayaran."
      activeCount={Number(refundStatus !== "all") + Number(paymentStatus !== "all")}
      onReset={onReset}
      searchValue={searchValue}
      searchPlaceholder="Cari kode booking, peserta, paket, bank, nomor rekening..."
      onSearchChange={onSearchChange}
      onSearchClear={() => onSearchChange("")}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          value={refundStatus}
          onChange={(event) => onRefundStatusChange(event.target.value)}
          options={refundStatusOptions}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />

        <Select
          value={paymentStatus}
          onChange={(event) => onPaymentStatusChange(event.target.value)}
          options={paymentStatusOptions}
          className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
        />
      </div>
    </AdminResponsiveFilterPanel>
  );
}
