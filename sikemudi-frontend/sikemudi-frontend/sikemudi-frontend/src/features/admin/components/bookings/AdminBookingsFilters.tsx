import Select from "@/components/ui/Select";
import AdminResponsiveFilterPanel from "@/features/admin/components/common/AdminResponsiveFilterPanel";

const bookingStatusOptions = [
  { label: "Semua Status Booking", value: "all" },
  { label: "Menunggu Pembayaran", value: "Menunggu Pembayaran" },
  { label: "Menunggu Konfirmasi", value: "Menunggu Konfirmasi Pembayaran" },
  { label: "Dikonfirmasi", value: "Dikonfirmasi" },
  { label: "Dijadwalkan Ulang", value: "Dijadwalkan Ulang" },
  { label: "Selesai", value: "Selesai" },
  { label: "Dibatalkan", value: "Dibatalkan" },
];

const paymentStatusOptions = [
  { label: "Semua Status Bayar", value: "all" },
  { label: "Belum Upload", value: "Belum Upload" },
  { label: "Menunggu Konfirmasi", value: "Menunggu Konfirmasi" },
  { label: "Terkonfirmasi", value: "Terkonfirmasi" },
  { label: "Ditolak", value: "Ditolak" },
];

const paymentMethodOptions = [
  { label: "Semua Metode Bayar", value: "all" },
  { label: "Transfer Bank", value: "Transfer" },
  { label: "Cash", value: "Cash" },
];

interface AdminBookingsFiltersProps {
  searchValue: string;
  bookingStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  onSearchChange: (value: string) => void;
  onBookingStatusChange: (value: string) => void;
  onPaymentStatusChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onReset: () => void;
}

export default function AdminBookingsFilters({
  searchValue,
  bookingStatus,
  paymentStatus,
  paymentMethod,
  onSearchChange,
  onBookingStatusChange,
  onPaymentStatusChange,
  onPaymentMethodChange,
  onReset,
}: AdminBookingsFiltersProps) {
  return (
    <AdminResponsiveFilterPanel
      title="Filter Booking"
      description="Atur pencarian, status booking, status bayar, dan metode pembayaran."
      activeCount={Number(bookingStatus !== "all") + Number(paymentStatus !== "all") + Number(paymentMethod !== "all") + Number(Boolean(searchValue.trim()))}
      onReset={onReset}
      searchValue={searchValue}
      searchPlaceholder="Cari kode booking, peserta, paket, instruktur, kendaraan..."
      onSearchChange={onSearchChange}
      onSearchClear={() => onSearchChange("")}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Select
          value={bookingStatus}
          onChange={(event) => onBookingStatusChange(event.target.value)}
          options={bookingStatusOptions}
          className="h-10 rounded-xl text-sm"
        />

        <Select
          value={paymentStatus}
          onChange={(event) => onPaymentStatusChange(event.target.value)}
          options={paymentStatusOptions}
          className="h-10 rounded-xl text-sm"
        />

        <Select
          value={paymentMethod}
          onChange={(event) => onPaymentMethodChange(event.target.value)}
          options={paymentMethodOptions}
          className="h-10 rounded-xl text-sm"
        />
      </div>
    </AdminResponsiveFilterPanel>
  );
}
