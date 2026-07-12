import { Car, MapPin, Pencil, Printer, UserRound, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/Table";
import type { AdminTrainingSchedule } from "@/features/admin/constants/trainingSchedules";

interface TrainingScheduleDetailModalProps {
  opened: boolean;
  schedule: AdminTrainingSchedule | null;
  onClose: () => void;
  onEdit: (schedule: AdminTrainingSchedule) => void;
}

export default function TrainingScheduleDetailModal({
  opened,
  schedule,
  onClose,
  onEdit,
}: TrainingScheduleDetailModalProps) {
  if (!schedule) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        opened
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Tutup detail jadwal"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-170 overflow-y-auto bg-white shadow-2xl">
        <div className="px-5 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-300 px-4 py-1.5 font-bold uppercase text-slate-950">
                  {schedule.status}
                </Badge>
                <p className="font-medium text-slate-500">{schedule.id}</p>
              </div>

              <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">
                Detail Jadwal Latihan
              </h2>
            </div>

            <Button
              variant="ghost"
              className="h-10 w-10 rounded-xl p-0"
              aria-label="Tutup detail jadwal"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <section className="mt-5">
            <h3 className="border-l-4 border-blue-600 pl-4 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
              Informasi Sesi
            </h3>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Tanggal
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">
                  {schedule.date}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Hari
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">
                  {schedule.dayName}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Slot Waktu
                </p>
                <p className="mt-2 text-lg font-bold text-blue-700">
                  {schedule.startTime} — {schedule.endTime} WIB
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Durasi
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">
                  {schedule.durationMinutes} Menit
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5">
            <h3 className="border-l-4 border-blue-600 pl-4 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
              Sumber Daya
            </h3>

            <div className="mt-5 space-y-5">
              <Card className="rounded-2xl bg-slate-100 p-5 shadow-none">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-700">
                    <UserRound className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Instruktur Utama
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-950">
                      {schedule.instructorName}
                    </p>
                    <p className="text-sm text-slate-600">
                      {schedule.instructorRole}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl bg-slate-100 p-5 shadow-none">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-700">
                    <Car className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Unit Kendaraan
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-950">
                      {schedule.vehicleName} ({schedule.vehicleTransmission})
                    </p>
                    <p className="text-sm text-slate-600">
                      {schedule.vehiclePlate}
                    </p>
                  </div>

                  <Badge variant="success" className="font-bold uppercase">
                    Ready
                  </Badge>
                </div>
              </Card>
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-center justify-between gap-4">
              <h3 className="border-l-4 border-blue-600 pl-4 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                Status & Kapasitas
              </h3>

              <p className="text-sm font-bold text-slate-700">
                {schedule.participantCount} dari {schedule.quota} Terisi
              </p>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-700"
                style={{
                  width: `${Math.min(
                    100,
                    (schedule.participantCount / schedule.quota) * 100,
                  )}%`,
                }}
              />
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Card className="rounded-2xl p-5 shadow-none">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Status Sesi
                </p>
                <p className="mt-2 flex items-center gap-2 text-lg font-bold text-slate-950">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  {schedule.status}
                </p>
              </Card>

              <Card className="rounded-2xl p-5 shadow-none">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Lokasi Titik
                </p>
                <p className="mt-2 flex items-center gap-2 text-lg font-bold text-slate-950">
                  <MapPin className="h-5 w-5 text-red-600" />
                  {schedule.location}
                </p>
              </Card>
            </div>
          </section>

          <section className="mt-5">
            <h3 className="border-l-4 border-blue-600 pl-4 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
              Daftar Peserta
            </h3>

            <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
              <Table>
                <TableHead className="bg-slate-100">
                  <TableRow>
                    <TableHeaderCell>Nama Peserta</TableHeaderCell>
                    <TableHeaderCell>Paket</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {schedule.participants.length > 0 ? (
                    schedule.participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell className="font-bold text-slate-950">
                          {participant.name}
                        </TableCell>
                        <TableCell>{participant.packageName}</TableCell>
                        <TableCell>
                          <Badge variant="success" className="font-bold">
                            {participant.attendanceStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="py-6 text-center text-slate-500"
                      >
                        Belum ada peserta pada jadwal ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 grid gap-3 border-t border-slate-200 bg-white px-5 py-5 sm:grid-cols-[100px_minmax(0,1fr)_minmax(0,1fr)]">
          <Button
            variant="secondary"
            size="lg"
            className="rounded-2xl font-bold"
            onClick={onClose}
          >
            Tutup
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-2xl font-bold text-blue-700"
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Cetak Jadwal
          </Button>

          <Button
            size="lg"
            className="rounded-2xl bg-slate-950 font-bold hover:bg-slate-800"
            leftIcon={<Pencil className="h-4 w-4" />}
            onClick={() => onEdit(schedule)}
          >
            Ubah Jadwal
          </Button>
        </div>
      </aside>
    </div>
  );
}
