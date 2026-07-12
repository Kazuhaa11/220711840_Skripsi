import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { CalendarX2, Check } from "lucide-react";

interface ScheduleActionResultModalProps {
  opened: boolean;
  onClose: () => void;
  onPrimaryAction?: () => void;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  mode?: "success" | "empty";
}

export default function ScheduleActionResultModal({
  opened,
  onClose,
  onPrimaryAction,
  title,
  description,
  primaryLabel,
  secondaryLabel,
  onSecondaryAction,
  mode = "success",
}: ScheduleActionResultModalProps) {
  const isSuccess = mode === "success";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      showCloseButton={false}
      bodyClassName="px-6 py-8 sm:px-10 sm:py-10"
    >
      <div className="text-center">
        <div
          className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full ${
            isSuccess
              ? "border border-emerald-200 bg-emerald-50"
              : "border border-slate-200 bg-slate-50"
          }`}
        >
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              isSuccess
                ? "bg-emerald-500 text-white"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            {isSuccess ? (
              <Check className="h-7 w-7" />
            ) : (
              <CalendarX2 className="h-6 w-6" />
            )}
          </div>
        </div>

        <h2 className="mt-8 text-[2.3rem] font-black leading-tight tracking-tight text-slate-950">
          {title}
        </h2>

        <p className="mx-auto mt-5 max-w-md text-lg leading-9 text-slate-600">
          {description}
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Button
            fullWidth
            className="h-12 rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
            onClick={onPrimaryAction}
          >
            {primaryLabel}
          </Button>

          {secondaryLabel ? (
            <Button
              variant="ghost"
              onClick={onSecondaryAction ?? onClose}
              className="text-sm font-bold uppercase tracking-[0.08em] text-blue-600 hover:text-blue-700"
            >
              {secondaryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </Modal>
  );
}
