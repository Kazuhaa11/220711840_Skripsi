import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";

export type StatsGridTone =
  | "blue"
  | "green"
  | "red"
  | "amber"
  | "slate"
  | "emerald";

export interface StatsGridItem {
  id: string;
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  tone?: StatsGridTone;
  rightBadge?: ReactNode;
  cardClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
  descriptionClassName?: string;
  iconClassName?: string;
}

interface StatsGridProps {
  items: StatsGridItem[];
  variant?: "accent" | "plain";
  iconPlacement?: "right" | "top" | "left";
  className?: string;
  cardClassName?: string;
}

const toneClass: Record<
  StatsGridTone,
  { border: string; icon: string; description: string }
> = {
  blue: {
    border: "border-l-blue-600",
    icon: "bg-blue-100 text-blue-700",
    description: "text-blue-700",
  },
  green: {
    border: "border-l-green-500",
    icon: "bg-green-100 text-green-700",
    description: "text-green-700",
  },
  red: {
    border: "border-l-red-500",
    icon: "bg-red-100 text-red-700",
    description: "text-red-700",
  },
  amber: {
    border: "border-l-amber-500",
    icon: "bg-amber-100 text-amber-700",
    description: "text-amber-700",
  },
  slate: {
    border: "border-l-slate-950",
    icon: "bg-slate-100 text-slate-700",
    description: "text-slate-600",
  },
  emerald: {
    border: "border-l-emerald-500",
    icon: "bg-emerald-100 text-emerald-700",
    description: "text-emerald-600",
  },
};

export default function StatsGrid({
  items,
  variant = "accent",
  iconPlacement = "right",
  className,
  cardClassName,
}: StatsGridProps) {
  return (
    <section className={cn("grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item) => {
        const tone = toneClass[item.tone ?? "blue"];
        const Icon = item.icon;

        return (
          <Card
            key={item.id}
            className={cn(
              "min-w-0 rounded-3xl p-5 shadow-sm",
              variant === "accent" && "border-l-4",
              variant === "accent" && tone.border,
              cardClassName,
              item.cardClassName,
            )}
          >
            {iconPlacement === "left" ? (
              <div className="flex items-center gap-4">
                {Icon ? (
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      tone.icon,
                      item.iconClassName,
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                ) : null}

                <div className="min-w-0">
                  <p
                    className={cn(
                      "break-words text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500",
                      item.labelClassName,
                    )}
                  >
                    {item.label}
                  </p>

                  <p
                    className={cn(
                      "mt-1 break-words text-lg font-bold leading-tight text-slate-950",
                      item.valueClassName,
                    )}
                  >
                    {item.value}
                  </p>

                  {item.description ? (
                    <p
                      className={cn(
                        "mt-2 text-xs font-semibold",
                        tone.description,
                        item.descriptionClassName,
                      )}
                    >
                      {item.description}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : iconPlacement === "top" ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  {Icon ? (
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        tone.icon,
                        item.iconClassName,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  ) : (
                    <span aria-hidden="true" />
                  )}

                  {item.rightBadge ? item.rightBadge : null}
                </div>

                <p
                  className={cn(
                  "mt-4 break-words text-sm font-bold text-slate-800",
                    item.labelClassName,
                  )}
                >
                  {item.label}
                </p>

                <p
                  className={cn(
                  "mt-2 break-words text-xl font-bold leading-tight text-slate-950",
                    item.valueClassName,
                  )}
                >
                  {item.value}
                </p>

                {item.description ? (
                  <p
                    className={cn(
                      "mt-2 text-xs font-semibold",
                      tone.description,
                      item.descriptionClassName,
                    )}
                  >
                    {item.description}
                  </p>
                ) : null}
              </>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p
                    className={cn(
                      "break-words text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500",
                      item.labelClassName,
                    )}
                  >
                    {item.label}
                  </p>

                  <p
                    className={cn(
                      "mt-3 break-words text-xl font-bold leading-tight text-slate-950",
                      item.valueClassName,
                    )}
                  >
                    {item.value}
                  </p>

                  {item.description ? (
                    <p
                      className={cn(
                        "mt-2 text-xs font-semibold",
                        tone.description,
                        item.descriptionClassName,
                      )}
                    >
                      {item.description}
                    </p>
                  ) : null}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-3">
                  {item.rightBadge ? item.rightBadge : null}
                  {Icon ? (
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full",
                        tone.icon,
                        item.iconClassName,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </section>
  );
}
