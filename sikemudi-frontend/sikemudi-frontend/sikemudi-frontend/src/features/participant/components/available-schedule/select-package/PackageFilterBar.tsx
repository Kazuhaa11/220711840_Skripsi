import { useEffect, useState } from "react";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import type {
  CategoryFilter,
  ServiceTypeFilter,
} from "@/features/participant/components/available-schedule/SelectPackageView";
import { SlidersHorizontal } from "lucide-react";

interface PackageFilterBarProps {
  serviceType: ServiceTypeFilter;
  serviceTypeOptions: ServiceTypeFilter[];
  onChangeServiceType: (value: ServiceTypeFilter) => void;
  category: CategoryFilter;
  categoryOptions: CategoryFilter[];
  onChangeCategory: (value: CategoryFilter) => void;
  keyword: string;
  onChangeKeyword: (value: string) => void;
}

export default function PackageFilterBar({
  serviceType,
  serviceTypeOptions,
  onChangeServiceType,
  category,
  categoryOptions,
  onChangeCategory,
  keyword,
  onChangeKeyword,
}: PackageFilterBarProps) {
  const [filterOpened, setFilterOpened] = useState(false);
  const [draftServiceType, setDraftServiceType] = useState<ServiceTypeFilter>(serviceType);
  const [draftCategory, setDraftCategory] = useState<CategoryFilter>(category);

  useEffect(() => {
    if (!filterOpened) return;
    setDraftServiceType(serviceType);
    setDraftCategory(category);
  }, [category, filterOpened, serviceType]);

  const activeFilters = [
    serviceType !== "Semua" ? serviceType : null,
    category !== categoryOptions[0] ? category : null,
  ].filter(Boolean) as string[];

  function handleApplyFilter() {
    onChangeServiceType(draftServiceType);
    onChangeCategory(draftCategory);
    setFilterOpened(false);
  }

  function handleResetFilter() {
    const defaultService = serviceTypeOptions[0] ?? serviceType;
    const defaultCategory = categoryOptions[0] ?? category;
    setDraftServiceType(defaultService);
    setDraftCategory(defaultCategory);
    onChangeServiceType(defaultService);
    onChangeCategory(defaultCategory);
    setFilterOpened(false);
  }

  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(280px,420px)_auto] lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Cari Paket
          </p>
          <SearchInput
            value={keyword}
            onChange={(event) => onChangeKeyword(event.target.value)}
            onClear={() => onChangeKeyword("")}
            placeholder="Masukkan nama paket..."
            wrapperClassName="mt-2"
            className="h-11 border-0 bg-slate-100 focus:bg-white"
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <Button
              variant="outline"
              onClick={() => setFilterOpened(true)}
              leftIcon={<SlidersHorizontal className="h-4 w-4" />}
              className="h-10 rounded-full border-slate-200 px-4 text-xs font-bold uppercase tracking-wide text-slate-700"
            >
              Filter
            </Button>

            {activeFilters.length > 0 ? (
              <button
                type="button"
                onClick={handleResetFilter}
                className="h-10 rounded-full bg-blue-50 px-4 text-xs font-bold uppercase tracking-wide text-blue-700"
              >
                Reset
              </button>
            ) : null}
          </div>

          {activeFilters.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:justify-end">
              {activeFilters.map((item) => (
                <span
                  key={item}
                  className="shrink-0 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        opened={filterOpened}
        onClose={() => setFilterOpened(false)}
        title="Filter Paket"
        size="md"
        compact
        className="mt-auto max-h-[88dvh] rounded-b-none sm:mt-0 sm:rounded-3xl"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={handleResetFilter} className="h-11 rounded-2xl">
              Reset
            </Button>
            <Button onClick={handleApplyFilter} className="h-11 rounded-2xl">
              Terapkan
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Jenis Layanan
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {serviceTypeOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDraftServiceType(item)}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                    draftServiceType === item
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
              Kategori
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {categoryOptions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDraftCategory(item)}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                    draftCategory === item
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
