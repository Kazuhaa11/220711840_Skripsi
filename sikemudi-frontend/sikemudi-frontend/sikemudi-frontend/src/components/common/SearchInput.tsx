import type { InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface SearchInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  value: string;
  onClear?: () => void;
  wrapperClassName?: string;
}

export default function SearchInput({
  value,
  onClear,
  className,
  wrapperClassName,
  placeholder = "Cari data...",
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full", wrapperClassName)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      <input
        value={value}
        placeholder={placeholder}
        className={cn(
          "h-11 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500",
          className,
        )}
        {...props}
      />

      {value ? (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Hapus pencarian"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
