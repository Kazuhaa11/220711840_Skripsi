import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  adminCoursePackageGuide,
  adminCoursePackagePerformance,
} from "@/features/admin/constants/coursePackages";

export default function AdminCoursePackageInsightCards() {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="rounded-3xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-950">
            {adminCoursePackagePerformance.title}
          </h2>

          <Button
            variant="ghost"
            className="px-0 font-bold text-blue-700 hover:bg-transparent"
          >
            Lihat Detail
          </Button>
        </div>

        <div className="mt-5 space-y-5">
          {adminCoursePackagePerformance.items.map((item) => (
            <div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-700">
                  {item.label}
                </p>
                <p className="text-xs font-bold uppercase text-slate-700">
                  {item.value}% Popularitas
                </p>
              </div>

              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-950"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/15">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">
          Panduan Admin
        </p>

        <h2 className="mt-5 text-xl font-bold leading-tight text-white">
          {adminCoursePackageGuide.title}
        </h2>

        <p className="mt-5 text-base leading-6 text-slate-300">
          {adminCoursePackageGuide.description}
        </p>

        <Button
          variant="outline"
          fullWidth
          size="lg"
          className="mt-5 rounded-2xl border-white bg-white font-bold uppercase tracking-widest text-slate-950 hover:bg-slate-100"
        >
          Pelajari Sekarang
        </Button>
      </Card>
    </section>
  );
}
