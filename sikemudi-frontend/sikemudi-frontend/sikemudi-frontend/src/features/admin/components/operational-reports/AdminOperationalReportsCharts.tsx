import { FileSpreadsheet, LineChart, UserCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import { adminOperationalReportInsight } from "@/features/admin/constants/operationalReports";
import type { AdminOperationalReportSummaryStats } from "@/types/adminOperationalReport";

interface AdminOperationalReportsChartsProps {
  stats?: AdminOperationalReportSummaryStats;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AdminOperationalReportsCharts({
  stats,
}: AdminOperationalReportsChartsProps) {
  const summaryCards = [
    {
      title: "Pendapatan Bersih",
      value: formatCurrency(stats?.netRevenue ?? 0),
      description: "Uang masuk dikurangi refund. Refund real akan aktif setelah patch refund booking.",
      icon: FileSpreadsheet,
    },
    {
      title: "Total Refund",
      value: formatCurrency(stats?.refundAmount ?? 0),
      description: "Saat ini masih 0 karena tabel refund belum ditambahkan.",
      icon: UserCheck,
    },
    {
      title: "Output Pembelajaran",
      value: `${stats?.graduationRate ?? 0}% Lulus`,
      description: "Kelulusan dihitung dari hasil latihan final yang sudah memiliki status akhir.",
      icon: LineChart,
    },
  ];

  return (
    <aside className="space-y-5">
      <Card className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/15">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-400">
          {adminOperationalReportInsight.title}
        </p>

        <p className="mt-5 text-base leading-6 text-slate-200">
          {adminOperationalReportInsight.description}
        </p>
      </Card>

      {summaryCards.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title} className="rounded-3xl p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                <Icon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {item.title}
                </p>
                <p className="mt-2 text-base font-bold text-slate-950">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {item.description}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </aside>
  );
}
