import { UserPlus } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import { adminInstructorHeader } from "@/features/admin/constants/instructors";

interface AdminInstructorsHeaderProps {
  onAdd: () => void;
}

export default function AdminInstructorsHeader({
  onAdd,
}: AdminInstructorsHeaderProps) {
  return (
    <PageHeader
      className="mb-0"
      eyebrow={adminInstructorHeader.eyebrow}
      title={adminInstructorHeader.title}
      description={adminInstructorHeader.description}
      actions={
      <Button
        size="lg"
        className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-bold uppercase tracking-[0.12em] shadow-xl shadow-slate-900/15 hover:bg-slate-800"
        leftIcon={<UserPlus className="h-5 w-5" />}
        onClick={onAdd}
      >
        Tambah Instruktur
      </Button>
      }
    />
  );
}
