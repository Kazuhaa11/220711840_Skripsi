import PageHeader from "@/components/common/PageHeader";
import SearchInput from "@/components/common/SearchInput";
import { trainingResultHeader } from "@/features/instructor/constants/trainingResult";

interface TrainingResultHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export default function TrainingResultHeader({
  searchValue,
  onSearchChange,
  onClearSearch,
}: TrainingResultHeaderProps) {
  return (
    <PageHeader
      title={trainingResultHeader.title}
      description={trainingResultHeader.subtitle}
      className="mb-0 gap-5 border-b border-slate-200 bg-white px-3 py-4 sm:px-6 sm:py-5 lg:items-center lg:px-8"
      contentClassName="border-l-2 border-blue-600 pl-3 sm:pl-5"
      titleClassName="text-xl leading-tight sm:text-2xl"
      descriptionClassName="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-600 sm:text-sm sm:leading-6"
      actionsClassName="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:max-w-130"
      actions={
        <SearchInput
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          onClear={onClearSearch}
          placeholder="Cari sesi, peserta, atau kendaraan..."
          wrapperClassName="flex-1"
          className="h-10 border-slate-200 bg-slate-50 text-sm"
        />
      }
    />
  );
}
