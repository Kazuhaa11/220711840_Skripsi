import SelectPackageView from "@/features/participant/components/available-schedule/SelectPackageView";
import AvailableScheduleView from "@/features/participant/components/available-schedule/AvailableScheduleView";
import { useSelectedCoursePackage } from "@/features/participant/hooks/useSelectedCoursePackage";

export default function AvailableSchedulePage() {
  const { selectedPackage, saveSelectedPackage, clearSelectedPackage } =
    useSelectedCoursePackage();

  if (!selectedPackage) {
    return <SelectPackageView onSelectPackage={saveSelectedPackage} />;
  }

  return (
    <AvailableScheduleView
      selectedPackage={selectedPackage}
      onChangePackage={clearSelectedPackage}
    />
  );
}
