import Button from "@/components/ui/Button";
import type { TrainingSessionItem } from "@/features/instructor/constants/trainingSession";

interface TrainingSessionActionButtonProps {
  item: TrainingSessionItem;
}

export default function TrainingSessionActionButton({
  item: _item,
}: TrainingSessionActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="min-w-28 rounded-xl text-xs font-bold uppercase tracking-[0.08em]"
      disabled
    >
      Tanpa Aksi
    </Button>
  );
}
