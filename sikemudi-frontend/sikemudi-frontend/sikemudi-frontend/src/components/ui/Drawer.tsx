import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type DrawerPosition = "left" | "right";
type DrawerSize = "sm" | "md" | "lg" | "full";

interface DrawerProps {
  opened: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: DrawerPosition;
  size?: DrawerSize;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  preventScroll?: boolean;
  showCloseButton?: boolean;
  className?: string;
  overlayClassName?: string;
  bodyClassName?: string;
}

const sizeClasses: Record<DrawerSize, string> = {
  sm: "w-full max-w-sm",
  md: "w-full max-w-md",
  lg: "w-full max-w-xl",
  full: "w-full max-w-[100vw]",
};

export default function Drawer({
  opened,
  onClose,
  title,
  description,
  children,
  footer,
  position = "right",
  size = "md",
  closeOnOverlayClick = true,
  closeOnEsc = true,
  preventScroll = true,
  showCloseButton = true,
  className,
  overlayClassName,
  bodyClassName,
}: DrawerProps) {
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
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [opened, closeOnEsc, onClose]);

  if (!opened || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-110">
      <div
        className={cn(
          "absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]",
          overlayClassName,
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
      />

      <div
        className={cn(
          "absolute inset-y-0 flex",
          position === "right" ? "right-0" : "left-0",
        )}
      >
        <div
          className={cn(
            "flex h-full flex-col border-slate-200 bg-white shadow-2xl",
            sizeClasses[size],
            position === "right" ? "border-l" : "border-r",
            className,
          )}
        >
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5">
              <div className="min-w-0">
                {title ? (
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    {title}
                  </h2>
                ) : null}

                {description ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {description}
                  </p>
                ) : null}
              </div>

              {showCloseButton ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Tutup drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          )}

          <div
            className={cn("flex-1 overflow-y-auto px-5 py-5", bodyClassName)}
          >
            {children}
          </div>

          {footer ? (
            <div className="border-t border-slate-200 px-5 py-4">{footer}</div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}
