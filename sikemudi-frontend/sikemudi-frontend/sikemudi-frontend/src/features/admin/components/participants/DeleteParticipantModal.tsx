import ConfirmDialog from "@/components/common/ConfirmDialog";
import type { AdminParticipant } from "@/features/admin/constants/participants";

interface DeleteParticipantModalProps {
  opened: boolean;
  participant: AdminParticipant | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteParticipantModal({
  opened,
  participant,
  loading = false,
  onClose,
  onConfirm,
}: DeleteParticipantModalProps) {
  const isInactive = participant?.accountStatus === "Nonaktif";

  return (
    <ConfirmDialog
      opened={opened}
      title={isInactive ? "Aktifkan Kembali Peserta?" : "Nonaktifkan Peserta?"}
      description={
        isInactive
          ? "Peserta akan dapat login dan menggunakan sistem kembali. Data riwayat booking, pembayaran, hasil latihan, refund, dan sertifikat tetap terhubung dengan akun lama."
          : "Peserta tidak akan dapat login atau melakukan booking baru, tetapi data riwayat booking, pembayaran, hasil latihan, refund, dan sertifikat tetap tersimpan."
      }
      confirmLabel={isInactive ? "Ya, Aktifkan" : "Ya, Nonaktifkan"}
      cancelLabel="Batal"
      tone={isInactive ? "primary" : "danger"}
      loading={loading}
      onClose={onClose}
      onConfirm={onConfirm}
      preview={
        participant ? (
          <div>
            <p className="font-bold text-slate-950">{participant.fullName}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              ID: {participant.id} • Status: {participant.accountStatus}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {participant.activePackage} {participant.packageCode}
            </p>
          </div>
        ) : null
      }
    />
  );
}
