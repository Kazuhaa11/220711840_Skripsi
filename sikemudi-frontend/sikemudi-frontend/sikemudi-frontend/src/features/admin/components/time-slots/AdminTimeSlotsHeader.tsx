import { Plus } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import { adminTimeSlotHeader } from "@/features/admin/constants/timeSlots";

interface AdminTimeSlotsHeaderProps {
  onAdd: () => void;
  actionLabel?: string;
  showAction?: boolean;
}

export default function AdminTimeSlotsHeader({
  onAdd,
  actionLabel = "Tambah Slot Waktu",
  showAction = true,
}: AdminTimeSlotsHeaderProps) {
  return (
    <PageHeader
      className="mb-0"
      eyebrow={
        <span className="flex items-center gap-2 text-sm font-medium normal-case tracking-normal text-slate-700">
          <span>Dashboard</span>
          <span className="font-bold text-slate-950">
            {adminTimeSlotHeader.breadcrumb}
          </span>
        </span>
      }
      title={adminTimeSlotHeader.title}
      actions={
        showAction ? (
          <Button
            size="lg"
            className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-bold uppercase tracking-widest shadow-xl shadow-slate-900/15 hover:bg-slate-800"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={onAdd}
          >
            {actionLabel}
          </Button>
        ) : null
      }
    />
  );
}
