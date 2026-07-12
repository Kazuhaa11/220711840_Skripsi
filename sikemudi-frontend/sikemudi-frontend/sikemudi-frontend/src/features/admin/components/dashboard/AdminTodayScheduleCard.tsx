import { NavLink } from "react-router-dom";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import type { AdminDashboardTodaySchedule } from "@/types/dashboard";

interface AdminTodayScheduleCardProps {
  dateLabel: string;
  schedules: AdminDashboardTodaySchedule[];
}

const statusClass: Record<string, string> = {
  Selesai: "bg-emerald-900 text-white",
  Berlangsung: "bg-blue-600 text-white",
  "Akan Datang": "bg-slate-100 text-slate-700",
  Tersedia: "bg-blue-100 text-blue-700",
  Penuh: "bg-amber-100 text-amber-700",
  Dibatalkan: "bg-red-100 text-red-700",
};

function ScheduleStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      className={cn(
        "px-4 py-1.5 font-bold",
        statusClass[status] ?? "bg-slate-100 text-slate-700",
      )}
    >
      {status}
    </Badge>
  );
}

export default function AdminTodayScheduleCard({
  dateLabel,
  schedules,
}: AdminTodayScheduleCardProps) {
  return (
    <Card className="rounded-3xl p-5 shadow-sm sm:p-5">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-950">
            Jadwal Hari Ini
          </h2>
          <p className="mt-1 text-sm text-slate-600">{dateLabel}</p>
        </div>

        <NavLink to="/admin/jadwal-latihan">
          <Button
            variant="ghost"
            className="px-0 font-bold text-blue-700 hover:bg-transparent"
          >
            Lihat Kalender
          </Button>
        </NavLink>
      </div>

      {schedules.length === 0 ? (
        <EmptyState
          title="Belum ada jadwal hari ini"
          description="Jadwal latihan yang berlangsung hari ini akan tampil di sini."
        />
      ) : (
        <Table>
          <TableHead className="bg-white">
            <TableRow>
              <TableHeaderCell className="px-0 text-slate-400">
                Waktu
              </TableHeaderCell>
              <TableHeaderCell className="text-slate-400">
                Instruktur
              </TableHeaderCell>
              <TableHeaderCell className="text-slate-400">
                Kendaraan
              </TableHeaderCell>
              <TableHeaderCell className="text-slate-400">
                Peserta
              </TableHeaderCell>
              <TableHeaderCell className="text-slate-400">
                Status
              </TableHeaderCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {schedules.map((item) => (
              <TableRow key={item.id} className="border-slate-100">
                <TableCell className="px-0 py-5 font-bold text-slate-950">
                  {item.waktu?.label ?? "-"}
                </TableCell>
                <TableCell className="py-5 font-medium text-slate-900">
                  {item.instruktur?.nama_instruktur ?? "-"}
                </TableCell>
                <TableCell className="py-5 text-slate-700">
                  {item.kendaraan?.label ?? item.kendaraan?.nama_kendaraan ?? "-"}
                </TableCell>
                <TableCell className="py-5 font-bold text-slate-950">
                  {item.peserta}/{item.kapasitas}
                </TableCell>
                <TableCell className="py-5">
                  <ScheduleStatusBadge status={item.status_label ?? item.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
