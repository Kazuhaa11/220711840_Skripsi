import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { SelectedCoursePackage } from "@/features/participant/hooks/useSelectedCoursePackage";

interface ActivePackageSummaryCardProps {
  selectedPackage: SelectedCoursePackage;
  onChangePackage: () => void;
}

export default function ActivePackageSummaryCard({
  selectedPackage,
  onChangePackage,
}: ActivePackageSummaryCardProps) {
  return (
    <Card className="rounded-[22px] bg-[linear-gradient(180deg,#182f5d_0%,#1f3765_100%)] px-5 py-4 text-white shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[repeat(5,1fr)_180px] xl:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
            Paket Aktif
          </p>
          <p className="mt-1 text-[1.15rem] font-semibold text-white">
            {selectedPackage.name}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
            Durasi
          </p>
          <p className="mt-1 text-base text-white">
            {selectedPackage.duration}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
            Layanan
          </p>
          <p className="mt-1 text-base text-white">
            {selectedPackage.serviceType}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
            Kategori
          </p>
          <p className="mt-1 text-base text-white">
            {selectedPackage.category}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
            Harga Informasi
          </p>
          <p className="mt-1 text-base text-white">{selectedPackage.price}</p>
        </div>

        <Button
          variant="secondary"
          className="h-11 rounded-2xl bg-white/10 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-white/20"
          onClick={onChangePackage}
        >
          Ganti Paket
        </Button>
      </div>
    </Card>
  );
}
