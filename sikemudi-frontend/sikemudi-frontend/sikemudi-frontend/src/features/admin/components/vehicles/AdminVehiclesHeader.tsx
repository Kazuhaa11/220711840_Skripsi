import { Plus } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import { adminVehicleHeader } from "@/features/admin/constants/vehicles";

interface AdminVehiclesHeaderProps {
  onAdd: () => void;
}

export default function AdminVehiclesHeader({
  onAdd,
}: AdminVehiclesHeaderProps) {
  return (
    <PageHeader
      className="mb-0"
      eyebrow={adminVehicleHeader.eyebrow}
      title={adminVehicleHeader.title}
      description={adminVehicleHeader.description}
      actions={
        <Button
          size="lg"
          className="h-11 rounded-2xl bg-slate-950 px-5 text-sm font-bold uppercase tracking-widest shadow-xl shadow-slate-900/15 hover:bg-slate-800"
          leftIcon={<Plus className="h-5 w-5" />}
          onClick={onAdd}
        >
          Tambah Kendaraan
        </Button>
      }
    />
  );
}
