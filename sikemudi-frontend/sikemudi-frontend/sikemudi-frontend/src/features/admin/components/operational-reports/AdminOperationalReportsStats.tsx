import { Banknote, CalendarCheck, ClipboardCheck, TrendingDown, TrendingUp } from "lucide-react";
import StatsGrid from "@/components/common/StatsGrid";
import type { AdminOperationalReportSummaryStats } from "@/types/adminOperationalReport";
import { adminOperationalReportStats } from "@/features/admin/constants/operationalReports";

interface AdminOperationalReportsStatsProps {
  stats?: AdminOperationalReportSummaryStats;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminOperationalReportsStats({
  stats,
}: AdminOperationalReportsStatsProps) {
  if (!stats) {
    return <StatsGrid items={adminOperationalReportStats} />;
  }

  return (
    <StatsGrid
      items={[
        {
          id: "gross-revenue",
          label: "Pendapatan Masuk",
          value: formatCurrency(stats.grossRevenue),
          description: "Pembayaran terkonfirmasi",
          icon: Banknote,
          tone: "green",
        },
        {
          id: "active-booking",
          label: "Booking Aktif",
          value: `${stats.activeBookings} Paket`,
          description: "Dikonfirmasi dan berjalan",
          icon: CalendarCheck,
          tone: "blue",
        },
        {
          id: "finished-session",
          label: "Sesi Selesai",
          value: `${stats.finishedSessions} Sesi`,
          description: "Akumulasi periode aktif",
          icon: ClipboardCheck,
          tone: "slate",
        },
        {
          id: "refund-amount",
          label: "Refund Selesai",
          value: formatCurrency(stats.refundAmount),
          description: "Mengurangi pendapatan bersih",
          icon: TrendingDown,
          tone: "amber",
        },
        {
          id: "net-revenue",
          label: "Pendapatan Bersih",
          value: formatCurrency(stats.netRevenue),
          description: "Transfer dan cash terkonfirmasi",
          icon: TrendingUp,
          tone: "emerald",
        },
      ]}
    />
  );
}
