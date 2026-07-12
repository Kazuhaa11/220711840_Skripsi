import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  Clock3,
  FileCheck2,
  Save,
  UserRound,
} from "lucide-react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import { cn } from "@/lib/cn";
import type {
  InstructorTrainingResultApi,
  InstructorTrainingResultCandidateApi,
  SaveInstructorTrainingResultPayload,
} from "@/types/instructor";
import {
  trainingResultNotFoundMessage,
  trainingResultSuccessMessage,
} from "@/features/instructor/constants/trainingResult";
import TrainingResultStatusBadge from "@/features/instructor/components/training-result/TrainingResultStatusBadge";
import {
  createInstructorTrainingResult,
  getInstructorTrainingResultCandidates,
  getInstructorTrainingResultDetail,
  updateInstructorTrainingResult,
} from "@/services/instructor.service";

const attendanceOptions = [
  { label: "Hadir", value: "Hadir" },
  { label: "Tidak Hadir", value: "Tidak Hadir" },
  { label: "Izin", value: "Izin" },
];

function getTimeRange(timeSlot?: { jam_mulai?: string | null; jam_selesai?: string | null } | null) {
  const start = timeSlot?.jam_mulai ?? "--:--";
  const end = timeSlot?.jam_selesai ?? "--:--";
  return `${start} - ${end}`;
}

function toNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function normalizeScore(value?: number | null): string {
  return value === null || value === undefined ? "" : String(value);
}

function getAverageScore(practice: string, attitude: string, understanding: string): number | null {
  const practiceValue = toNumber(practice);
  const attitudeValue = toNumber(attitude);
  const understandingValue = toNumber(understanding);

  if (practiceValue === null || attitudeValue === null || understandingValue === null) return null;

  return Math.round(((practiceValue + attitudeValue + understandingValue) / 3) * 100) / 100;
}

function resolveGraduation(attendance: string, finalScore: number | null) {
  if (attendance !== "Hadir") return "Tidak Lulus";
  if (finalScore === null) return "Belum Dinilai";
  return finalScore >= 70 ? "Lulus" : "Tidak Lulus";
}

function getCandidateLabel(candidate: InstructorTrainingResultCandidateApi | null) {
  if (!candidate) return null;

  return {
    code: candidate.kode_booking ?? `Booking ${candidate.id}`,
    participantName: candidate.peserta?.nama_peserta ?? "Peserta",
    participantCode: candidate.peserta?.kode_peserta ?? "-",
    packageName: candidate.course_package?.nama_paket ?? "Paket belum tersedia",
    date: candidate.training_schedule?.tanggal_latihan ?? "Tanggal belum tersedia",
    time: getTimeRange(candidate.training_schedule?.time_slot),
    vehicle: candidate.training_schedule?.vehicle?.nama_kendaraan ?? "Kendaraan belum tersedia",
    plate: candidate.training_schedule?.vehicle?.nomor_plat ?? "-",
    scheduleCode: candidate.training_schedule?.kode_jadwal ?? "-",
    sessionLabel: candidate.session_label ?? `Sesi ${candidate.sesi_ke ?? 1}/${candidate.total_sesi ?? 1}`,
    sesiKe: candidate.sesi_ke ?? 1,
    totalSesi: candidate.total_sesi ?? 1,
    isFinalSession: Boolean(candidate.is_final_session),
  };
}

function getResultLabel(result: InstructorTrainingResultApi | null) {
  if (!result) return null;

  return {
    code: result.booking?.kode_booking ?? `Hasil ${result.id}`,
    participantName: result.peserta?.nama_peserta ?? "Peserta",
    participantCode: result.peserta?.kode_peserta ?? "-",
    packageName: result.booking?.course_package?.nama_paket ?? "Paket belum tersedia",
    date: result.training_schedule?.tanggal_latihan ?? result.tanggal_latihan ?? "Tanggal belum tersedia",
    time: getTimeRange(result.training_schedule?.time_slot),
    vehicle: result.training_schedule?.vehicle?.nama_kendaraan ?? "Kendaraan belum tersedia",
    plate: result.training_schedule?.vehicle?.nomor_plat ?? "-",
    scheduleCode: result.training_schedule?.kode_jadwal ?? "-",
    sessionLabel: result.session_label ?? `Sesi ${result.sesi_ke ?? 1}/${result.total_sesi ?? 1}`,
    sesiKe: result.sesi_ke ?? 1,
    totalSesi: result.total_sesi ?? 1,
    isFinalSession: Boolean(result.is_final_session),
  };
}

