import { Mail, Phone, Printer, RotateCcw, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import type { AdminParticipant } from "@/features/admin/constants/participants";

interface ParticipantDetailModalProps {
  opened: boolean;
  participant: AdminParticipant | null;
  onClose: () => void;
  onEdit: (participant: AdminParticipant) => void;
}

const avatarToneClass: Record<AdminParticipant["avatarTone"], string> = {
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-indigo-100 text-indigo-700",
  green: "bg-emerald-100 text-emerald-700",
  slate: "bg-slate-100 text-slate-700",
};

export default function ParticipantDetailModal({
  opened,
  participant,
  onClose,
  onEdit,
}: ParticipantDetailModalProps) {
  if (!participant) return null;

  const progress = Math.round(
    (participant.completedSessions / participant.totalSessions) * 100,
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="full"
      showCloseButton={false}
      className="max-w-245"
      bodyClassName="p-0"
    >
      <div className="grid overflow-hidden rounded-[28px] lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="bg-slate-100 px-5 py-6 text-center">
          <div
            className={cn(
              "mx-auto flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-white text-xl font-bold shadow-lg",
              avatarToneClass[participant.avatarTone],
            )}
          >
            {participant.initials}
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-950">
            {participant.fullName}
          </h2>

          <p className="mt-2 text-sm font-medium text-slate-600">
            ID: {participant.id}
          </p>

          <Card className="mt-5 rounded-2xl p-5 text-left shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Paket Aktif
            </p>
            <p className="mt-3 text-lg font-bold text-blue-700">
              {participant.activePackage} ({participant.packageCode})
            </p>
          </Card>

          <Card className="mt-4 rounded-2xl p-5 text-left shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Status Akun
            </p>
            <p className="mt-3 flex items-center gap-2 text-base font-bold text-slate-950">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              {participant.accountStatus}
            </p>
          </Card>

          <Button
            fullWidth
            size="lg"
            className="mt-5 rounded-2xl bg-slate-950 font-bold text-white hover:bg-slate-800"
            onClick={() => onEdit(participant)}
          >
            Ubah Profil
          </Button>
        </aside>

        <main className="relative bg-white px-5 py-6 sm:px-8">
          <Button
            variant="ghost"
            className="absolute right-6 top-5 h-10 w-10 rounded-xl p-0"
            aria-label="Tutup detail peserta"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          <h2 className="pr-12 text-xl font-bold tracking-tight text-slate-950">
            Detail Lengkap Peserta
          </h2>
          <p className="mt-2 text-base text-slate-600">
            Informasi administratif dan performa pelatihan.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Alamat Email
              </p>
              <p className="mt-3 flex items-center gap-2 text-base font-medium text-slate-950">
                <Mail className="h-4 w-4 text-blue-700" />
                {participant.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Nomor Telepon
              </p>
              <p className="mt-3 flex items-center gap-2 text-base font-medium text-slate-950">
                <Phone className="h-4 w-4 text-blue-700" />
                {participant.phone}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Tanggal Pendaftaran
              </p>
              <p className="mt-3 text-base font-medium text-slate-950">
                {participant.joinedAt}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Status Sertifikat
              </p>
              <Badge variant="success" className="mt-3 font-bold">
                {participant.certificateStatus}
              </Badge>
            </div>
          </div>

          <section className="mt-5">
            <h3 className="text-base font-bold uppercase tracking-[0.18em] text-slate-950">
              Ringkasan Kemajuan
            </h3>

            <Card className="mt-5 rounded-3xl bg-slate-100 p-5 shadow-none">
              <div className="flex items-center justify-between gap-4">
                <p className="text-base font-bold text-slate-950">
                  Sesi Terselesaikan ({participant.completedSessions}/
                  {participant.totalSessions})
                </p>
                <p className="text-xl font-bold text-blue-700">{progress}%</p>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-blue-700"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 text-center">
                <div>
                  <p className="text-lg font-bold text-slate-950">
                    {participant.rating}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase text-slate-500">
                    Rating
                  </p>
                </div>

                <div>
                  <p className="text-lg font-bold text-slate-950">
                    {participant.absenceCount}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase text-slate-500">
                    Absensi
                  </p>
                </div>

                <div>
                  <p className="text-lg font-bold text-slate-950">
                    {participant.remainingSessions}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase text-slate-500">
                    Sisa Sesi
                  </p>
                </div>
              </div>
            </Card>
          </section>

          <section className="mt-5">
            <h3 className="text-base font-bold uppercase tracking-[0.18em] text-slate-950">
              Riwayat Sesi Terakhir
            </h3>

            <div className="mt-5 rounded-2xl border-l-4 border-blue-700 bg-slate-100 p-5">
              <p className="font-bold text-slate-950">
                {participant.lastSessionTitle}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {participant.lastSessionDate}
              </p>
              <p className="mt-3 text-sm font-medium text-slate-700">
                Instruktur: {participant.lastInstructor}
              </p>
            </div>
          </section>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              variant="ghost"
              size="lg"
              className="rounded-2xl px-5 font-bold text-slate-800"
              leftIcon={<Printer className="h-4 w-4" />}
            >
              Cetak Kartu Peserta
            </Button>

            <Button
              size="lg"
              className="rounded-2xl bg-slate-950 px-5 font-bold hover:bg-slate-800"
              leftIcon={<RotateCcw className="h-4 w-4" />}
            >
              Lihat Semua Riwayat
            </Button>
          </div>
        </main>
      </div>
    </Modal>
  );
}
