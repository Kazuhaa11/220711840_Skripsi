import { Car, Eye, Pencil, Power, PowerOff } from "lucide-react";
import PaginationBar from "@/components/common/PaginationBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrapper,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import type { PaginationMeta } from "@/types/api";
import type {
  AdminVehicle,
  AdminVehicleStatus,
  AdminVehicleTransmission,
} from "@/features/admin/constants/vehicles";
import { adminVehicleMessages } from "@/features/admin/constants/vehicles";

interface AdminVehiclesTableProps {
  vehicles: AdminVehicle[];
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onDetail: (vehicle: AdminVehicle) => void;
  onEdit: (vehicle: AdminVehicle) => void;
  onDelete: (vehicle: AdminVehicle) => void;
}

const statusVariant: Record<AdminVehicleStatus, "success" | "warning" | "danger"> = {
  Aktif: "success",
  Servis: "warning",
  Nonaktif: "danger",
};


const transmissionClass: Record<AdminVehicleTransmission, string> = {
  Manual: "bg-slate-100 text-slate-700",
  Otomatis: "bg-blue-100 text-blue-700",
};

const imageToneClass: Record<AdminVehicle["imageTone"], string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
};

function getPaginationLabel(pagination: PaginationMeta | null | undefined) {
  if (!pagination || pagination.total <= 0) {
    return "Belum ada data kendaraan.";
  }

  const start = (pagination.current_page - 1) * pagination.per_page + 1;
  const end = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  return `Menampilkan ${start} - ${end} dari ${pagination.total} kendaraan`;
}

export default function AdminVehiclesTable({
  vehicles,
  pagination,
  onPageChange,
  onDetail,
  onEdit,
  onDelete,
}: AdminVehiclesTableProps) {
  if (vehicles.length === 0) {
    return (
      <EmptyState
        title={adminVehicleMessages.emptyTitle}
        description={adminVehicleMessages.emptyDescription}
      />
    );
  }

  const showPaginationButtons = Boolean(
    pagination && pagination.last_page > 1 && onPageChange,
  );

  return (
    <TableWrapper className="rounded-3xl shadow-sm">
      <Table>
        <TableHead>
          <TableRow className="border-b border-slate-200">
            <TableHeaderCell className="min-w-60 px-5 py-3">Kendaraan</TableHeaderCell>
            <TableHeaderCell className="min-w-37.5 px-5 py-3">Plat Nomor</TableHeaderCell>
            <TableHeaderCell className="min-w-37.5 px-5 py-3">Transmisi</TableHeaderCell>
            <TableHeaderCell className="min-w-42.5 px-5 py-3">Status</TableHeaderCell>
            <TableHeaderCell className="min-w-37.5 px-5 py-3">Pemakaian</TableHeaderCell>
            <TableHeaderCell className="w-45 px-5 py-3 text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {vehicles.map((vehicle) => {
            const isInactive = vehicle.status === "Nonaktif";

            return (
              <TableRow key={vehicle.id} className="hover:bg-slate-50/70">
                <TableCell className="px-5 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                        imageToneClass[vehicle.imageTone],
                      )}
                    >
                      <Car className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">
                        {vehicle.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                        {vehicle.model}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <p className="text-sm font-bold text-slate-950">
                    {vehicle.plateNumber}
                  </p>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <Badge
                    className={cn(
                      "font-bold",
                      transmissionClass[vehicle.transmission],
                    )}
                  >
                    {vehicle.transmission}
                  </Badge>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <div className="space-y-2">
                    <Badge variant={statusVariant[vehicle.status]}>
                      {vehicle.status}
                    </Badge>

                  </div>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <p className="text-sm font-black text-blue-700">
                    {vehicle.usedToday} sesi
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    STNK {vehicle.licenseStatus}
                  </p>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-xl p-0"
                      aria-label={`Lihat detail ${vehicle.name} ${vehicle.model}`}
                      onClick={() => onDetail(vehicle)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-xl p-0"
                      aria-label={`Ubah ${vehicle.name} ${vehicle.model}`}
                      onClick={() => onEdit(vehicle)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant={isInactive ? "outline" : "danger"}
                      className={cn(
                        "h-9 w-9 rounded-xl p-0",
                        isInactive && "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
                      )}
                      aria-label={
                        isInactive
                          ? `Aktifkan kembali ${vehicle.name} ${vehicle.model}`
                          : `Nonaktifkan ${vehicle.name} ${vehicle.model}`
                      }
                      onClick={() => onDelete(vehicle)}
                    >
                      {isInactive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <TableFooter className="px-5 py-3">
        {showPaginationButtons ? (
          <PaginationBar
            currentPage={pagination!.current_page}
            totalPages={pagination!.last_page}
            label={getPaginationLabel(pagination)}
            onPageChange={onPageChange!}
          />
        ) : (
          <p className="text-sm font-medium text-slate-600">
            {getPaginationLabel(pagination)}
          </p>
        )}
      </TableFooter>
    </TableWrapper>
  );
}
