import ConfirmDialog from "@/components/common/ConfirmDialog";
import type { AdminInstructor } from "@/features/admin/constants/instructors";

interface DeleteInstructorModalProps {
  opened: boolean;
  instructor: AdminInstructor | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteInstructorModal({
  opened,
  instructor,
  loading = false,
  onClose,
  onConfirm,
}: DeleteInstructorModalProps) {
  const isInactive =
    instructor?.accountStatus === "Nonaktif" || instructor?.status === "Nonaktif";

  return (
    <ConfirmDialog
      opened={opened}
      title={isInactive ? "Aktifkan Kembali Instruktur?" : "Nonaktifkan Instruktur?"}
      description={
        isInactive
          ? "Instruktur akan dapat login dan digunakan kembali untuk assignment jadwal latihan."
          : "Instruktur tidak dihapus permanen. Akun akan dinonaktifkan, token login dicabut, dan instruktur tidak dapat dipakai untuk operasional baru. Data jadwal, assignment, booking, dan hasil latihan lama tetap tersimpan."
      }
      confirmLabel={isInactive ? "Ya, Aktifkan" : "Ya, Nonaktifkan"}
      cancelLabel="Batal"
      tone={isInactive ? "primary" : "danger"}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      preview={
        instructor ? (
          <div>
            <p className="font-bold text-slate-950">{instructor.fullName}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              {instructor.id} • {instructor.specialization}
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Status akun: {instructor.accountStatus ?? "Aktif"} • Status instruktur: {instructor.status}
            </p>
          </div>
        ) : null
      }
    />
  );
}
