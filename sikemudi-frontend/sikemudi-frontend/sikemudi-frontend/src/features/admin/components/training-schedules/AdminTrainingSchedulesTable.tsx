import { CalendarClock, Eye } from "lucide-react";
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
import {
  getBookingStatusBadgeVariant,
  mapAdminBookingToRow,
} from "@/features/admin/utils/adminBookingMapper";
import type { PaginationMeta } from "@/types/api";
import type { AdminBookingApiItem } from "@/types/adminBooking";

interface AdminTrainingSchedulesTableProps {
  items: AdminBookingApiItem[];
  pagination: PaginationMeta | null;
  loading?: boolean;
  onDetail: (item: AdminBookingApiItem) => void;
  onPageChange: (page: number) => void;
}

export default function AdminTrainingSchedulesTable({
  items,
  pagination,
  loading = false,
  onDetail,
  onPageChange,
}: AdminTrainingSchedulesTableProps) {
  if (!loading && items.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock className="h-8 w-8" />}
        title="Belum ada booking paket"
        description="Jadwal latihan otomatis akan muncul setelah peserta membuat booking paket."
      />
    );
  }

  return (
    <TableWrapper>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Booking</TableHeaderCell>
            <TableHeaderCell>Peserta</TableHeaderCell>
            <TableHeaderCell>Jadwal Awal</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-slate-500">
                Memuat jadwal latihan paket...
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const row = mapAdminBookingToRow(item);

              return (
                <TableRow key={item.id} className="hover:bg-slate-50/70">
                  <TableCell>
                    <div className="min-w-44">
                      <p className="font-bold text-slate-950">{row.code}</p>
                      <p className="mt-1 max-w-54 truncate text-sm font-semibold text-blue-700">
                        {row.packageName}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {row.progressLabel} • {row.priceLabel}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="min-w-42">
                      <p className="font-semibold text-slate-950">{row.participantName}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {row.participantCode}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="min-w-48">
                      <p className="font-semibold text-slate-950">{row.dateLabel}</p>
                      <p className="mt-1 text-sm text-slate-600">{row.timeLabel}</p>
                      <p className="mt-1 max-w-56 truncate text-xs text-slate-500">
                        {row.instructorName} • {row.vehicleName}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex min-w-44 flex-col items-start gap-2">
                      <Badge
                        variant={getBookingStatusBadgeVariant(row.bookingStatus)}
                        className="font-bold uppercase tracking-[0.08em]"
                      >
                        {row.bookingStatusLabel}
                      </Badge>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl px-3"
                        aria-label={`Detail ${row.code}`}
                        leftIcon={<Eye className="h-4 w-4" />}
                        onClick={() => onDetail(item)}
                      >
                        Detail
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <TableFooter className="bg-slate-50">
        <PaginationBar
          currentPage={pagination?.current_page ?? 1}
          totalPages={pagination?.last_page ?? 1}
          label={
            <>
              Menampilkan <span className="font-bold">{items.length}</span> dari{" "}
              <span className="font-bold">{pagination?.total ?? items.length}</span>{" "}
              booking paket
            </>
          }
          onPageChange={onPageChange}
        />
      </TableFooter>
    </TableWrapper>
  );
}
