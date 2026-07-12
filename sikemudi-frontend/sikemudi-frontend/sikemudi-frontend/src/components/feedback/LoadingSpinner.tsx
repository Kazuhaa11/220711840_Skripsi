import { cn } from "@/lib/cn";

interface LoadingSpinnerProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingSpinner({
  label = "Memuat data...",
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen ? "min-h-screen" : "min-h-50",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-4">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600/20 border-t-blue-600" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  );
}
