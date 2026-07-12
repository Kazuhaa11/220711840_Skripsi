import { Car, ShieldCheck, X } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { AdminTrainingResult } from "@/features/admin/constants/trainingResults";
import { canVerifyAdminTrainingResult } from "@/features/admin/constants/trainingResults";

interface TrainingResultDetailPanelProps {
  opened: boolean;
  result: AdminTrainingResult | null;
  onClose: () => void;
  onVerify: (result: AdminTrainingResult) => void;
}

const attendanceClass = {
  Hadir: "bg-emerald-100 text-emerald-700",
  "Tidak Hadir": "bg-red-100 text-red-700",
  Izin: "bg-amber-100 text-amber-700",
  "Belum Diisi": "bg-slate-100 text-slate-700",
};

export default function TrainingResultDetailPanel({
  opened,
  result,
  onClose,
  onVerify,
}: TrainingResultDetailPanelProps) {
  if (!result) return null;

  const canVerify = canVerifyAdminTrainingResult(result);
  const sessions = result.sessions ?? [];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 transition",
        opened
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0",
      )}
    >
      <button
        type="button"
        aria-label="Tutup detail hasil latihan"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-210 overflow-y-auto bg-white shadow-2xl">
        <div className="px-5 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
                Sikemudi / Hasil Latihan / Detail Paket
              </p>

              <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
                Detail Hasil Latihan Paket
              </h2>

              <p className="mt-2 text-base text-slate-600">
                Booking Paket: <span className="font-bold">{result.packageCode ?? result.id}</span>
              </p>
            </div>

            <Button
              variant="ghost"
              className="h-10 w-10 rounded-xl p-0"
              aria-label="Tutup detail hasil latihan"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <Card className="mt-5 rounded-3xl p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  Peserta & Paket
                </p>
                <p className="mt-2 text-xl font-bold text-slate-950">
                  {result.participantName}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {result.participantId} • {result.packageName}
                </p>
                <p className="mt-3 text-sm font-bold text-blue-700">
                  Progress {result.progressLabel}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-700 text-white">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{result.vehicleName}</p>
                    <p className="text-sm text-slate-300">{result.vehiclePlate}</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-4 text-sm text-slate-300">
                  <p>Instruktur</p>
                  <p className="mt-1 font-bold text-white">{result.instructorName}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="mt-5 rounded-3xl p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Status Paket
                </p>
                <p className="mt-2 text-lg font-bold text-slate-950">
                  {result.workflowStatus}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Validasi admin dilakukan satu kali untuk seluruh paket, memakai hasil sesi final.
                </p>
              </div>

              <Badge className="w-fit bg-blue-100 px-5 py-2 font-bold uppercase text-blue-700">
                {result.groupStatus ?? "Paket"}
              </Badge>
            </div>
          </Card>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                Daftar Sesi Latihan
              </p>
              <p className="text-sm font-bold text-slate-600">
                {sessions.length || result.totalSessions} sesi
              </p>
            </div>

            {sessions.length > 0 ? (
              sessions.map((session) => (
                <Card key={session.numericId} className="rounded-3xl p-5 shadow-sm">
                  <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)_150px] lg:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                        {session.sessionLabel}
                      </p>
                      <p className="mt-2 font-bold text-slate-950">
                        {session.sessionDate}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {session.sessionTime}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-950">
                        Nilai akhir: {session.nilaiAkhir ?? "-"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {session.instructorNote || session.evaluation || "Belum ada catatan instruktur."}
                      </p>
                      {session.adminNote ? (
                        <p className="mt-2 text-sm italic leading-6 text-slate-500">
                          Catatan admin: {session.adminNote}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <Badge className={cn("font-bold", attendanceClass[session.attendance])}>
                        {session.attendance}
                      </Badge>
                      <Badge className="bg-slate-100 font-bold text-slate-700">
                        {session.graduationStatus}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="rounded-3xl p-5 text-center text-sm text-slate-500 shadow-sm">
                Belum ada sesi yang sudah diinput instruktur.
              </Card>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
            <Button
              size="lg"
              className={cn(
                "rounded-2xl bg-slate-950 font-bold hover:bg-slate-800",
                !canVerify && "cursor-not-allowed opacity-50 hover:bg-slate-950",
              )}
              leftIcon={<ShieldCheck className="h-4 w-4" />}
              onClick={() => {
                if (canVerify) {
                  onVerify(result);
                }
              }}
              disabled={!canVerify}
              title={
                canVerify
                  ? "Validasi kelulusan paket"
                  : "Paket belum siap divalidasi / sudah final"
              }
            >
              {canVerify ? "Validasi Kelulusan Paket" : "Belum Siap Validasi"}
            </Button>

            <Button
              variant="secondary"
              size="lg"
              className="rounded-2xl font-bold"
              onClick={onClose}
            >
              Tutup
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
