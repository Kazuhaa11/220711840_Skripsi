import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrapper,
} from "@/components/ui/Table";
import type { ParticipantDashboardBookingHistoryItem } from "@/types/dashboard";

interface BookingHistorySectionProps {
  histories: ParticipantDashboardBookingHistoryItem[];
}

function getBadgeVariant(status: string): "success" | "danger" | "info" | "warning" {
  if (status === "SELESAI") return "success";
  if (status === "DIBATALKAN") return "danger";
  if (status.includes("KONFIRMASI")) return "info";
  return "warning";
}

export default function BookingHistorySection({ histories }: BookingHistorySectionProps) {
  return (
    <section>
      <h3 className="text-base font-bold uppercase tracking-[0.16em] text-slate-800 sm:text-2xl sm:tracking-[0.2em]">
        Riwayat Booking
      </h3>

      {histories.length === 0 ? (
        <div className="mt-4 sm:mt-6">
          <EmptyState
            title="Belum ada riwayat booking"
            description="Riwayat booking terbaru akan muncul setelah Anda melakukan booking jadwal latihan."
          />
        </div>
      ) : (
        <>
          <div className="mt-4 space-y-2 sm:hidden">
            {histories.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-950">
                      {item.tanggal_label ?? item.tanggal ?? "-"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.sesi} • {item.instruktur}
                    </p>
                  </div>
                  <Badge variant={getBadgeVariant(item.status_label)} className="shrink-0 px-2 text-[10px]">
                    {item.status_label}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <TableWrapper className="mt-6 hidden sm:block">
            <Table>
              <TableHead>
                <TableRow className="border-b-0">
                  <TableHeaderCell className="py-5 text-xs tracking-[0.2em] text-slate-600">
                    Tanggal
                  </TableHeaderCell>
                  <TableHeaderCell className="py-5 text-xs tracking-[0.2em] text-slate-600">
                    Sesi
                  </TableHeaderCell>
                  <TableHeaderCell className="py-5 text-xs tracking-[0.2em] text-slate-600">
                    Instruktur
                  </TableHeaderCell>
                  <TableHeaderCell className="py-5 text-xs tracking-[0.2em] text-slate-600">
                    Status
                  </TableHeaderCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {histories.map((item) => (
                  <TableRow key={item.id} className="border-t border-slate-100">
                    <TableCell className="py-5 text-base text-slate-800">
                      {item.tanggal_label ?? item.tanggal ?? "-"}
                    </TableCell>
                    <TableCell className="py-5 text-base text-slate-800">
                      {item.sesi}
                    </TableCell>
                    <TableCell className="py-5 text-base text-slate-800">
                      {item.instruktur}
                    </TableCell>
                    <TableCell className="py-5">
                      <Badge variant={getBadgeVariant(item.status_label)}>
                        {item.status_label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableWrapper>
        </>
      )}
    </section>
  );
}
