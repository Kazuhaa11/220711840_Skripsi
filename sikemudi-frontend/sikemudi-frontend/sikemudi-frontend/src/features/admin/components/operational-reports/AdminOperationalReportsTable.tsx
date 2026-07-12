import PaginationBar from "@/components/common/PaginationBar";
import Badge from "@/components/ui/Badge";
import Table, {
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrapper,
} from "@/components/ui/Table";
import type {
  AdminOperationalReportDefinition,
  AdminOperationalReportRow,
} from "@/features/admin/constants/operationalReports";

interface AdminOperationalReportsTableProps {
  report: AdminOperationalReportDefinition;
  rows: AdminOperationalReportRow[];
}

function formatCurrency(value: string | number) {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function StatusBadge({ value }: { value: string | number }) {
  const text = String(value);
  const className =
    text === "Aktif" ||
    text === "Cash" ||
    text === "Transfer Bank" ||
    text === "Terkonfirmasi" ||
    text === "Tervalidasi" ||
    text === "Terbit" ||
    text === "Lulus" ||
    text === "Hadir"
      ? "bg-green-100 text-green-700"
      : text === "Dalam Proses" ||
          text === "Menunggu Konfirmasi" ||
          text === "Menunggu Pembayaran" ||
          text === "Belum Validasi" ||
          text === "Belum Terbit"
        ? "bg-amber-100 text-amber-700"
        : text === "Dibatalkan" ||
            text === "Tidak Lulus" ||
            text === "Tidak Hadir" ||
            text === "Nonaktif" ||
            text === "Servis"
          ? "bg-red-100 text-red-700"
          : "bg-slate-100 text-slate-700";

  return <Badge className={`font-bold ${className}`}>{text}</Badge>;
}

export default function AdminOperationalReportsTable({
  report,
  rows,
}: AdminOperationalReportsTableProps) {
  return (
    <TableWrapper className="rounded-3xl border-0 shadow-xl shadow-slate-200/70">
      <div className="border-b border-slate-100 bg-white px-6 py-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
          {report.label}
        </p>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          {report.description}
        </p>
      </div>

      <Table>
        <TableHead className="bg-white">
          <TableRow>
            {report.columns.map((column) => (
              <TableHeaderCell
                key={column.key}
                className={
                  column.align === "right"
                    ? "text-right"
                    : column.align === "center"
                      ? "text-center"
                      : undefined
                }
              >
                {column.label}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.length > 0 ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {report.columns.map((column) => {
                  const value = row[column.key] ?? "-";

                  return (
                    <TableCell
                      key={`${row.id}-${column.key}`}
                      className={
                        column.align === "right"
                          ? "text-right font-semibold"
                          : column.align === "center"
                            ? "text-center"
                            : column.key.toLowerCase().includes("code") ||
                                column.key === "participant" ||
                                column.key === "vehicle" ||
                                column.key === "instructor"
                              ? "font-bold text-slate-950"
                              : undefined
                      }
                    >
                      {column.isStatus ? (
                        <StatusBadge value={value} />
                      ) : column.isCurrency ? (
                        formatCurrency(value)
                      ) : (
                        value
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={report.columns.length}
                className="py-12 text-center text-sm font-semibold text-slate-400"
              >
                Tidak ada data laporan yang sesuai dengan filter aktif.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TableFooter className="bg-slate-50">
        <PaginationBar
          currentPage={1}
          totalPages={1}
          label={`Menampilkan ${rows.length} data ${report.shortLabel.toLowerCase()}`}
          onPageChange={() => undefined}
        />
      </TableFooter>
    </TableWrapper>
  );
}
