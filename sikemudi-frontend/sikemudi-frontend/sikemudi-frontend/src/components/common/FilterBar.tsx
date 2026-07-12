import type { ReactNode } from "react";
import Card from "@/components/ui/Card";
import SearchInput from "@/components/common/SearchInput";
import { cn } from "@/lib/cn";

interface FilterBarProps {
  children?: ReactNode;
  actions?: ReactNode;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onSearchClear?: () => void;
  searchClassName?: string;
  className?: string;
  contentClassName?: string;
}

export default function FilterBar({
  children,
  actions,
  searchValue,
  searchPlaceholder,
  onSearchChange,
  onSearchClear,
  searchClassName,
  className,
  contentClassName,
}: FilterBarProps) {
  const hasSearch = searchValue !== undefined && onSearchChange;

  return (
    <Card className={cn("rounded-3xl p-4 shadow-sm sm:p-5", className)}>
      <div
        className={cn(
          "flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between",
          contentClassName,
        )}
      >
        <div className="grid flex-1 gap-3">
          {hasSearch ? (
            <SearchInput
              value={searchValue}
              placeholder={searchPlaceholder}
              onChange={(event) => onSearchChange(event.target.value)}
              onClear={onSearchClear}
              className={searchClassName}
            />
          ) : null}
          {children}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-3">{actions}</div>
        ) : null}
      </div>
    </Card>
  );
}
