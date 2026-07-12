import PageHeader from "@/components/common/PageHeader";
import SearchInput from "@/components/common/SearchInput";
import { teachingScheduleHeader } from "@/features/instructor/constants/teachingSchedule";

interface TeachingScheduleHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export default function TeachingScheduleHeader({
  searchValue,
  onSearchChange,
  onClearSearch,
}: TeachingScheduleHeaderProps) {
  return (
    <PageHeader
      title={teachingScheduleHeader.title}
      description={teachingScheduleHeader.subtitle}
      className="mb-0 gap-5 border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:items-center lg:px-8"
      contentClassName="border-l-2 border-blue-600 pl-5"
      titleClassName="text-2xl sm:text-2xl"
      descriptionClassName="mt-1 text-sm font-medium leading-6 text-slate-600"
      actionsClassName="w-full lg:max-w-105"
      actions={
        <SearchInput
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          onClear={onClearSearch}
          placeholder="Cari jadwal, paket, kendaraan..."
          wrapperClassName="w-full"
          className="border-slate-100 bg-slate-100"
        />
      }
    />
  );
}
