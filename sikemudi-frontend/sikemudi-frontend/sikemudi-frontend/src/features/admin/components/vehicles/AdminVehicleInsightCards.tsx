import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import {
  adminVehicleInsuranceInfo,
  adminVehicleMaintenanceSuggestion,
} from "@/features/admin/constants/vehicles";

export default function AdminVehicleInsightCards() {
  const InsuranceIcon = adminVehicleInsuranceInfo.icon;

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="rounded-3xl p-5 shadow-sm">
        <span className="inline-flex rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
          {adminVehicleMaintenanceSuggestion.badge}
        </span>

        <h2 className="mt-5 max-w-xl text-xl font-bold leading-tight text-slate-950">
          {adminVehicleMaintenanceSuggestion.title}
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-6 text-slate-600">
          {adminVehicleMaintenanceSuggestion.description}
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="ghost"
            className="px-0 font-bold text-blue-700 hover:bg-transparent"
          >
            Lihat Daftar Kendaraan
          </Button>

          <Button
            variant="ghost"
            className="px-0 font-bold text-slate-400 hover:bg-transparent"
          >
            Ingatkan Nanti
          </Button>
        </div>
      </Card>

      <Card className="rounded-3xl bg-slate-950 p-5 text-white shadow-xl shadow-slate-900/15">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
          <InsuranceIcon className="h-5 w-5" />
        </div>

        <h2 className="mt-5 text-lg font-bold text-white">
          {adminVehicleInsuranceInfo.title}
        </h2>

        <p className="mt-4 text-base leading-6 text-slate-300">
          {adminVehicleInsuranceInfo.description}
        </p>

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span>{adminVehicleInsuranceInfo.healthLabel}</span>
            <span>{adminVehicleInsuranceInfo.healthValue}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${adminVehicleInsuranceInfo.healthValue}%` }}
            />
          </div>
        </div>
      </Card>
    </section>
  );
}
