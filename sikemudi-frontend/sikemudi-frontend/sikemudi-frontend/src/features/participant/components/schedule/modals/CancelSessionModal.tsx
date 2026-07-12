import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import TextArea from "@/components/ui/TextArea";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import { cancelParticipantBooking } from "@/services/booking.service";
import type { UpcomingSessionItem } from "@/features/participant/constants/mySchedule";

interface CancelSessionModalProps {
  opened: boolean;
  session: UpcomingSessionItem | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export default function CancelSessionModal({
  opened,
  session,
  onClose,
  onSuccess,
}: CancelSessionModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!opened) return;
    setReason("");
    setError(null);
  }, [opened]);

  async function handleSubmit() {
    if (!session) return;

    try {
      setSubmitting(true);
      setError(null);

      await cancelParticipantBooking(session.bookingId, {
        alasan_pembatalan: reason.trim() || null,
      });

      await onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sesi gagal dibatalkan.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={submitting ? () => undefined : onClose}
      size="md"
      title="Batalkan Sesi"
      description="Pembatalan hanya bisa dilakukan sebelum batas H-3 jadwal latihan."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={submitting} className="rounded-2xl">
            Tutup
          </Button>
          <Button variant="danger" onClick={handleSubmit} loading={submitting} className="rounded-2xl">
            Batalkan Sesi
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {session ? (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">
            <p className="font-bold">Sesi yang akan dibatalkan</p>
            <p className="mt-1">{session.date} • {session.time}</p>
            <p>{session.packageName}</p>
          </div>
        ) : null}

        {error ? <ErrorMessage message={error} /> : null}

        <TextArea
          label="Alasan Pembatalan"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Opsional, tuliskan alasan pembatalan sesi."
          rows={4}
        />
      </div>
    </Modal>
  );
}
