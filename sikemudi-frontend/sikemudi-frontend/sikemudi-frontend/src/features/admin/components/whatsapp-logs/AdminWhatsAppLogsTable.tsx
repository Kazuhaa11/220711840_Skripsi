import { Eye, RefreshCw } from "lucide-react";
import PaginationBar from "@/components/common/PaginationBar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrapper,
} from "@/components/ui/Table";
import type { PaginationMeta } from "@/types/api";
import type { AdminWhatsAppLogItem, WhatsAppLogStatus } from "@/types/adminWhatsAppLog";

interface AdminWhatsAppLogsTableProps {
  items: AdminWhatsAppLogItem[];
  pagination: PaginationMeta | null;
  loading?: boolean;
  actionLoading?: boolean;
  onPageChange: (page: number) => void;
  onDetail: (item: AdminWhatsAppLogItem) => void;
  onRetry: (item: AdminWhatsAppLogItem) => void;
}

function statusVariant(status: WhatsAppLogStatus) {
  if (status === "Terkirim") return "success";
  if (status === "Pending") return "warning";
  if (status === "Gagal") return "danger";
  return "default";
}

export default function AdminWhatsAppLogsTable({
  items,
  pagination,
  loading = false,
  actionLoading = false,
  onPageChange,
  onDetail,
  onRetry,
}: AdminWhatsAppLogsTableProps) {
  return (
    <TableWrapper>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Event</TableHeaderCell>
            <TableHeaderCell>Tujuan</TableHeaderCell>
            <TableHeaderCell>Pesan</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Waktu</TableHeaderCell>
            <TableHeaderCell className="min-w-38 text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                {loading ? "Memuat log WhatsApp..." : "Belum ada log WhatsApp sesuai filter."}
              </TableCell>
            </TableRow>
          ) : null}

          {items.map((item) => (
            <TableRow key={item.id} className="align-top">
              <TableCell className="min-w-58 px-4 py-4">
                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-950">{item.event_type_label}</p>
                  <p className="mt-1 break-all text-xs text-slate-500">{item.notification_key}</p>
                </div>
              </TableCell>

              <TableCell className="min-w-34 px-4 py-4">
                <p className="font-bold text-slate-800">{item.target || "-"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {item.notifiable_type_label || "-"} {item.notifiable_id ? `#${item.notifiable_id}` : ""}
                </p>
              </TableCell>

              <TableCell className="min-w-72 px-4 py-4">
                <p className="line-clamp-3 text-sm leading-6 text-slate-700">
                  {item.message_preview || "Pesan tidak tersedia."}
                </p>
                {item.error_message ? (
                  <p className="mt-2 line-clamp-2 text-xs font-semibold text-red-600">
                    {item.error_message}
                  </p>
                ) : null}
              </TableCell>

              <TableCell className="min-w-32 px-4 py-4">
                <Badge variant={statusVariant(item.status)}>{item.status_label}</Badge>
              </TableCell>

              <TableCell className="min-w-38 px-4 py-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">{item.created_at_label || "-"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Terkirim: {item.sent_at_label || "-"}
                </p>
              </TableCell>

              <TableCell className="min-w-38 px-4 py-4">
                <div className="grid justify-items-end gap-2 sm:grid-cols-[auto_auto] sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-full min-w-24 rounded-xl sm:w-auto"
                    leftIcon={<Eye className="h-4 w-4" />}
                    onClick={() => onDetail(item)}
                    disabled={actionLoading}
                  >
                    Detail
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-full min-w-24 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 sm:w-auto"
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                    onClick={() => onRetry(item)}
                    disabled={actionLoading || !item.can_retry}
                  >
                    Retry
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination ? (
        <TableFooter>
          <PaginationBar
            currentPage={pagination.current_page}
            totalPages={pagination.last_page}
            label={`Menampilkan ${items.length} dari ${pagination.total} log`}
            onPageChange={onPageChange}
          />
        </TableFooter>
      ) : null}
    </TableWrapper>
  );
}
