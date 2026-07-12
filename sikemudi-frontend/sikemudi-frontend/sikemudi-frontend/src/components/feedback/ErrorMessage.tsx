import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

interface ErrorMessageProps {
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

export default function ErrorMessage({
  title = "Terjadi Kesalahan",
  message,
  action,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />

        <div className="min-w-0">
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6">{message}</p>
          {action ? <div className="mt-3">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
