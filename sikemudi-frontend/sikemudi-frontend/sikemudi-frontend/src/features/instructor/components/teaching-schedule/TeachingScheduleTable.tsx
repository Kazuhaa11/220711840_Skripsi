import { useNavigate } from "react-router-dom";
import { CalendarDays, Car, Clock3, Eye, Package } from "lucide-react";
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
  TeachingScheduleItem,
  TeachingScheduleStatus,
} from "@/features/instructor/constants/teachingSchedule";
import { teachingScheduleEmptyMessage } from "@/features/instructor/constants/teachingSchedule";

interface TeachingScheduleTableProps {
  items: TeachingScheduleItem[];
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
}

const statusClass: Record<TeachingScheduleStatus, string> = {
  BERLANGSUNG: "bg-blue-100 text-blue-700",
  "AKAN DATANG": "bg-slate-100 text-slate-600",
  "MENUNGGU INPUT": "bg-red-100 text-red-700",
  SELESAI: "bg-emerald-100 text-emerald-700",
};

function ScheduleStatusBadge({ status }: { status: TeachingScheduleStatus }) {
  return (
    <Badge className={cn("px-3 py-1 text-[10px] font-bold", statusClass[status])}>
      {status}
    </Badge>
  );
}

function getDetailPath(item: TeachingScheduleItem) {
  return item.bookingGroupId
    ? `/instruktur/jadwal-mengajar/paket/${item.bookingGroupId}`
    : `/instruktur/jadwal-mengajar/paket/${item.numericId ?? item.id}`;
}

function TeachingScheduleMobileCard({ item }: { item: TeachingScheduleItem }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-950">{item.date}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            {item.day}
          </p>
        </div>

        <ScheduleStatusBadge status={item.status} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Jam Sesi Berikutnya
          </p>
          <div className="mt-2 flex items-center gap-2 text-slate-950">
            <Clock3 className="h-4 w-4 text-blue-600" />
            <span className="font-semibold">{item.time}</span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Paket
          </p>
          <p className="mt-2 font-semibold text-slate-950">
            {item.detail.focus}
          </p>
          <p className="text-xs font-medium text-slate-400">
            {item.sessionCount ?? 0} sesi
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Kendaraan
          </p>
          <p className="mt-2 font-semibold text-slate-950">
            {item.vehicleName}
          </p>
          <p className="text-xs font-medium text-slate-400">
            {item.vehiclePlate} • {item.transmission}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Peserta
          </p>
          <p className="mt-2 font-semibold text-slate-950">
            {item.participantName}
          </p>
          <p className="text-xs font-medium text-slate-400">
            {item.participantSession}
          </p>
        </div>
      </div>

      <Button
        fullWidth
        variant="outline"
        className="mt-5 rounded-xl border-slate-200 text-xs font-bold uppercase tracking-[0.12em]"
        leftIcon={<Eye className="h-4 w-4" />}
        onClick={() => navigate(getDetailPath(item))}
      >
        Lihat Detail Sesi
      </Button>
    </div>
  );
}

export default function TeachingScheduleTable({
  items,
  pagination,
  onPageChange,
}: TeachingScheduleTableProps) {
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <EmptyState
        title={teachingScheduleEmptyMessage.title}
        description={teachingScheduleEmptyMessage.description}
      />
    );
  }

  return (
    <>
      <TableWrapper className="hidden rounded-3xl border-0 shadow-xl shadow-slate-200/70 lg:block">
        <Table>
          <TableHead className="bg-white">
            <TableRow>
              <TableHeaderCell className="w-42 py-4 text-slate-400">
                Tanggal & Hari
              </TableHeaderCell>
              <TableHeaderCell className="w-40 py-4 text-slate-400">
                Jam Sesi
              </TableHeaderCell>
              <TableHeaderCell className="py-4 text-slate-400">
                Kendaraan
              </TableHeaderCell>
              <TableHeaderCell className="py-4 text-slate-400">
                Peserta
              </TableHeaderCell>
              <TableHeaderCell className="w-36 py-4 text-slate-400">
                Status
              </TableHeaderCell>
              <TableHeaderCell className="w-40 py-4 text-right text-slate-400">
                Aksi
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="border-slate-100">
                <TableCell className="px-5 py-5">
                  <div className="flex items-start gap-3">
                    <CalendarDays className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        {item.date}
                      </p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                        {item.day}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-5">
                  <div className="flex items-start gap-3">
                    <Clock3 className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.time}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {item.duration}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-5">
                  <div className="flex items-start gap-3">
                    <Car className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                    <div>
                      <p className="text-sm font-bold leading-6 text-slate-950">
                        {item.vehicleName}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {item.vehiclePlate} • {item.transmission}
                      </p>
                      <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-blue-700">
                        <Package className="h-3 w-3" />
                        {item.detail.focus}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-5">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-extrabold text-blue-700">
                      {item.participantInitial}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        {item.participantName}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {item.participantSession}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {item.sessionCount ?? 0} sesi dalam paket
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-5">
                  <ScheduleStatusBadge status={item.status} />
                </TableCell>

                <TableCell className="px-5 py-5 text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-200 px-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-950"
                    leftIcon={<Eye className="h-4 w-4" />}
                    onClick={() => navigate(getDetailPath(item))}
                  >
                    Detail Sesi
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TableFooter className="border-t-0 px-5 py-4">
          <PaginationBar
            currentPage={pagination?.current_page ?? 1}
            totalPages={pagination?.last_page ?? 1}
            label={
              <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
                Menampilkan {items.length} dari {pagination?.total ?? items.length} paket jadwal
              </span>
            }
            onPageChange={onPageChange ?? (() => undefined)}
          />
        </TableFooter>
      </TableWrapper>

      <div className="space-y-4 lg:hidden">
        {items.map((item) => (
          <TeachingScheduleMobileCard key={item.id} item={item} />
        ))}
      </div>
    </>
  );
}
