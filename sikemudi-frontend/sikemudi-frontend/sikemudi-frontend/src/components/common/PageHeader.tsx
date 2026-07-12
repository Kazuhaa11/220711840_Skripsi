import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
}

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  description,
  actions,
  children,
  className,
  contentClassName,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
}: PageHeaderProps) {
  const supportingText = description ?? subtitle;

  return (
    <section
      className={cn(
        "mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between",
        className,
      )}
    >
      <div className={cn("min-w-0", contentClassName)}>
        {eyebrow ? (
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-[0.2em] text-blue-700",
              eyebrowClassName,
            )}
          >
            {eyebrow}
          </p>
        ) : null}

        <h1
          className={cn(
            "mt-2 text-2xl font-bold tracking-tight text-slate-950 first:mt-0 md:text-3xl",
            titleClassName,
          )}
        >
          {title}
        </h1>

        {supportingText ? (
          <p
            className={cn(
              "mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base",
              descriptionClassName,
            )}
          >
            {supportingText}
          </p>
        ) : null}

        {children ? <div className="mt-5">{children}</div> : null}
      </div>

      {actions ? (
        <div className={cn("shrink-0", actionsClassName)}>{actions}</div>
      ) : null}
    </section>
  );
}
