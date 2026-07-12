import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

interface ModalProps {
  opened: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  preventScroll?: boolean;
  className?: string;
  overlayClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  compact?: boolean;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-5xl",
  full: "max-w-[min(96vw,1400px)]",
};

export default function Modal({
  opened,
  onClose,
  title,
  description,
  children,
  footer,
  size = "lg",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  preventScroll = true,
  className,
  overlayClassName,
  headerClassName,
  bodyClassName,
  footerClassName,
  compact = false,
}: ModalProps) {
  useEffect(() => {
    if (!opened || !preventScroll) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [opened, preventScroll]);

  useEffect(() => {
    if (!opened || !closeOnEsc) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [opened, closeOnEsc, onClose]);

  if (!opened || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-100">
      <div
        className={cn(
          "absolute inset-0 bg-slate-950/45 backdrop-blur-[3px]",
          overlayClassName,
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      <div className="relative flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "relative flex w-full max-h-[92dvh] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl",
            compact && "rounded-3xl",
            sizeClasses[size],
            className,
          )}
        >
          {(title || description || showCloseButton) && (
            <div
              className={cn(
                "flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-6",
                compact && "px-5 py-4 sm:px-6 sm:py-4",
                headerClassName,
              )}
            >
              <div className="min-w-0">
                {title ? (
                  <h2 className={cn("font-black tracking-tight text-slate-950", compact ? "text-xl sm:text-2xl" : "text-3xl sm:text-[2.2rem]")}>
                    {title}
                  </h2>
                ) : null}

                {description ? (
                  <p className={cn("mt-2 text-slate-600", compact ? "text-sm leading-6" : "text-base leading-8")}>
                    {description}
                  </p>
                ) : null}
              </div>

              {showCloseButton ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Tutup modal"
                >
                  <X className="h-6 w-6" />
                </button>
              ) : null}
            </div>
          )}

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6",
              compact && "px-5 py-4 sm:px-6 sm:py-4",
              bodyClassName,
            )}
          >
            {children}
          </div>

          {footer ? (
            <div
              className={cn(
                "border-t border-slate-200 px-5 py-4 sm:px-8 sm:py-5",
                compact && "px-5 py-3 sm:px-6 sm:py-3",
                footerClassName,
              )}
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
