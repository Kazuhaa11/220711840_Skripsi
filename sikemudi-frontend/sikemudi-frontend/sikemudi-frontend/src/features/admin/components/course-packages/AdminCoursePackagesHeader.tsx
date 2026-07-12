import { PlusCircle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import { adminCoursePackageHeader } from "@/features/admin/constants/coursePackages";

interface AdminCoursePackagesHeaderProps {
  onAdd: () => void;
}

export default function AdminCoursePackagesHeader({
  onAdd,
}: AdminCoursePackagesHeaderProps) {
  return (
    <PageHeader
      className="mb-0"
      title={adminCoursePackageHeader.title}
      description={adminCoursePackageHeader.description}
      actions={
        <Button
          size="lg"
          className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-bold shadow-xl shadow-slate-900/15 hover:bg-slate-800"
          leftIcon={<PlusCircle className="h-5 w-5" />}
          onClick={onAdd}
        >
          Tambah Paket Kursus
        </Button>
      }
    />
  );
}
