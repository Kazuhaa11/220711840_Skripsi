import { Eye, Pencil, Power, PowerOff } from "lucide-react";
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
  AdminInstructor,
  AdminInstructorScheduleStatus,
  AdminInstructorStatus,
} from "@/features/admin/constants/instructors";
import { adminInstructorMessages } from "@/features/admin/constants/instructors";

interface AdminInstructorsTableProps {
  instructors: AdminInstructor[];
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
  onDetail: (instructor: AdminInstructor) => void;
  onEdit: (instructor: AdminInstructor) => void;
  onDelete: (instructor: AdminInstructor) => void;
}

const avatarToneClass: Record<AdminInstructor["avatarTone"], string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
};

const statusVariant: Record<AdminInstructorStatus, "success" | "warning" | "danger"> = {
  Aktif: "success",
  Nonaktif: "danger",
  Cuti: "warning",
};

const scheduleClass: Record<AdminInstructorScheduleStatus, string> = {
  Mengajar: "bg-emerald-500",
  Terjadwal: "bg-blue-500",
  "Libur / Cuti": "bg-amber-500",
};

function getPaginationLabel(pagination: PaginationMeta | null | undefined) {
  if (!pagination || pagination.total <= 0) {
    return "Belum ada data instruktur.";
  }

  const start = (pagination.current_page - 1) * pagination.per_page + 1;
  const end = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  return `Menampilkan ${start} - ${end} dari ${pagination.total} instruktur`;
}

export default function AdminInstructorsTable({
  instructors,
  pagination,
  onPageChange,
  onDetail,
  onEdit,
  onDelete,
}: AdminInstructorsTableProps) {
  if (instructors.length === 0) {
    return (
      <EmptyState
        title={adminInstructorMessages.emptyTitle}
        description={adminInstructorMessages.emptyDescription}
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
            <TableHeaderCell className="min-w-60 px-5 py-3">Instruktur</TableHeaderCell>
            <TableHeaderCell className="min-w-52.5 px-5 py-3">Kontak</TableHeaderCell>
            <TableHeaderCell className="min-w-42.5 px-5 py-3">Spesialisasi</TableHeaderCell>
            <TableHeaderCell className="min-w-40 px-5 py-3">Status</TableHeaderCell>
            <TableHeaderCell className="w-45 px-5 py-3 text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {instructors.map((instructor) => {
            const isInactive =
              instructor.accountStatus === "Nonaktif" || instructor.status === "Nonaktif";

            return (
              <TableRow key={instructor.apiId ?? instructor.id} className="hover:bg-slate-50/70">
                <TableCell className="px-5 py-3 align-middle">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black",
                        avatarToneClass[instructor.avatarTone],
                      )}
                    >
                      {instructor.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-950">
                        {instructor.fullName}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                        {instructor.role}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <p className="truncate text-sm font-bold text-slate-950">{instructor.email}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{instructor.phone}</p>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <Badge variant="info" className="max-w-37.5 justify-center text-center leading-5">
                    {instructor.specialization}
                  </Badge>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <div className="space-y-2">
                    <Badge variant={statusVariant[instructor.status]}>{instructor.status}</Badge>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          scheduleClass[instructor.scheduleStatus],
                        )}
                      />
                      <span>{instructor.scheduleStatus}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-3 align-middle">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 rounded-xl p-0"
                      onClick={() => onDetail(instructor)}
                      aria-label={`Lihat detail ${instructor.fullName}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 w-9 rounded-xl p-0"
                      onClick={() => onEdit(instructor)}
                      aria-label={`Ubah ${instructor.fullName}`}
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
                      onClick={() => onDelete(instructor)}
                      aria-label={
                        isInactive
                          ? `Aktifkan kembali ${instructor.fullName}`
                          : `Nonaktifkan ${instructor.fullName}`
                      }
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
