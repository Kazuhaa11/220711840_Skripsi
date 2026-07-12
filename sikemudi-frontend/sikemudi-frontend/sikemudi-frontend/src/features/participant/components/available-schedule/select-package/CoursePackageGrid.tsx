import EmptyState from "@/components/ui/EmptyState";
import type { CoursePackageItem } from "@/features/participant/components/available-schedule/SelectPackageView";
import CoursePackageCard from "@/features/participant/components/available-schedule/select-package/CoursePackageCard";
import { PackageSearch } from "lucide-react";

interface CoursePackageGridProps {
  packages: CoursePackageItem[];
  selectedPackageId: string | null;
  onSelectPackage: (id: string) => void;
}

export default function CoursePackageGrid({
  packages,
  selectedPackageId,
  onSelectPackage,
}: CoursePackageGridProps) {
  if (packages.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="h-7 w-7" />}
        title="Paket tidak ditemukan"
        description="Coba gunakan kata kunci lain atau reset pencarian paket kursus."
      />
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-4">
      {packages.map((item) => (
        <CoursePackageCard
          key={item.id}
          item={item}
          isSelected={selectedPackageId === item.id}
          onSelect={() => onSelectPackage(item.id)}
        />
      ))}
    </div>
  );
}
