import { Printer, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import type { AdminInstructor } from "@/features/admin/constants/instructors";

interface InstructorDetailModalProps {
  opened: boolean;
  instructor: AdminInstructor | null;
  onClose: () => void;
  onEdit: (instructor: AdminInstructor) => void;
}

const avatarToneClass: Record<AdminInstructor["avatarTone"], string> = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  slate: "bg-slate-100 text-slate-700",
};

const sessionStatusClass = {
  Selesai: "bg-emerald-100 text-emerald-700",
  Berlangsung: "bg-blue-100 text-blue-700",
  Mendatang: "bg-slate-100 text-slate-700",
};

export default function InstructorDetailModal({
  opened,
  instructor,
  onClose,
  onEdit,
}: InstructorDetailModalProps) {
  if (!instructor) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="2xl"
      showCloseButton={false}
      bodyClassName="p-0"
    >
      <div className="grid overflow-hidden rounded-[28px] lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex min-h-110 flex-col justify-end bg-slate-950 px-5 py-6 text-white">
          <div
            className={cn(
              "mb-6 flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white text-xl font-bold",
              avatarToneClass[instructor.avatarTone],
            )}
          >
            {instructor.initials}
          </div>

          <Badge className="w-fit bg-emerald-300 px-4 py-1.5 font-bold uppercase tracking-[0.12em] text-slate-950">
            {instructor.role}
          </Badge>

          <h2 className="mt-4 text-xl font-bold leading-tight text-white">
            {instructor.fullName}
          </h2>

          <p className="mt-2 text-sm font-medium text-slate-300">
            ID: {instructor.id}
          </p>
        </aside>

        <main className="relative bg-white px-5 py-6 sm:px-8">
          <Button
            variant="ghost"
            className="absolute right-6 top-5 h-11 w-11 rounded-full bg-slate-100 p-0"
            aria-label="Tutup detail instruktur"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
            Detail Profil
          </p>

          <h2 className="mt-2 pr-14 text-xl font-bold tracking-tight text-slate-950">
            Informasi Lengkap Instruktur
          </h2>

          <p className="mt-2 text-base text-slate-600">
            Informasi administratif dan kapabilitas pengajar.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Spesialisasi
              </p>
              <Badge variant="info" className="mt-3 font-bold">
                {instructor.specialization}
              </Badge>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Kontak
              </p>
              <p className="mt-3 text-base font-bold text-slate-950">
                {instructor.phone}
              </p>
              <p className="mt-1 text-sm text-slate-600">{instructor.email}</p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                Bergabung Sejak
              </p>
              <p className="mt-3 text-base font-bold text-slate-950">
                {instructor.joinedAt}
              </p>
            </div>
          </div>

          <section className="mt-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-bold uppercase tracking-[0.18em] text-blue-700">
                Jadwal Hari Ini
              </h3>
              <p className="text-sm font-bold text-slate-600">
                Senin, 24 Mei 2024
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {instructor.todaySessions.length > 0 ? (
                instructor.todaySessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-3 rounded-2xl bg-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="border-l-4 border-blue-600 pl-4">
                      <p className="font-bold text-slate-950">
                        {session.time}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        {session.title}
                      </p>
                    </div>

                    <Badge
                      className={cn(
                        "font-bold uppercase",
                        sessionStatusClass[session.status],
                      )}
                    >
                      {session.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-100 px-5 py-5 text-sm font-medium text-slate-600">
                  Tidak ada jadwal mengajar hari ini.
                </div>
              )}
            </div>
          </section>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <Button
              size="lg"
              className="rounded-2xl bg-slate-950 px-5 font-bold uppercase tracking-[0.08em] hover:bg-slate-800"
              onClick={() => onEdit(instructor)}
            >
              Ubah Informasi
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl px-5 font-bold uppercase tracking-[0.08em]"
              leftIcon={<Printer className="h-4 w-4" />}
            >
              Cetak Laporan
            </Button>
          </div>
        </main>
      </div>
    </Modal>
  );
}
