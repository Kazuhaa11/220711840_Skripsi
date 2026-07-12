import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/cn";

type ConfirmDialogTone = "danger" | "warning" | "primary";

interface ConfirmDialogProps {
  opened: boolean;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  preview?: ReactNode;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const toneClass: Record<ConfirmDialogTone, string> = {
  danger: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  primary: "bg-blue-100 text-blue-700",
};

export default function ConfirmDialog({
  opened,
  title,
  description,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  tone = "danger",
  preview,
  loading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      bodyClassName="p-6 sm:p-7"
      footerClassName="px-6 py-5 sm:px-7"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            toneClass[tone],
          )}
        >
          <AlertTriangle className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight text-slate-950">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          ) : null}
        </div>
      </div>

      {preview ? (
        <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
          {preview}
        </div>
      ) : null}
    </Modal>
  );
}
