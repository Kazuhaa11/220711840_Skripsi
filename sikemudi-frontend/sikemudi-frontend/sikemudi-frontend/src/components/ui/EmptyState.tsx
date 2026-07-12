import type { ReactNode } from "react";
import Card from "@/components/ui/Card";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="min-w-0 rounded-2xl p-4 text-center shadow-sm sm:rounded-3xl sm:p-10">
      {icon ? (
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 sm:h-14 sm:w-14">
          {icon}
        </div>
      ) : null}

      <h3 className="mt-3 break-words text-lg font-bold tracking-tight text-slate-950 sm:mt-5 sm:text-2xl">
        {title}
      </h3>

      {description ? (
        <p className="mx-auto mt-2 max-w-xl break-words text-sm leading-6 text-slate-600 sm:mt-3 sm:text-base sm:leading-7">
          {description}
        </p>
      ) : null}

      {action ? <div className="mt-4 flex justify-center sm:mt-6">{action}</div> : null}
    </Card>
  );
}
