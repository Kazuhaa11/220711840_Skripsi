import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Car, Clock3, UserRound } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableWrapper,
} from "@/components/ui/Table";
import type { InstructorTeachingSchedulePackageDetailApi } from "@/types/instructor";
import { getInstructorTeachingSchedulePackageDetail } from "@/services/instructor.service";

function formatSessionLabel(sesiKe?: number | null, totalSesi?: number | null) {
  if (!sesiKe || !totalSesi) return "Sesi";
  return `Sesi ${sesiKe}/${totalSesi}`;
}

function getTimeRange(session: InstructorTeachingSchedulePackageDetailApi["sessions"][number]) {
  const slot = session.training_schedule?.time_slot;
  return `${slot?.jam_mulai ?? "--:--"} - ${slot?.jam_selesai ?? "--:--"}`;
}

function getScheduleDate(session: InstructorTeachingSchedulePackageDetailApi["sessions"][number]) {
  return session.training_schedule?.tanggal_latihan ?? "-";
}

function getScheduleDay(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(date);
}

function getResultLabel(session: InstructorTeachingSchedulePackageDetailApi["sessions"][number]) {
  if (session.training_result?.status_kehadiran) {
    return session.training_result.status_kehadiran;
  }

  return session.status_booking === "Selesai" ? "Sudah selesai" : "Belum input";
}

export default function TeachingSchedulePackageDetailView() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<InstructorTeachingSchedulePackageDetailApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!groupId) {
      setError("ID paket jadwal tidak valid.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getInstructorTeachingSchedulePackageDetail(groupId);
      setItem(response.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Detail paket jadwal gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f5f7fb] p-6 sm:-m-6 lg:-m-7 xl:-m-8">
        <Card className="mx-auto max-w-295 rounded-3xl p-8 shadow-sm">
          <LoadingSpinner label="Memuat detail sesi jadwal mengajar..." />
        </Card>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f5f7fb] p-6 sm:-m-6 lg:-m-7 xl:-m-8">
        <div className="mx-auto max-w-295 space-y-4">
          <Button
            variant="ghost"
            className="rounded-xl text-slate-600"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => navigate("/instruktur/jadwal-mengajar")}
          >
            Kembali
          </Button>
          <ErrorMessage title="Gagal Memuat Detail" message={error ?? "Data tidak ditemukan."} />
        </div>
      </div>
    );
  }

  return (
    <div className="-m-4 min-h-[calc(100vh-64px)] bg-[#f5f7fb] sm:-m-6 lg:-m-7 xl:-m-8">
      <div className="border-b border-slate-200 bg-white px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-295 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Button
              variant="ghost"
              className="mb-4 h-auto rounded-xl px-0 text-sm font-bold text-slate-500 hover:bg-transparent"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate("/instruktur/jadwal-mengajar")}
            >
              Kembali ke Jadwal Mengajar
            </Button>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
              {item.kode_group ?? `Paket #${item.id}`}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
              Detail Sesi Jadwal Mengajar
            </h1>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              Menampilkan seluruh sesi dalam paket booking yang ditugaskan kepada Anda.
            </p>
          </div>

          <Badge className="w-fit bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-blue-700">
            {item.progress_label ?? `${item.jumlah_sesi_selesai ?? 0}/${item.total_sesi ?? 0} sesi`}
          </Badge>
        </div>
      </div>

      <div className="mx-auto w-full max-w-295 px-4 py-6 sm:px-6 lg:px-7">
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="rounded-3xl p-5 shadow-sm">
            <div className="flex gap-3">
              <UserRound className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Peserta
                </p>
                <p className="mt-2 text-lg font-extrabold text-slate-950">
                  {item.participant?.nama_peserta ?? "Peserta"}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  {item.course_package?.nama_paket ?? "Paket kursus"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl p-5 shadow-sm">
            <div className="flex gap-3">
              <Car className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Kendaraan
                </p>
                <p className="mt-2 text-lg font-extrabold text-slate-950">
                  {item.vehicle?.nama_kendaraan ?? "Kendaraan"}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  {item.vehicle?.nomor_plat ?? "-"} • {item.vehicle?.transmisi ?? "-"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="rounded-3xl p-5 shadow-sm">
            <div className="flex gap-3">
              <CalendarDays className="mt-1 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Status Paket
                </p>
                <p className="mt-2 text-lg font-extrabold text-slate-950">
                  {item.status ?? "-"}
                </p>
                <p className="text-sm font-medium text-slate-500">
                  Pembayaran: {item.payment?.status ?? "-"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <TableWrapper className="mt-6 rounded-3xl border-0 shadow-xl shadow-slate-200/70">
          <Table>
            <TableHead className="bg-white">
              <TableRow>
                <TableHeaderCell className="py-4 text-slate-400">Sesi</TableHeaderCell>
                <TableHeaderCell className="py-4 text-slate-400">Tanggal & Hari</TableHeaderCell>
                <TableHeaderCell className="py-4 text-slate-400">Jam</TableHeaderCell>
                <TableHeaderCell className="py-4 text-slate-400">Kendaraan</TableHeaderCell>
                <TableHeaderCell className="py-4 text-slate-400">Status</TableHeaderCell>
                <TableHeaderCell className="py-4 text-slate-400">Hasil</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {item.sessions.map((session) => (
                <TableRow key={session.booking_id} className="border-slate-100">
                  <TableCell className="px-5 py-5">
                    <p className="text-sm font-extrabold text-slate-950">
                      {formatSessionLabel(session.sesi_ke, session.total_sesi)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {session.kode_booking ?? `Booking #${session.booking_id}`}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-5">
                    <p className="text-sm font-bold text-slate-950">
                      {getScheduleDate(session)}
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      {getScheduleDay(session.training_schedule?.tanggal_latihan)}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                      <Clock3 className="h-4 w-4 text-slate-400" />
                      {getTimeRange(session)}
                    </div>
                  </TableCell>
                  <TableCell className="px-5 py-5">
                    <p className="text-sm font-bold text-slate-950">
                      {session.training_schedule?.vehicle?.nama_kendaraan ?? "-"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {session.training_schedule?.vehicle?.nomor_plat ?? "-"} • {session.training_schedule?.vehicle?.transmisi ?? "-"}
                    </p>
                  </TableCell>
                  <TableCell className="px-5 py-5">
                    <Badge className="bg-slate-100 text-slate-700">
                      {session.status_booking ?? "-"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-5 py-5">
                    <p className="text-sm font-bold text-slate-950">
                      {getResultLabel(session)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-400">
                      {session.training_result?.status_kelulusan ?? "Belum Dinilai"}
                    </p>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableWrapper>
      </div>
    </div>
  );
}
