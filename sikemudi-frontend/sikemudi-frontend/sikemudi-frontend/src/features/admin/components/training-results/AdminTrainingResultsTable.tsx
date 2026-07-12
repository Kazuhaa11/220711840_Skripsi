import { Eye, ShieldCheck } from "lucide-react";
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
  AdminTrainingResult,
  AdminTrainingResultWorkflowStatus,
} from "@/features/admin/constants/trainingResults";
import {
  adminTrainingResultMessages,
  canVerifyAdminTrainingResult,
} from "@/features/admin/constants/trainingResults";

interface AdminTrainingResultsTableProps {
  results: AdminTrainingResult[];
  pagination: PaginationMeta | null;
  onDetail: (result: AdminTrainingResult) => void;
  onVerify: (result: AdminTrainingResult) => void;
  onPageChange: (page: number) => void;
}


const workflowClass: Record<AdminTrainingResultWorkflowStatus, string> = {
  "Dalam Proses": "bg-slate-100 text-slate-700",
  "Siap Validasi Sertifikat": "bg-blue-100 text-blue-700",
  "Siap Sertifikat": "bg-emerald-100 text-emerald-700",
  "Sertifikat Terbit": "bg-emerald-900 text-white",
  "Tidak Lulus": "bg-red-100 text-red-700",
  "Tidak Hadir": "bg-slate-100 text-slate-700",
  "Belum Dinilai": "bg-amber-100 text-amber-700",
};

export default function AdminTrainingResultsTable({
  results,
  pagination,
  onDetail,
  onVerify,
  onPageChange,
}: AdminTrainingResultsTableProps) {
  if (results.length === 0) {
    return (
      <EmptyState
        title={adminTrainingResultMessages.emptyTitle}
        description={adminTrainingResultMessages.emptyDescription}
      />
    );
  }

  const currentPage = pagination?.current_page ?? 1;
  const totalPages = pagination?.last_page ?? 1;
  const total = pagination?.total ?? results.length;
  const perPage = pagination?.per_page ?? results.length;
  const firstItem = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const lastItem = Math.min(currentPage * perPage, total);

  return (
    <TableWrapper className="rounded-3xl border-0 shadow-xl shadow-slate-200/70">
      <Table>
        <TableHead className="bg-slate-100">
          <TableRow>
            <TableHeaderCell>Booking Paket</TableHeaderCell>
            <TableHeaderCell>Peserta & Paket</TableHeaderCell>
            <TableHeaderCell>Jadwal</TableHeaderCell>
            <TableHeaderCell>Instruktur</TableHeaderCell>
            <TableHeaderCell>Progress</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {results.map((result) => {
            const canVerify = canVerifyAdminTrainingResult(result);

            return (
              <TableRow key={result.bookingGroupId ?? result.id} className="border-slate-100">
                <TableCell className="px-4 py-3">
                  <span className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-bold text-blue-950">
                    {result.packageCode ?? result.id}
                  </span>
                  <p className="mt-2 text-xs text-slate-500">
                    {result.groupStatus ?? "Status paket belum tersedia"}
                  </p>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <p className="font-bold leading-6 text-slate-950">
                    {result.participantName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {result.participantId} • {result.packageName}
                  </p>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <p className="font-bold text-slate-950">{result.sessionDate}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {result.sessionTime} • {result.vehicleName}
                  </p>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <p className="font-medium text-slate-950">
                    {result.instructorName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {result.vehiclePlate}
                  </p>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <p className="font-bold text-slate-950">{result.progressLabel}</p>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <Badge
                    className={cn(
                      "font-bold uppercase",
                      workflowClass[result.workflowStatus],
                    )}
                  >
                    {result.workflowStatus}
                  </Badge>
                  <p className="mt-2 text-xs text-slate-500">
                    Nilai final: {result.nilaiAkhir ?? "-"}
                  </p>
                </TableCell>

                <TableCell className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 rounded-xl p-0"
                      aria-label={`Lihat detail ${result.packageCode ?? result.id}`}
                      title="Lihat detail sesi"
                      onClick={() => onDetail(result)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-9 w-9 rounded-xl p-0",
                        !canVerify && "cursor-not-allowed opacity-40",
                      )}
                      aria-label={
                        canVerify
                          ? `Validasi ${result.packageCode ?? result.id}`
                          : `${result.packageCode ?? result.id} belum siap validasi sertifikat`
                      }
                      title={
                        canVerify
                          ? "Validasi kelulusan paket"
                          : "Validasi hanya aktif jika seluruh sesi selesai dan sesi final lulus"
                      }
                      onClick={() => {
                        if (canVerify) {
                          onVerify(result);
                        }
                      }}
                      disabled={!canVerify}
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>

      </Table>

      <TableFooter>
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          label={
            <>
              Menampilkan <span className="font-bold">{firstItem}-{lastItem}</span> dari{" "}
              <span className="font-bold">{total}</span> paket hasil latihan
            </>
          }
          onPageChange={onPageChange}
        />
      </TableFooter>
    </TableWrapper>
  );
}
