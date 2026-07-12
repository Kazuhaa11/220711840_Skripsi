import Badge from "@/components/ui/Badge";
import type { BookingHistoryStatus } from "@/features/participant/constants/type";

interface BookingHistoryStatusBadgeProps {
  status: BookingHistoryStatus;
}

function getStatusLabel(status: BookingHistoryStatus) {
  if (status === "TERKONFIRMASI") return "TERKONFIRMASI";
  if (status === "DIBATALKAN") return "DIBATALKAN";
  if (status === "DITOLAK") return "DITOLAK";
  if (status === "RESCHEDULED") return "RESCHEDULED";
  return "SELESAI";
}

function getStatusVariant(status: BookingHistoryStatus) {
  if (status === "SELESAI") return "success";
  if (status === "TERKONFIRMASI") return "info";
  if (status === "DIBATALKAN") return "danger";
  if (status === "DITOLAK") return "danger";
  return "warning";
}

export default function BookingHistoryStatusBadge({
  status,
}: BookingHistoryStatusBadgeProps) {
  return (
    <Badge
      variant={getStatusVariant(status)}
      className="px-2.5 text-[11px] font-bold uppercase tracking-wide"
    >
      {getStatusLabel(status)}
    </Badge>
  );
}
