import type { ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "size"
> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  leftIcon?: ReactNode;
}

export default function Select({
  label,
  hint,
  error,
  options,
  placeholder,
  leftIcon,
  className,
  disabled,
  ...props
}: SelectProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      {label ? (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        ) : null}

        <select
          disabled={disabled}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pr-10 text-sm text-slate-900 outline-none transition focus:border-blue-500",
            leftIcon ? "pl-10" : "pl-3",
            disabled && "cursor-not-allowed bg-slate-100 text-slate-500",
            error && "border-red-500 focus:border-red-500",
            className,
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
