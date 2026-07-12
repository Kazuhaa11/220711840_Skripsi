import { RefreshCcw } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";

interface AdminBookingsHeaderProps {
  onRefresh: () => void;
  loading?: boolean;
}

export default function AdminBookingsHeader({
  onRefresh,
  loading = false,
}: AdminBookingsHeaderProps) {
  return (
    <PageHeader
      eyebrow="Manajemen Booking"
      title="Booking Peserta"
      description="Pantau booking peserta, cek bukti pembayaran, konfirmasi atau tolak pembayaran, ubah jadwal, dan batalkan booking jika diperlukan."
      actions={
        <Button
          variant="outline"
          onClick={onRefresh}
          loading={loading}
          leftIcon={<RefreshCcw className="h-4 w-4" />}
          className="rounded-2xl"
        >
          Refresh Data
        </Button>
      }
    >
    </PageHeader>
  );
}
