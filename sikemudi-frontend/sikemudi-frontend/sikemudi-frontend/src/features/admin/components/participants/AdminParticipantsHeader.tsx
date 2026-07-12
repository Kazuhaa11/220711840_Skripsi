import { UserPlus } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import { adminParticipantHeader } from "@/features/admin/constants/participants";

interface AdminParticipantsHeaderProps {
  onAdd: () => void;
}

export default function AdminParticipantsHeader({
  onAdd,
}: AdminParticipantsHeaderProps) {
  return (
    <PageHeader
      className="mb-0"
      eyebrow={adminParticipantHeader.eyebrow}
      title={adminParticipantHeader.title}
      description={adminParticipantHeader.description}
      actions={
      <Button
        size="lg"
        className="h-10 rounded-2xl bg-slate-950 px-5 text-sm font-bold uppercase tracking-[0.14em] shadow-xl shadow-slate-900/15 hover:bg-slate-800"
        leftIcon={<UserPlus className="h-5 w-5" />}
        onClick={onAdd}
      >
        Tambah Peserta Baru
      </Button>
      }
    />
  );
}
