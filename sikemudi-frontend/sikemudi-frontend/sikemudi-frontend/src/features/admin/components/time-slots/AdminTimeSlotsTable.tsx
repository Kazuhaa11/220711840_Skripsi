import { Clock3, Eye, Pencil, Power, PowerOff } from "lucide-react";
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
  AdminTimeSlot,
  AdminTimeSlotStatus,
} from "@/features/admin/constants/timeSlots";
import { adminTimeSlotMessages } from "@/features/admin/constants/timeSlots";

interface AdminTimeSlotsTableProps {
  timeSlots: AdminTimeSlot[];
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onDetail: (timeSlot: AdminTimeSlot) => void;
  onEdit: (timeSlot: AdminTimeSlot) => void;
  onDelete: (timeSlot: AdminTimeSlot) => void;
}

const statusVariant: Record<AdminTimeSlotStatus, "success" | "danger"> = {
  Aktif: "success",
  Nonaktif: "danger",
};

const statusDotClass: Record<AdminTimeSlotStatus, string> = {
  Aktif: "bg-emerald-500",
  Nonaktif: "bg-red-500",
};

function getPaginationLabel(pagination: PaginationMeta | null | undefined) {
  if (!pagination || pagination.total <= 0) {
    return "Belum ada data slot waktu.";
  }

  const start = (pagination.current_page - 1) * pagination.per_page + 1;
  const end = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  return `Menampilkan ${start} - ${end} dari ${pagination.total} slot waktu`;
}

function formatDuration(minutes: number) {
  if (minutes >= 60 && minutes % 60 === 0) {
    return `${minutes / 60} jam`;
  }

  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} jam ${remainingMinutes} menit`;
  }

  return `${minutes} menit`;
}

export default function AdminTimeSlotsTable({
  timeSlots,
  pagination,
  onPageChange,
  onDetail,
  onEdit,
  onDelete,
}: AdminTimeSlotsTableProps) {
  if (timeSlots.length === 0) {
    return (
      <EmptyState
        title={adminTimeSlotMessages.emptyTitle}
        description={adminTimeSlotMessages.emptyDescription}
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
            <TableHeaderCell className="w-[120px] px-5 py-3">ID</TableHeaderCell>
            <TableHeaderCell className="min-w-[240px] px-5 py-3">Slot</TableHeaderCell>
            <TableHeaderCell className="min-w-[150px] px-5 py-3">Jam</TableHeaderCell>
            <TableHeaderCell className="min-w-[140px] px-5 py-3">Durasi</TableHeaderCell>
            <TableHeaderCell className="min-w-[170px] px-5 py-3">Berlaku</TableHeaderCell>
            <TableHeaderCell className="min-w-[150px] px-5 py-3">Status</TableHeaderCell>
            <TableHeaderCell className="w-[160px] px-5 py-3 text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {timeSlots.map((item) => {
            const isInactive = item.status === "Nonaktif";

            return (
              <TableRow key={item.id} className="hover:bg-slate-50/70">
                <TableCell className="px-5 py-3 align-middle">
                  <p className="text-sm font-black tracking-[0.08em] text-slate-950">
                    {item.id}
                  </p>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                      <Clock3 className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">
                        {item.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                        {item.subtitle || "Slot latihan"}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <p className="text-sm font-black text-slate-950">
                    {item.startTime} - {item.endTime}
                  </p>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <p className="text-sm font-bold text-blue-700">
                    {formatDuration(item.durationMinutes)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.durationMinutes} menit
                  </p>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <p className="max-w-[170px] truncate text-sm font-semibold text-slate-700">
                    {item.activeDays || "Setiap Hari"}
                  </p>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <div className="space-y-2">
                    <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          statusDotClass[item.status],
                        )}
                      />
                      <span>{item.status}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-xl p-0"
                      aria-label={`Lihat detail ${item.name}`}
                      onClick={() => onDetail(item)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-xl p-0"
                      aria-label={`Ubah ${item.name}`}
                      onClick={() => onEdit(item)}
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
                          ? `Aktifkan kembali ${item.name}`
                          : `Nonaktifkan ${item.name}`
                      }
                      onClick={() => onDelete(item)}
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
