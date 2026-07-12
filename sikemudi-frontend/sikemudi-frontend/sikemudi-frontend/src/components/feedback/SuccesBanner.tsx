import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface SuccesBannerProps {
  message: string;
  className?: string;
}

export default function SuccesBanner({
  message,
  className,
}: SuccesBannerProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="text-sm font-semibold sm:text-base">{message}</p>
      </div>
    </div>
  );
}
