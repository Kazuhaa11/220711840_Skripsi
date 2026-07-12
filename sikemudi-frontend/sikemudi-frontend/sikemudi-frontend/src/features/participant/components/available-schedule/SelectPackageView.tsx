import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Bus, GraduationCap } from "lucide-react";
import Button from "@/components/ui/Button";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import type { SelectedCoursePackage } from "@/features/participant/hooks/useSelectedCoursePackage";
import SelectPackageHeader from "@/features/participant/components/available-schedule/select-package/SelectPackageHeader";
import PackageFilterBar from "@/features/participant/components/available-schedule/select-package/PackageFilterBar";
import SelectedPackageSummary from "@/features/participant/components/available-schedule/select-package/SelectedPackageSummary";
import CoursePackageGrid from "@/features/participant/components/available-schedule/select-package/CoursePackageGrid";
import ImportantInfoCard from "@/features/participant/components/available-schedule/select-package/ImportantInfoCard";
import QuickHelpCard from "@/features/participant/components/available-schedule/select-package/QuickHelpCard";
import PackageBenefitsSection from "@/features/participant/components/available-schedule/select-package/PackageBenefitsSection";
import { getPublicCoursePackages } from "@/services/booking.service";
import { mapCoursePackageToCard, resolveSelectedPackagePrice } from "@/features/participant/utils/bookingMapper";

export type ServiceTypeFilter = "Semua" | "Antar Jemput" | "Tanpa Antar Jemput";
export type CategoryFilter = "Tanpa SIM" | "Dengan SIM";

export interface CoursePackageItem {
  id: string;
  name: string;
  duration: string;
  durationHours: number;
  summary: string;
  icon: LucideIcon;
  prices: {
    standard: string;
    antarJemput: string;
    denganSim: string;
    denganSimAntarJemput: string;
  };
  rawPrices: {
    standard: number;
    antarJemput: number;
    denganSim: number;
    denganSimAntarJemput: number;
  };
}

interface SelectPackageViewProps {
  onSelectPackage?: (coursePackage: SelectedCoursePackage) => void;
}

const serviceTypeOptions: ServiceTypeFilter[] = [
  "Semua",
  "Antar Jemput",
  "Tanpa Antar Jemput",
];

const categoryOptions: CategoryFilter[] = ["Tanpa SIM", "Dengan SIM"];

function resolveSelectedOptions(serviceType: ServiceTypeFilter, category: CategoryFilter) {
  const pakaiAntarJemput = serviceType === "Antar Jemput";
  const pakaiSim = category === "Dengan SIM";

  return {
    pakaiAntarJemput,
    pakaiSim,
    serviceType: pakaiAntarJemput ? "Antar Jemput" : "Tanpa Antar Jemput",
    category,
  };
}

export default function SelectPackageView({
  onSelectPackage,
}: SelectPackageViewProps) {
  const [serviceType, setServiceType] = useState<ServiceTypeFilter>("Semua");
  const [category, setCategory] = useState<CategoryFilter>("Tanpa SIM");
  const [keyword, setKeyword] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [packages, setPackages] = useState<CoursePackageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadPackages() {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await getPublicCoursePackages();
      const mappedPackages = response.items.map(mapCoursePackageToCard);

      setPackages(mappedPackages);
      setSelectedPackageId((current) => {
        if (!current) return null;
        return mappedPackages.some((item) => item.id === current) ? current : null;
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Data paket kursus gagal dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadPackages();
  }, []);

  const filteredPackages = useMemo(() => {
    return packages.filter((item) =>
      item.name.toLowerCase().includes(keyword.toLowerCase()),
    );
  }, [keyword, packages]);

  const selectedPackageSummary = useMemo(() => {
    if (!selectedPackageId) return null;

    const foundPackage = packages.find((item) => item.id === selectedPackageId);
    if (!foundPackage) return null;

    const options = resolveSelectedOptions(serviceType, category);
    const resolvedPrice = resolveSelectedPackagePrice(
      foundPackage,
      options.pakaiAntarJemput,
      options.pakaiSim,
    );

    return {
      id: foundPackage.id,
      name: foundPackage.name,
      duration: foundPackage.duration,
      durationHours: foundPackage.durationHours,
      serviceType: options.serviceType,
      category: options.category,
      price: resolvedPrice.label,
      priceValue: resolvedPrice.value,
      pakaiAntarJemput: options.pakaiAntarJemput,
      pakaiSim: options.pakaiSim,
    };
  }, [category, packages, selectedPackageId, serviceType]);

  return (
    <div className="mx-auto max-w-7xl overflow-x-hidden">
      <section className="rounded-2xl bg-[#eef3f9] p-3 sm:rounded-[28px] sm:p-6 lg:p-7">
        <SelectPackageHeader />

        <div className="mt-5 sm:mt-8">
          <PackageFilterBar
            serviceType={serviceType}
            serviceTypeOptions={serviceTypeOptions}
            onChangeServiceType={setServiceType}
            category={category}
            categoryOptions={categoryOptions}
            onChangeCategory={setCategory}
            keyword={keyword}
            onChangeKeyword={setKeyword}
          />
        </div>

        <div className="mt-5">
          <SelectedPackageSummary
            selectedPackage={selectedPackageSummary}
            onContinue={() => {
              if (!selectedPackageSummary || !onSelectPackage) return;

              onSelectPackage(selectedPackageSummary);
            }}
          />
        </div>

        <div className="mt-5 sm:mt-8">
          {isLoading ? (
            <LoadingSpinner label="Memuat paket kursus..." />
          ) : errorMessage ? (
            <ErrorMessage
              title="Paket kursus gagal dimuat"
              message={errorMessage}
              action={
                <Button variant="outline" onClick={() => void loadPackages()}>
                  Coba Lagi
                </Button>
              }
            />
          ) : (
            <CoursePackageGrid
              packages={filteredPackages}
              selectedPackageId={selectedPackageId}
              onSelectPackage={setSelectedPackageId}
            />
          )}
        </div>

        <div className="mt-5 grid gap-4 sm:mt-8 sm:gap-5 xl:grid-cols-[1fr_340px]">
          <ImportantInfoCard
            items={[
              {
                icon: BadgeCheck,
                text: "Seluruh paket sudah termasuk sertifikat pelatihan resmi yang diakui secara nasional.",
              },
              {
                icon: GraduationCap,
                text: "Pemilihan paket adalah langkah awal dan bukan merupakan booking jadwal tetap.",
              },
            ]}
          />

          <QuickHelpCard
            title="Bantuan Cepat"
            description="Butuh konsultasi paket yang paling cocok untuk kebutuhan Anda?"
          />
        </div>

        <div className="mt-6 sm:mt-10">
          <PackageBenefitsSection
            items={[
              {
                icon: GraduationCap,
                title: "Instruktur Profesional",
                description:
                  "Dilatih dengan standar kurikulum nasional untuk memastikan keamanan Anda.",
              },
              {
                icon: Bus,
                title: "Kendaraan Modern",
                description:
                  "Armada terbaru dengan fitur keamanan ganda dan perawatan berkala.",
              },
              {
                icon: BadgeCheck,
                title: "Sertifikasi Nasional",
                description:
                  "Sertifikat kursus yang memudahkan proses pengurusan dokumen berkendara.",
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