export default function InputTrainingResultView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const mode = searchParams.get("mode") === "edit" ? "edit" : "create";
  const numericId = Number(id);

  const [candidate, setCandidate] = useState<InstructorTrainingResultCandidateApi | null>(null);
  const [result, setResult] = useState<InstructorTrainingResultApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [attendance, setAttendance] = useState<"Hadir" | "Tidak Hadir" | "Izin">("Hadir");
  const [practiceScore, setPracticeScore] = useState("");
  const [attitudeScore, setAttitudeScore] = useState("");
  const [understandingScore, setUnderstandingScore] = useState("");
  const [graduationStatus, setGraduationStatus] = useState<"Belum Dinilai" | "Lulus" | "Tidak Lulus">("Belum Dinilai");
  const [note, setNote] = useState("");

  const loadData = useCallback(async () => {
    if (!id || Number.isNaN(numericId)) {
      setLoadError("ID hasil latihan tidak valid.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);

      if (mode === "edit") {
        const response = await getInstructorTrainingResultDetail(numericId);
        const item = response.item;

        setResult(item);
        setAttendance((item.status_kehadiran as "Hadir" | "Tidak Hadir" | "Izin") ?? "Hadir");
        setPracticeScore(normalizeScore(item.nilai_praktik));
        setAttitudeScore(normalizeScore(item.nilai_sikap));
        setUnderstandingScore(normalizeScore(item.nilai_pemahaman));
        setGraduationStatus((item.status_kelulusan as "Belum Dinilai" | "Lulus" | "Tidak Lulus") ?? "Belum Dinilai");
        setNote(item.catatan_instruktur ?? "");
        return;
      }

      const response = await getInstructorTrainingResultCandidates({ per_page: 100 });
      const found = response.items.find((item) => Number(item.id) === numericId) ?? null;

      if (!found) {
        setLoadError("Kandidat hasil latihan tidak ditemukan atau sudah memiliki hasil latihan.");
        return;
      }

      setCandidate(found);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Data hasil latihan gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [id, mode, numericId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const label = mode === "edit" ? getResultLabel(result) : getCandidateLabel(candidate);
  const isFinalSession = label?.isFinalSession ?? true;
  const sessionLabel = label?.sessionLabel ?? "Sesi latihan";

  const computedFinalScore = useMemo(() => {
    return getAverageScore(practiceScore, attitudeScore, understandingScore);
  }, [attitudeScore, practiceScore, understandingScore]);

  useEffect(() => {
    if (!isFinalSession) {
      setGraduationStatus("Belum Dinilai");
      return;
    }

    setGraduationStatus(resolveGraduation(attendance, computedFinalScore));
  }, [attendance, computedFinalScore, isFinalSession]);

  function buildPayload(): SaveInstructorTrainingResultPayload {
    return {
      booking_id: mode === "create" ? numericId : undefined,
      status_kehadiran: attendance,
      nilai_praktik: isFinalSession ? toNumber(practiceScore) : null,
      nilai_sikap: isFinalSession ? toNumber(attitudeScore) : null,
      nilai_pemahaman: isFinalSession ? toNumber(understandingScore) : null,
      nilai_akhir: null,
      status_kelulusan: isFinalSession ? graduationStatus : "Belum Dinilai",
      catatan_instruktur: note.trim() || null,
    };
  }

  function validateForm() {
    if (isFinalSession && attendance === "Hadir") {
      const scores = [practiceScore, attitudeScore, understandingScore];

      if (scores.some((value) => value.trim() === "")) {
        return "Nilai praktik, sikap, dan pemahaman wajib diisi pada sesi terakhir jika peserta hadir.";
      }
    }

    if (!note.trim()) {
      return "Catatan instruktur wajib diisi.";
    }

    return null;
  }

  async function handleSaveResult() {
    const validationMessage = validateForm();

    if (validationMessage) {
      setSubmitError(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      if (mode === "edit") {
        await updateInstructorTrainingResult(numericId, buildPayload());
      } else {
        await createInstructorTrainingResult(buildPayload());
      }

      navigate("/instruktur/hasil-latihan", {
        state: {
          successMessage:
            mode === "edit"
              ? "Hasil latihan berhasil diperbarui."
              : trainingResultSuccessMessage,
        },
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Hasil latihan gagal disimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f5f7fb] px-4 py-10 sm:-m-6 sm:px-6 lg:-m-7 lg:px-8 xl:-m-8">
        <Card className="mx-auto max-w-3xl rounded-3xl p-8 shadow-sm">
          <LoadingSpinner label="Memuat data hasil latihan..." />
        </Card>
      </div>
    );
  }

  if (loadError || !label) {
    return (
      <div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f5f7fb] px-4 py-10 sm:-m-6 sm:px-6 lg:-m-7 lg:px-8 xl:-m-8">
        <EmptyState
          icon={<FileCheck2 className="h-7 w-7" />}
          title={trainingResultNotFoundMessage.title}
          description={loadError ?? trainingResultNotFoundMessage.description}
          action={
            <Button
              className="bg-slate-950 hover:bg-slate-800"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate("/instruktur/hasil-latihan")}
            >
              Kembali
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f5f7fb] px-4 py-6 sm:-m-6 sm:px-6 lg:-m-7 lg:px-7 xl:-m-8 xl:px-8">
      <div className="mx-auto w-full max-w-295">
        <Button
          variant="ghost"
          className="mb-5 px-0 text-blue-700 hover:bg-transparent"
          leftIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => navigate("/instruktur/hasil-latihan")}
        >
          Kembali
        </Button>

        <PageHeader
          eyebrow={mode === "edit" ? "Update Hasil Latihan" : "Input Hasil Latihan"}
          title={label.code}
          description={isFinalSession
            ? "Sesi terakhir paket. Input nilai akhir dan kelulusan final peserta."
            : "Sesi non-final. Input kehadiran dan catatan perkembangan; kelulusan final belum ditentukan."
          }
          className="mb-0 lg:items-start"
          eyebrowClassName="text-xs tracking-[0.2em]"
          titleClassName="text-3xl font-extrabold md:text-4xl"
          descriptionClassName="max-w-2xl text-base leading-7"
          actions={
            <TrainingResultStatusBadge
              status={!isFinalSession ? "BELUM DINILAI" : graduationStatus === "Lulus" ? "LULUS" : graduationStatus === "Tidak Lulus" ? "TIDAK LULUS" : "BELUM DINILAI"}
            />
          }
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="space-y-6">
            <Card className="rounded-3xl p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Tanggal
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-950">
                    {label.date}
                  </p>
                  <p className="text-sm text-slate-500">{label.scheduleCode}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Jam Sesi
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-950">
                    {label.time}
                  </p>
                  <p className="text-sm text-slate-500">Slot latihan</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Kendaraan
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-950">
                    {label.vehicle}
                  </p>
                  <p className="text-sm text-slate-500">{label.plate}</p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Peserta
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-950">
                    {label.participantName}
                  </p>
                  <p className="text-sm text-slate-500">{label.participantCode}</p>
                </div>
              </div>
            </Card>

            {submitError ? (
              <ErrorMessage title="Gagal Menyimpan" message={submitError} />
            ) : null}

            <Card className="rounded-3xl p-5">
              <div className="mb-6 flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <UserRound className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Peserta Dinilai
                  </p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-950">
                    {label.participantName}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">{label.packageName}</p>
                  <p className="mt-2 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-blue-700">
                    {sessionLabel}
                  </p>
                </div>
              </div>

              <div className={cn("grid gap-5", isFinalSession ? "sm:grid-cols-2" : "sm:grid-cols-1")}>
                <Select
                  label="Status Kehadiran"
                  value={attendance}
                  onChange={(event) => setAttendance(event.target.value as "Hadir" | "Tidak Hadir" | "Izin")}
                  options={attendanceOptions}
                  className="bg-slate-100"
                />

                {isFinalSession ? (
                  <Input
                    label="Status Kelulusan Final"
                    value={graduationStatus}
                    readOnly
                    hint="Ditentukan otomatis dari kehadiran dan nilai akhir."
                    className="bg-slate-100"
                  />
                ) : null}
              </div>

              {!isFinalSession ? (
                <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm leading-6 text-slate-600">
                  Sesi ini belum menjadi sesi terakhir. Instruktur cukup mengisi kehadiran dan catatan perkembangan. Nilai serta kelulusan final baru diisi pada sesi terakhir paket.
                </div>
              ) : (
                <div className="mt-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Nilai Akhir Latihan
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Isi tiga nilai komponen. Nilai akhir dan status kelulusan dihitung otomatis.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Input
                      label="Nilai Praktik"
                      type="number"
                      min={0}
                      max={100}
                      value={practiceScore}
                      onChange={(event) => setPracticeScore(event.target.value)}
                      placeholder="0-100"
                      className="bg-slate-100"
                    />

                    <Input
                      label="Nilai Sikap"
                      type="number"
                      min={0}
                      max={100}
                      value={attitudeScore}
                      onChange={(event) => setAttitudeScore(event.target.value)}
                      placeholder="0-100"
                      className="bg-slate-100"
                    />

                    <Input
                      label="Nilai Pemahaman"
                      type="number"
                      min={0}
                      max={100}
                      value={understandingScore}
                      onChange={(event) => setUnderstandingScore(event.target.value)}
                      placeholder="0-100"
                      className="bg-slate-100"
                    />

                    <Input
                      label="Nilai Akhir"
                      value={computedFinalScore !== null ? String(computedFinalScore) : "Otomatis"}
                      readOnly
                      hint="Dihitung otomatis dari nilai praktik, sikap, dan pemahaman."
                      className="bg-slate-100"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6">
                <TextArea
                  label="Catatan Instruktur"
                  requiredMark
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={5}
                  placeholder="Contoh: Peserta sudah lancar dalam perpindahan gigi dan perlu meningkatkan kontrol saat tanjakan."
                  className="bg-slate-100"
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
                <Button
                  className="h-11 rounded-xl bg-slate-950 px-6 text-sm font-bold uppercase tracking-[0.08em] hover:bg-slate-800"
                  leftIcon={<Save className="h-4 w-4" />}
                  loading={submitting}
                  onClick={handleSaveResult}
                >
                  {mode === "edit" ? "Update Hasil" : isFinalSession ? "Simpan Hasil Final" : "Simpan Absensi Sesi"}
                </Button>

                <Button
                  variant="ghost"
                  className="ml-0 h-11 rounded-xl text-xs font-bold text-blue-700 hover:bg-blue-50 sm:ml-auto"
                  onClick={() => navigate("/instruktur/hasil-latihan")}
                  disabled={submitting}
                >
                  Batalkan
                </Button>
              </div>
            </Card>
          </main>

          <aside className="space-y-5">
            <Card className="rounded-3xl p-5">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-blue-700" />
                <h2 className="text-lg font-extrabold text-slate-950">
                  Detail Sesi
                </h2>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-950">{label.date}</p>
                    <p className="text-sm text-slate-500">{label.time}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Car className="mt-1 h-4 w-4 shrink-0 text-slate-500" />
                  <div>
                    <p className="text-sm font-bold text-slate-950">{label.vehicle}</p>
                    <p className="text-sm text-slate-500">{label.plate}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Status Sesi
                  </p>
                  <p className="mt-2 text-3xl font-black text-slate-950">
                    {isFinalSession ? (computedFinalScore ?? "-") : sessionLabel}
                  </p>
                  <p className={cn(
                    "mt-1 text-sm font-semibold",
                    isFinalSession
                      ? graduationStatus === "Lulus"
                        ? "text-emerald-600"
                        : graduationStatus === "Tidak Lulus"
                          ? "text-red-600"
                          : "text-amber-600"
                      : "text-amber-600",
                  )}>
                    {isFinalSession ? graduationStatus : "Belum Final"}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-3xl border-blue-100 bg-blue-50/70 p-5 shadow-none">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">
                Catatan Alur
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {isFinalSession
                  ? "Ini adalah sesi terakhir paket. Backend akan menyimpan kelulusan final dan membuka proses validasi sertifikat jika peserta lulus."
                  : "Ini adalah sesi non-final. Backend hanya mencatat kehadiran, catatan, dan nilai perkembangan; status kelulusan tetap Belum Dinilai."}
              </p>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
