import { useNavigate } from "react-router-dom";
import { CalendarDays, Car, CheckCircle2, ClipboardEdit, Eye, Users } from "lucide-react";
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
import Card from "@/components/ui/Card";
import type { PaginationMeta } from "@/types/api";
import type { TrainingResultItem } from "@/features/instructor/constants/trainingResult";
import {
  trainingResultEmptyMessage,
  trainingResultIcons,
} from "@/features/instructor/constants/trainingResult";
import TrainingResultStatusBadge from "@/features/instructor/components/training-result/TrainingResultStatusBadge";

interface TrainingResultTableProps {
  items: TrainingResultItem[];
  pagination?: PaginationMeta | null;
  onPageChange?: (page: number) => void;
}

function getActionLabel(item: TrainingResultItem) {
  if (item.source === "group") return "Lihat Sesi";

  if (item.source === "result") return "Selesai";

  if (item.source === "candidate" && item.canInputResult === false) {
    return item.status === "MELEWATI BATAS" ? "Melewati Batas" : "Belum Saatnya";
  }

  if (item.status === "SELESAI" || item.status === "LULUS" || item.status === "TIDAK LULUS") return "Selesai";
  return item.isFinalSession ? "Input Hasil" : "Input Absensi";
}

function getActionIcon(item: TrainingResultItem) {
  if (item.source === "group") return <Eye className="h-4 w-4" />;

  if (item.source === "result" || item.status === "SELESAI" || item.status === "LULUS" || item.status === "TIDAK LULUS") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  return <ClipboardEdit className="h-4 w-4" />;
}

function getActionClass(item: TrainingResultItem) {
  if (item.source === "candidate" && item.canInputResult !== false) {
    return "bg-emerald-600 hover:bg-emerald-700";
  }

  if (item.source === "result" || item.status === "SELESAI" || item.status === "LULUS" || item.status === "TIDAK LULUS") {
    return "bg-slate-200 text-slate-500 hover:bg-slate-200";
  }

  return "bg-slate-950 hover:bg-slate-800";
}

function isActionDisabled(item: TrainingResultItem) {
  if (item.source === "result") return true;
  if (item.status === "SELESAI" || item.status === "LULUS" || item.status === "TIDAK LULUS") return true;
  return item.source === "candidate" && item.canInputResult === false;
}

function getInputPath(item: TrainingResultItem) {
  if (item.source === "group" && item.bookingGroupId) {
    return `/instruktur/hasil-latihan/paket/${item.bookingGroupId}`;
  }

  if (item.source === "result" && item.resultId) {
    return `/instruktur/hasil-latihan/input/${item.resultId}?mode=edit`;
  }

  return `/instruktur/hasil-latihan/input/${item.bookingId ?? item.numericId ?? item.id}?mode=create`;
}

function TrainingResultMobileCard({ item }: { item: TrainingResultItem }) {
  const navigate = useNavigate();

  return (
    <Card className="rounded-3xl p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">
            {item.sessionCode}
          </p>
          <h3 className="mt-2 text-base font-extrabold text-slate-950">
            {item.day}, {item.date}
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">{item.time}</p>
          {item.sessionLabel ? (
            <p className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-blue-700">
              {item.sessionLabel}
            </p>
          ) : null}
        </div>

        <TrainingResultStatusBadge status={item.status} />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="flex gap-3">
          <Car className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
          <div>
            <p className="text-sm font-bold text-slate-950">
              {item.vehicleName}
            </p>
            <p className="mt-1 text-xs text-slate-500">{item.vehiclePlate}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <Users className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
          <div>
            <p className="text-sm font-bold text-slate-950">
              {item.participants[0]?.name ?? `${item.participantCount} Peserta`}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {item.participants[0]?.packageName ?? `${item.evaluatedCount} sudah dinilai`}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        {item.focus}
      </p>

      {item.inputUnavailableReason ? (
        <p className="mt-5 rounded-2xl bg-slate-50 p-3 text-xs font-medium leading-5 text-slate-500">
          {item.inputUnavailableReason}
        </p>
      ) : null}

      <Button
        fullWidth
        className={`mt-5 rounded-xl text-sm font-bold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 ${getActionClass(item)}`}
        leftIcon={getActionIcon(item)}
        disabled={isActionDisabled(item)}
        onClick={() => {
          if (!isActionDisabled(item)) navigate(getInputPath(item));
        }}
      >
        {getActionLabel(item)}
      </Button>
    </Card>
  );
}

export default function TrainingResultTable({
  items,
  pagination,
  onPageChange,
}: TrainingResultTableProps) {
  const navigate = useNavigate();
  const EmptyIcon = trainingResultIcons.empty;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<EmptyIcon className="h-7 w-7" />}
        title={trainingResultEmptyMessage.title}
        description={trainingResultEmptyMessage.description}
      />
    );
  }

  return (
    <>
      <div className="grid gap-5 lg:hidden">
        {items.map((item) => (
          <TrainingResultMobileCard key={item.id} item={item} />
        ))}
      </div>

      <TableWrapper className="hidden rounded-3xl border-0 shadow-xl shadow-slate-200/70 lg:block">
        <Table>
          <TableHead className="bg-white">
            <TableRow>
              <TableHeaderCell className="py-4 text-slate-400">
                Sesi
              </TableHeaderCell>
              <TableHeaderCell className="py-4 text-slate-400">
                Jadwal
              </TableHeaderCell>
              <TableHeaderCell className="py-4 text-slate-400">
                Kendaraan
              </TableHeaderCell>
              <TableHeaderCell className="py-4 text-slate-400">
                Peserta
              </TableHeaderCell>
              <TableHeaderCell className="py-4 text-slate-400">
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
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700">
                    {item.sessionCode}
                  </p>
                  {item.sessionLabel ? (
                    <p className="mt-2 inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-blue-700">
                      {item.sessionLabel}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm font-bold text-slate-950">
                    {item.focus}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500">
                    {item.lastUpdated}
                  </p>
                </TableCell>

                <TableCell className="px-5 py-5">
                  <div className="flex gap-3">
                    <CalendarDays className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.day}, {item.date}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {item.time}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-5">
                  <div className="flex gap-3">
                    <Car className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.vehicleName}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {item.vehiclePlate}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-5">
                  <div className="flex gap-3">
                    <Users className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.participants[0]?.name ?? `${item.participantCount} Peserta`}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {item.participants[0]?.packageName ?? `${item.evaluatedCount} sudah dinilai`}
                      </p>
                    </div>
                  </div>
                </TableCell>

                <TableCell className="px-5 py-5">
                  <TrainingResultStatusBadge status={item.status} />
                </TableCell>

                <TableCell className="px-5 py-5 text-right">
                  {item.inputUnavailableReason ? (
                    <p className="mb-2 text-right text-[11px] font-medium leading-4 text-slate-500">
                      {item.inputUnavailableReason}
                    </p>
                  ) : null}
                  <Button
                    size="sm"
                    className={`min-w-28 rounded-xl text-xs font-bold uppercase tracking-[0.08em] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 ${getActionClass(item)}`}
                    leftIcon={getActionIcon(item)}
                    disabled={isActionDisabled(item)}
                    onClick={() => {
                      if (!isActionDisabled(item)) navigate(getInputPath(item));
                    }}
                  >
                    {getActionLabel(item)}
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
                Menampilkan {items.length} dari {pagination?.total ?? items.length} data hasil latihan
              </span>
            }
            onPageChange={onPageChange ?? (() => undefined)}
          />
        </TableFooter>
      </TableWrapper>
    </>
  );
}
