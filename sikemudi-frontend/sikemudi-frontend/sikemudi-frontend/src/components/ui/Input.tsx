import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  rightElement?: ReactNode;
  onRightIconClick?: () => void;
  rightIconAriaLabel?: string;
  wrapperClassName?: string;
  fieldClassName?: string;
  labelClassName?: string;
  hintClassName?: string;
  errorClassName?: string;
  requiredMark?: boolean;
}

export default function Input({
  id,
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  rightElement,
  onRightIconClick,
  rightIconAriaLabel = "Input action",
  wrapperClassName,
  fieldClassName,
  labelClassName,
  hintClassName,
  errorClassName,
  requiredMark = false,
  className,
  type = "text",
  disabled,
  ...props
}: InputProps) {
  const hasLeftIcon = Boolean(leftIcon);
  const hasRightControl = Boolean(rightElement || rightIcon);

  return (
    <div className={cn("flex w-full flex-col gap-2", wrapperClassName)}>
      {label ? (
        <label
          htmlFor={id}
          className={cn("text-sm font-medium text-slate-700", labelClassName)}
        >
          {label}
          {requiredMark ? <span className="ml-1 text-red-500">*</span> : null}
        </label>
      ) : null}

      <div className={cn("relative", fieldClassName)}>
        {hasLeftIcon ? (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </div>
        ) : null}

        <input
          id={id}
          type={type}
          disabled={disabled}
          className={cn(
            "h-11 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500",
            hasLeftIcon ? "pl-11" : "pl-4",
            hasRightControl ? "pr-11" : "pr-4",
            disabled && "cursor-not-allowed bg-slate-100 text-slate-500",
            error && "border-red-500 focus:border-red-500",
            className,
          )}
          {...props}
        />

        {rightElement ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        ) : rightIcon ? (
          onRightIconClick ? (
            <button
              type="button"
              onClick={onRightIconClick}
              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label={rightIconAriaLabel}
            >
              {rightIcon}
            </button>
          ) : (
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )
        ) : null}
      </div>

      {error ? (
        <p className={cn("text-xs text-red-600", errorClassName)}>{error}</p>
      ) : hint ? (
        <p className={cn("text-xs text-slate-500", hintClassName)}>{hint}</p>
      ) : null}
    </div>
  );
}
