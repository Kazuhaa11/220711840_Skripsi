import ConfirmDialog from "@/components/common/ConfirmDialog";
import type { AdminCoursePackage } from "@/features/admin/constants/coursePackages";

interface DeleteCoursePackageModalProps {
  opened: boolean;
  coursePackage: AdminCoursePackage | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteCoursePackageModal({
  opened,
  coursePackage,
  loading = false,
  onClose,
  onConfirm,
}: DeleteCoursePackageModalProps) {
  const isInactive = coursePackage?.status === "Nonaktif";

  return (
    <ConfirmDialog
      opened={opened}
      title={isInactive ? "Aktifkan Kembali Paket Kursus?" : "Nonaktifkan Paket Kursus?"}
      description={
        isInactive
          ? "Paket kursus akan kembali berstatus aktif dan dapat dipilih oleh peserta pada proses booking baru."
          : "Paket kursus tidak dihapus permanen. Status paket akan diubah menjadi Nonaktif, sedangkan riwayat peserta, booking, jadwal, pembayaran, dan sertifikat lama tetap tersimpan."
      }
      confirmLabel={isInactive ? "Ya, Aktifkan" : "Ya, Nonaktifkan"}
      cancelLabel="Batal"
      tone={isInactive ? "primary" : "danger"}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      preview={
        coursePackage ? (
          <div>
            <p className="font-bold text-slate-950">{coursePackage.name}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              {coursePackage.id} • {coursePackage.durationHours} jam
            </p>
            <p className="mt-2 text-xs font-semibold text-slate-500">
              Status: {coursePackage.status}
            </p>
          </div>
        ) : null
      }
    />
  );
}
