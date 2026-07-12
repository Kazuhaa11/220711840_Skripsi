import PageHeader from "@/components/common/PageHeader";
import SearchInput from "@/components/common/SearchInput";
import { trainingSessionHeader } from "@/features/instructor/constants/trainingSession";

interface TrainingSessionHeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
}

export default function TrainingSessionHeader({
  searchValue,
  onSearchChange,
  onClearSearch,
}: TrainingSessionHeaderProps) {
  return (
    <PageHeader
      title={trainingSessionHeader.title}
      description={trainingSessionHeader.subtitle}
      className="mb-0 gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:px-6 sm:py-4 lg:items-center lg:px-7"
      contentClassName="border-l-2 border-blue-600 pl-3 sm:pl-4"
      titleClassName="text-lg leading-tight sm:text-2xl"
      descriptionClassName="mt-1 max-w-2xl text-xs font-medium leading-5 text-slate-600 sm:text-sm"
      actionsClassName="flex w-full flex-col gap-3 lg:max-w-160"
      actions={
        <SearchInput
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          onClear={onClearSearch}
          placeholder="Cari hari atau slot..."
          wrapperClassName="min-w-0"
          className="h-9 border-slate-200 bg-slate-50 text-xs sm:h-10 sm:text-sm"
        />
      }
    />
  );
}
