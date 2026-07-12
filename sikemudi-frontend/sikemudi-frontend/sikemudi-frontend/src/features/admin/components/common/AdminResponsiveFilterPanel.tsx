import { useState, type ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import SearchInput from "@/components/common/SearchInput";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/cn";

interface AdminResponsiveFilterPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  activeCount?: number;
  onReset?: () => void;
  onApply?: () => void;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  onSearchClear?: () => void;
  className?: string;
  bodyClassName?: string;
  desktopClassName?: string;
}

export default function AdminResponsiveFilterPanel({
  title,
  description = "Atur filter data admin.",
  children,
  activeCount = 0,
  onReset,
  onApply,
  searchValue,
  searchPlaceholder = "Cari data...",
  onSearchChange,
  onSearchClear,
  className,
  bodyClassName,
  desktopClassName,
}: AdminResponsiveFilterPanelProps) {
  const [opened, setOpened] = useState(false);
  const hasCompactSearch = searchValue !== undefined && Boolean(onSearchChange);

  if (hasCompactSearch) {
    return (
      <>
        <Card
          className={cn(
            "rounded-3xl border-0 bg-slate-100/80 p-3 shadow-none sm:p-5",
            className,
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            <SearchInput
              value={searchValue}
              placeholder={searchPlaceholder}
              onChange={(event) => onSearchChange?.(event.target.value)}
              onClear={onSearchClear}
              className="h-11 rounded-2xl border-0 bg-white text-sm shadow-sm sm:h-12 sm:rounded-3xl"
            />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpened(true)}
              className="h-11 w-11 shrink-0 rounded-2xl bg-white p-0 text-slate-700 shadow-sm hover:bg-slate-50 sm:h-12 sm:w-12 sm:rounded-3xl"
              aria-label={activeCount > 0 ? `${activeCount} filter aktif` : "Buka filter"}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={title}
          description={description}
          size="md"
          compact
          footer={
            <div className={cn("grid gap-2", onReset ? "grid-cols-2" : "grid-cols-1")}>
              {onReset ? (
                <Button
                  variant="outline"
                  className="h-10 rounded-2xl text-xs font-bold"
                  onClick={() => {
                    onReset();
                    setOpened(false);
                  }}
                >
                  Reset
                </Button>
              ) : null}
              <Button
                className="h-10 rounded-2xl bg-slate-950 text-xs font-bold hover:bg-slate-800"
                onClick={() => {
                  onApply?.();
                  setOpened(false);
                }}
              >
                Terapkan
              </Button>
            </div>
          }
        >
          <div className={cn("space-y-3 overflow-x-hidden", bodyClassName)}>
            {children}
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <Card
        className={cn(
          "flex items-center justify-between gap-3 rounded-3xl p-3 shadow-sm lg:hidden",
          className,
        )}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
            Filter
          </p>
          <p className="mt-1 truncate text-sm font-bold text-slate-950">
            {activeCount > 0 ? `${activeCount} filter aktif` : "Semua data"}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpened(true)}
          leftIcon={<SlidersHorizontal className="h-4 w-4" />}
          className="h-9 shrink-0 rounded-2xl px-3 text-xs"
        >
          Atur
        </Button>
      </Card>

      <div className={cn("hidden lg:block", desktopClassName)}>{children}</div>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={title}
        description={description}
        size="md"
        compact
        footer={
          <div className={cn("grid gap-2", onReset ? "grid-cols-2" : "grid-cols-1")}>
            {onReset ? (
              <Button
                variant="outline"
                className="h-10 rounded-2xl text-xs font-bold"
                onClick={() => {
                  onReset();
                  setOpened(false);
                }}
              >
                Reset
              </Button>
            ) : null}
            <Button
              className="h-10 rounded-2xl bg-slate-950 text-xs font-bold hover:bg-slate-800"
              onClick={() => {
                onApply?.();
                setOpened(false);
              }}
            >
              Terapkan
            </Button>
          </div>
        }
      >
        <div className={cn("space-y-3 overflow-x-hidden", bodyClassName)}>
          {children}
        </div>
      </Modal>
    </>
  );
}
