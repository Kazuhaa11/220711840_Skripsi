import ConfirmDialog from "@/components/common/ConfirmDialog";
import type { AdminTimeSlot } from "@/features/admin/constants/timeSlots";

interface DeleteTimeSlotModalProps {
  opened: boolean;
  timeSlot: AdminTimeSlot | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteTimeSlotModal({
  opened,
  timeSlot,
  loading = false,
  onClose,
  onConfirm,
}: DeleteTimeSlotModalProps) {
  const isInactive = timeSlot?.status === "Nonaktif";

  return (
    <ConfirmDialog
      opened={opened}
      title={isInactive ? "Aktifkan Kembali Slot Waktu?" : "Nonaktifkan Slot Waktu?"}
      description={
        isInactive
          ? "Slot waktu akan kembali aktif dan dapat digunakan untuk penjadwalan latihan serta assignment instruktur."
          : "Slot waktu tidak dihapus permanen. Status slot akan diubah menjadi Nonaktif, sedangkan riwayat jadwal latihan dan assignment lama tetap tersimpan."
      }
      confirmLabel={isInactive ? "Ya, Aktifkan" : "Ya, Nonaktifkan"}
      cancelLabel="Batal"
      tone={isInactive ? "primary" : "danger"}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      preview={
        timeSlot ? (
          <div>
            <p className="font-bold text-slate-950">{timeSlot.name}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              {timeSlot.id} • {timeSlot.startTime} - {timeSlot.endTime}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Status: {timeSlot.status} • Durasi: {timeSlot.durationMinutes} menit
            </p>
          </div>
        ) : null
      }
    />
  );
}
