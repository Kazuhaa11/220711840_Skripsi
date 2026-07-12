import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { SelectedCoursePackage } from "@/features/participant/hooks/useSelectedCoursePackage";

interface SelectedPackageSummaryProps {
  selectedPackage: SelectedCoursePackage | null;
  onContinue: () => void;
}

export default function SelectedPackageSummary({
  selectedPackage,
  onContinue,
}: SelectedPackageSummaryProps) {
  return (
    <Card className="rounded-[22px] bg-[linear-gradient(180deg,#182f5d_0%,#1f3765_100%)] px-5 py-4 text-white shadow-sm">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_repeat(4,0.8fr)_220px] xl:items-center">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
            Paket Terpilih
          </p>
          <p className="mt-1 text-[1.15rem] font-semibold text-white">
            {selectedPackage?.name ?? "Belum Ada Paket"}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
            Durasi
          </p>
          <p className="mt-1 text-base text-white">
            {selectedPackage?.duration ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
            Layanan
          </p>
          <p className="mt-1 text-base text-white">
            {selectedPackage?.serviceType ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
            Kategori
          </p>
          <p className="mt-1 text-base text-white">
            {selectedPackage?.category ?? "-"}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
            Total Harga
          </p>
          <p className="mt-1 text-base text-white">
            {selectedPackage?.price ?? "Rp 0"}
          </p>
        </div>

        <Button
          disabled={!selectedPackage}
          className="h-12 rounded-2xl bg-white/10 text-sm font-bold uppercase tracking-[0.08em] text-white hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={onContinue}
        >
          Lanjut ke Jadwal
        </Button>
      </div>
    </Card>
  );
}
