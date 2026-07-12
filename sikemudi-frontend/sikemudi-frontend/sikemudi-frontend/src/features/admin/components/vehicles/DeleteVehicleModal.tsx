import ConfirmDialog from "@/components/common/ConfirmDialog";
import type { AdminVehicle } from "@/features/admin/constants/vehicles";

interface DeleteVehicleModalProps {
  opened: boolean;
  vehicle: AdminVehicle | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteVehicleModal({
  opened,
  vehicle,
  loading = false,
  onClose,
  onConfirm,
}: DeleteVehicleModalProps) {
  const isInactive = vehicle?.status === "Nonaktif";

  return (
    <ConfirmDialog
      opened={opened}
      title={isInactive ? "Aktifkan Kembali Kendaraan?" : "Nonaktifkan Kendaraan?"}
      description={
        isInactive
          ? "Kendaraan akan kembali berstatus aktif dan dapat digunakan dalam penjadwalan latihan baru."
          : "Kendaraan tidak dihapus permanen. Status kendaraan akan diubah menjadi Nonaktif, sedangkan riwayat jadwal, booking, dan laporan lama tetap tersimpan."
      }
      confirmLabel={isInactive ? "Ya, Aktifkan" : "Ya, Nonaktifkan"}
      cancelLabel="Batal"
      tone={isInactive ? "primary" : "danger"}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      preview={
        vehicle ? (
          <div>
            <p className="font-bold text-slate-950">
              {vehicle.name} {vehicle.model}
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              {vehicle.id} • {vehicle.plateNumber}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Status: {vehicle.status} • Ketersediaan: {vehicle.availability}
            </p>
          </div>
        ) : null
      }
    />
  );
}
