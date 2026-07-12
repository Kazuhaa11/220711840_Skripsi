import { Car, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import type { AdminVehicle } from "@/features/admin/constants/vehicles";

interface VehicleDetailModalProps {
  opened: boolean;
  vehicle: AdminVehicle | null;
  onClose: () => void;
  onEdit: (vehicle: AdminVehicle) => void;
}

const statusClass = {
  Aktif: "bg-emerald-100 text-emerald-700",
  Servis: "bg-amber-100 text-amber-700",
  Nonaktif: "bg-red-100 text-red-700",
};

const imageToneClass: Record<AdminVehicle["imageTone"], string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
};

export default function VehicleDetailModal({
  opened,
  vehicle,
  onClose,
  onEdit,
}: VehicleDetailModalProps) {
  if (!vehicle) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="2xl"
      showCloseButton={false}
      bodyClassName="p-0"
    >
      <div className="overflow-hidden rounded-[28px] bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-6 sm:px-5">
          <div>
            <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
              Detail Kendaraan
            </h2>

            <p className="mt-2 text-base text-slate-600">
              Konfigurasi spesifikasi dan status unit armada latihan.
            </p>
          </div>

          <Button
            variant="ghost"
            className="h-10 w-10 rounded-xl p-0"
            aria-label="Tutup detail kendaraan"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid gap-5 px-5 pb-4 sm:px-5 lg:grid-cols-[220px_minmax(0,1fr)]">
          <Card className="rounded-3xl bg-slate-100 p-5 text-center shadow-none">
            <div
              className={cn(
                "mx-auto flex h-28 w-28 items-center justify-center rounded-3xl",
                imageToneClass[vehicle.imageTone],
              )}
            >
              <Car className="h-11 w-11" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-950">
              {vehicle.name}
            </h3>

            <p className="mt-1 text-lg font-bold text-slate-950">
              {vehicle.model}
            </p>

            <p className="mt-3 text-sm font-bold text-blue-700">{vehicle.id}</p>

            <Badge
              className={cn(
                "mt-5 font-bold uppercase",
                statusClass[vehicle.status],
              )}
            >
              {vehicle.status}
            </Badge>
          </Card>

          <div className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Plat Nomor
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">
                  {vehicle.plateNumber}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Jenis Transmisi
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">
                  {vehicle.transmission}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Ketersediaan
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">
                  {vehicle.availability}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Digunakan Hari Ini
                </p>
                <p className="mt-2 text-lg font-bold text-blue-700">
                  {vehicle.usedToday} Sesi
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-5 pb-6 sm:px-5">
          <Button
            size="lg"
            className="w-full rounded-2xl bg-slate-950 px-5 font-bold uppercase tracking-[0.08em] hover:bg-slate-800 sm:w-auto"
            onClick={() => onEdit(vehicle)}
          >
            Ubah Kendaraan
          </Button>
        </div>
      </div>
    </Modal>
  );
}
