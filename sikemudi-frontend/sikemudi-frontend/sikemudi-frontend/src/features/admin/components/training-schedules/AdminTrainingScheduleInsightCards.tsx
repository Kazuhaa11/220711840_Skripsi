import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  adminTrainingScheduleDownload,
  adminTrainingScheduleInsight,
} from "@/features/admin/constants/trainingSchedules";

export default function AdminTrainingScheduleInsightCards() {
  const InsightIcon = adminTrainingScheduleInsight.icon;
  const DownloadIcon = adminTrainingScheduleDownload.icon;

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
      <Card className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/15">
        <h2 className="text-lg font-bold text-white">
          {adminTrainingScheduleInsight.title}
        </h2>

        <p className="mt-4 max-w-2xl text-base leading-6 text-slate-300">
          {adminTrainingScheduleInsight.description}
        </p>

        <Button
          variant="outline"
          size="lg"
          className="mt-5 rounded-2xl border-white bg-white px-5 font-bold uppercase tracking-[0.08em] text-slate-950 hover:bg-slate-100"
        >
          Lihat Analisis Detail
        </Button>

        <div className="mt-5 flex justify-end text-white/10">
          <InsightIcon className="h-28 w-28" />
        </div>
      </Card>

      <Card className="rounded-3xl p-5 text-center shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
          <DownloadIcon className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-lg font-bold text-slate-950">
          {adminTrainingScheduleDownload.title}
        </h2>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {adminTrainingScheduleDownload.description}
        </p>

        <div className="mt-5 flex justify-center gap-3">
          <Button variant="outline" size="sm" className="rounded-xl font-bold">
            PDF
          </Button>

          <Button variant="outline" size="sm" className="rounded-xl font-bold">
            Excel
          </Button>
        </div>
      </Card>
    </section>
  );
}
