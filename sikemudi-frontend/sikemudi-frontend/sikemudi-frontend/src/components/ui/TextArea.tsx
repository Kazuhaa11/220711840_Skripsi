import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
  labelClassName?: string;
  hintClassName?: string;
  errorClassName?: string;
  requiredMark?: boolean;
}

export default function TextArea({
  label,
  hint,
  error,
  wrapperClassName,
  labelClassName,
  hintClassName,
  errorClassName,
  requiredMark = false,
  className,
  rows = 4,
  ...props
}: TextAreaProps) {
  return (
    <div className={cn("flex w-full flex-col gap-2", wrapperClassName)}>
      {label ? (
        <label
          className={cn("text-sm font-medium text-slate-700", labelClassName)}
        >
          {label}
          {requiredMark ? <span className="ml-1 text-red-500">*</span> : null}
        </label>
      ) : null}

      <textarea
        rows={rows}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500",
          error && "border-red-500 focus:border-red-500",
          className,
        )}
        {...props}
      />

      {error ? (
        <p className={cn("text-xs text-red-600", errorClassName)}>{error}</p>
      ) : hint ? (
        <p className={cn("text-xs text-slate-500", hintClassName)}>{hint}</p>
      ) : null}
    </div>
  );
}
