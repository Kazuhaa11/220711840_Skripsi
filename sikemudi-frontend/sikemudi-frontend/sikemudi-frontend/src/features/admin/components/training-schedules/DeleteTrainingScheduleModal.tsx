import { AlertTriangle } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import type { AdminTrainingSchedule } from "@/features/admin/constants/trainingSchedules";

interface DeleteTrainingScheduleModalProps {
  opened: boolean;
  schedule: AdminTrainingSchedule | null;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteTrainingScheduleModal({
  opened,
  schedule,
  onClose,
  onConfirm,
}: DeleteTrainingScheduleModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="md"
      showCloseButton={false}
      bodyClassName="px-5 py-9 text-center"
    >
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
        <AlertTriangle className="h-5 w-5" />
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
        Hapus Jadwal Latihan?
      </h2>

      <p className="mx-auto mt-5 max-w-md text-base leading-6 text-slate-700">
        Jadwal yang dihapus tidak dapat dikembalikan. Pastikan jadwal belum
        memiliki peserta aktif atau hasil latihan yang sudah dicatat.
      </p>

      {schedule ? (
        <div className="mt-5 rounded-2xl bg-slate-100 px-4 py-4 text-left">
          <p className="font-bold text-slate-950">{schedule.id}</p>
          <p className="mt-1 text-sm text-slate-600">
            {schedule.date} • {schedule.startTime} - {schedule.endTime}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {schedule.instructorName} • {schedule.vehicleName}
          </p>
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        <Button
          variant="danger"
          size="lg"
          fullWidth
          className="rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-red-600/20"
          onClick={onConfirm}
        >
          Ya, Hapus
        </Button>

        <Button
          variant="ghost"
          size="lg"
          fullWidth
          className="rounded-2xl font-bold"
          onClick={onClose}
        >
          Batal
        </Button>
      </div>
    </Modal>
  );
}
