import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface DataTabItem<T extends string = string> {
  id: T;
  label: ReactNode;
  icon?: LucideIcon;
}

interface DataTabsProps<T extends string = string> {
  tabs: DataTabItem<T>[];
  activeTab: T;
  onChange: (tab: T) => void;
  variant?: "underline" | "segmented";
  className?: string;
  listClassName?: string;
}

export default function DataTabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  variant = "underline",
  className,
  listClassName,
}: DataTabsProps<T>) {
  if (variant === "segmented") {
    return (
      <div
        className={cn(
          "grid overflow-x-auto rounded-2xl bg-slate-100 p-1",
          className,
        )}
      >
        <div className={cn("grid min-w-max auto-cols-fr grid-flow-col", listClassName)}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={cn(
                  "flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition",
                  active
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-950",
                )}
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto border-b border-slate-200", className)}>
      <div className={cn("flex min-w-max gap-2 px-6", listClassName)}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-bold transition",
                active
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-slate-400 hover:text-slate-950",
              )}
            >
              {Icon ? <Icon className="h-4 w-4" /> : null}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
