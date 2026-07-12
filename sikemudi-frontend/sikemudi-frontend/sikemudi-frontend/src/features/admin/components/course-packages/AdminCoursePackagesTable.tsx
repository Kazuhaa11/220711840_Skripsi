import { Eye, Pencil, Power, PowerOff } from "lucide-react";
import PaginationBar from "@/components/common/PaginationBar";
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
  AdminCoursePackage,
  AdminCoursePackageStatus,
} from "@/features/admin/constants/coursePackages";
import { adminCoursePackageMessages } from "@/features/admin/constants/coursePackages";

interface AdminCoursePackagesTableProps {
  packages: AdminCoursePackage[];
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onDetail: (coursePackage: AdminCoursePackage) => void;
  onEdit: (coursePackage: AdminCoursePackage) => void;
  onDelete: (coursePackage: AdminCoursePackage) => void;
}

const statusDotClass: Record<AdminCoursePackageStatus, string> = {
  Aktif: "bg-emerald-500",
  Nonaktif: "bg-red-500",
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

function getPaginationLabel(pagination: PaginationMeta | null | undefined) {
  if (!pagination || pagination.total <= 0) {
    return "Belum ada data paket kursus.";
  }

  const start = (pagination.current_page - 1) * pagination.per_page + 1;
  const end = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  return `Menampilkan ${start} - ${end} dari ${pagination.total} paket`;
}

export default function AdminCoursePackagesTable({
  packages,
  pagination,
  onPageChange,
  onDetail,
  onEdit,
  onDelete,
}: AdminCoursePackagesTableProps) {
  if (packages.length === 0) {
    return (
      <EmptyState
        title={adminCoursePackageMessages.emptyTitle}
        description={adminCoursePackageMessages.emptyDescription}
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
            <TableHeaderCell className="min-w-60 py-3">Paket</TableHeaderCell>
            <TableHeaderCell className="min-w-27.5 px-5 py-3">Durasi</TableHeaderCell>
            <TableHeaderCell className="min-w-42.5 px-5 py-3">Harga Mulai</TableHeaderCell>
            <TableHeaderCell className="min-w-35 px-5 py-3">Status</TableHeaderCell>
            <TableHeaderCell className="w-45 px-5 py-3 text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {packages.map((item) => {
            const isInactive = item.status === "Nonaktif";

            return (
              <TableRow key={item.id} className="hover:bg-slate-50/70">
                <TableCell className="px-5 py-3 align-middle">
                  <p className="max-w-56 truncate text-sm font-black text-slate-950">
                    {item.name}
                  </p>
                  <p className="mt-0.5 max-w-56 truncate text-xs font-medium text-slate-500">
                    {item.shortDescription}
                  </p>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <p className="text-sm font-black text-blue-700">
                    {item.durationHours} jam
                  </p>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <p className="text-sm font-black text-slate-950">
                    Rp {formatRupiah(item.price)}
                  </p>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <div className="space-y-2">
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
