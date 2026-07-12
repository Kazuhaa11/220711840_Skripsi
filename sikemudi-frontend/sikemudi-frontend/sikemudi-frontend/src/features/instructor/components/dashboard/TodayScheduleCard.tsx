import { NavLink } from "react-router-dom";
import { ListChecks } from "lucide-react";
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
import { normalizeDashboardStatus } from "@/features/dashboard/utils/dashboardMapper";
import type { InstructorDashboardTodaySchedule } from "@/types/dashboard";

interface TodayScheduleCardProps {
  schedules: InstructorDashboardTodaySchedule[];
}

function getStatusBadge(status: string) {
  const normalizedStatus = normalizeDashboardStatus(status);

  if (normalizedStatus === "BERLANGSUNG" || normalizedStatus === "SELESAI") {
    return (
      <Badge variant="success" className="text-[11px] font-bold">
        {normalizedStatus}
      </Badge>
    );
  }

  if (normalizedStatus === "DIBATALKAN") {
    return (
      <Badge variant="danger" className="text-[11px] font-bold">
        {normalizedStatus}
      </Badge>
    );
  }

  return (
    <Badge variant="default" className="text-[11px] font-bold">
      {normalizedStatus}
    </Badge>
  );
}

function getActionLabel(item: InstructorDashboardTodaySchedule): string {
  if (item.aksi.can_input_result) return "Input Hasil";
  if (item.aksi.can_open_session) return "Buka Sesi";
  return "Lihat Detail";
}

export default function TodayScheduleCard({ schedules }: TodayScheduleCardProps) {
  return (
    <Card className="rounded-3xl px-5 py-5 sm:px-6 lg:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <ListChecks className="h-5 w-5 text-blue-700" />
          <h2 className="text-lg font-extrabold tracking-tight text-slate-950">
            Jadwal Hari Ini
          </h2>
        </div>

        <NavLink to="/instruktur/jadwal-mengajar">
          <Button
            variant="ghost"
            className="justify-start px-0 font-bold text-blue-700 hover:bg-transparent hover:text-blue-800 sm:justify-center"
          >
            Selengkapnya
          </Button>
        </NavLink>
      </div>

      {schedules.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="Belum ada jadwal hari ini"
            description="Jadwal mengajar instruktur untuk hari ini akan tampil di sini."
          />
        </div>
      ) : (
        <>
          <div className="mt-5 hidden lg:block">
            <Table>
              <TableHead className="bg-white">
                <TableRow className="border-b-0">
                  <TableHeaderCell className="px-4 pb-5 pt-0">
                    Jam
                  </TableHeaderCell>
                  <TableHeaderCell className="px-4 pb-5 pt-0">
                    Kendaraan
                  </TableHeaderCell>
                  <TableHeaderCell className="px-4 pb-5 pt-0">
                    Peserta
                  </TableHeaderCell>
                  <TableHeaderCell className="px-4 pb-5 pt-0">
                    Status
                  </TableHeaderCell>
                  <TableHeaderCell className="px-4 pb-5 pt-0 text-right">
                    Aksi
                  </TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody className="bg-transparent">
                {schedules.map((item) => (
                  <TableRow
                    key={item.id}
                    className="border-b-10 border-b-white bg-slate-50 last:border-b-0"
                  >
                    <TableCell className="rounded-l-2xl px-4 py-4">
                      <p className="text-sm font-bold text-slate-950">
                        {item.jam?.label ?? "-"}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {item.tanggal_latihan ?? "-"}
                      </p>
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-950">
                        {item.kendaraan?.label ?? item.kendaraan?.nama_kendaraan ?? "-"}
                      </p>
                      <p className="mt-1 text-xs font-medium tracking-[0.18em] text-slate-500">
                        {item.kendaraan?.nomor_plat ?? "-"}
                      </p>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-sm font-bold text-slate-950">
                      {item.peserta}/{item.kapasitas} Peserta
                    </TableCell>

                    <TableCell className="px-4 py-4">
                      {getStatusBadge(item.status_label)}
                    </TableCell>

                    <TableCell className="rounded-r-2xl px-4 py-4 text-right">
                      <Button
                        variant={item.aksi.can_input_result ? "primary" : "ghost"}
                        size="sm"
                        className={
                          item.aksi.can_input_result
                            ? "rounded-xl bg-slate-950 text-[10px] font-bold uppercase hover:bg-slate-800"
                            : "px-0 text-[10px] font-bold uppercase text-blue-700 hover:bg-transparent"
                        }
                      >
                        {getActionLabel(item)}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 space-y-3 lg:hidden">
            {schedules.map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-base font-bold text-slate-950">
                      {item.jam?.label ?? "-"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {item.tanggal_latihan ?? "-"}
                    </p>
                  </div>

                  {getStatusBadge(item.status_label)}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Kendaraan
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {item.kendaraan?.label ?? item.kendaraan?.nama_kendaraan ?? "-"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.kendaraan?.nomor_plat ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Peserta
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {item.peserta}/{item.kapasitas} Peserta
                    </p>
                  </div>
                </div>

                <Button
                  fullWidth
                  size="sm"
                  variant={item.aksi.can_input_result ? "primary" : "outline"}
                  className={
                    item.aksi.can_input_result
                      ? "mt-4 rounded-xl bg-slate-950 hover:bg-slate-800"
                      : "mt-4 rounded-xl"
                  }
                >
                  {getActionLabel(item)}
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
