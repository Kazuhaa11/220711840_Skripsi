import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import type { SelectedCoursePackage } from "@/features/participant/hooks/useSelectedCoursePackage";
import BookingRulesCard from "@/features/participant/components/available-schedule/schedule-available/BookingRulesCard";
import ActivePackageSummaryCard from "@/features/participant/components/available-schedule/schedule-available/ActivePackageSummaryCard";
import AvailableScheduleHeader from "@/features/participant/components/available-schedule/schedule-available/AvailableScheduleHeader";
import ScheduleHelpCard from "@/features/participant/components/available-schedule/schedule-available/ScheduleHelpCard";
import { saveBookingPackageConfirmationDraft } from "@/features/participant/utils/bookingPackageDraftStorage";
import {
  CalendarDays,
  Car,
  CircleAlert,
  Clock3,
  RotateCcw,
  SearchCheck,
  UserRound,
} from "lucide-react";
import {
  getParticipantTimeSlots,
  previewParticipantPackageSchedule,
} from "@/services/booking.service";
import type { TimeSlotApiItem } from "@/types/booking";

interface AvailableScheduleViewProps {
  selectedPackage: SelectedCoursePackage;
  onChangePackage: () => void;
}

function getTodayIso(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTimeSlotLabel(slot: TimeSlotApiItem): string {
  const timeRange = `${slot.jam_mulai ?? "--:--"} - ${slot.jam_selesai ?? "--:--"}`;
  const duration = slot.durasi_label ?? `${slot.durasi_menit} menit`;
  return `${slot.nama_slot} (${timeRange}) • ${duration}`;
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage;
}

export default function AvailableScheduleView({
  selectedPackage,
  onChangePackage,
}: AvailableScheduleViewProps) {
  const navigate = useNavigate();

  const [tanggalMulai, setTanggalMulai] = useState(getTodayIso);
  const [timeSlotId, setTimeSlotId] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlotApiItem[]>([]);
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(true);
  const [timeSlotError, setTimeSlotError] = useState<string | null>(null);

  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTimeSlots() {
      try {
        setIsLoadingTimeSlots(true);
        setTimeSlotError(null);

        const response = await getParticipantTimeSlots();

        if (!isMounted) return;

        setTimeSlots(response.items);
        setTimeSlotId((currentValue) => currentValue || String(response.items[0]?.id ?? ""));
      } catch (error) {
        if (!isMounted) return;

        setTimeSlots([]);
        setTimeSlotError(getErrorMessage(error, "Data slot waktu gagal dimuat."));
      } finally {
        if (isMounted) {
          setIsLoadingTimeSlots(false);
        }
      }
    }

    void loadTimeSlots();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handlePreviewSchedule() {
    if (!tanggalMulai) {
      setPreviewError("Tanggal mulai latihan wajib dipilih.");
      return;
    }

    if (!timeSlotId) {
      setPreviewError("Jam awal latihan wajib dipilih.");
      return;
    }

    try {
      setIsPreviewLoading(true);
      setPreviewError(null);

      const preview = await previewParticipantPackageSchedule({
        course_package_id: Number(selectedPackage.id),
        tanggal_mulai: tanggalMulai,
        time_slot_id: Number(timeSlotId),
        pakai_antar_jemput: selectedPackage.pakaiAntarJemput,
        pakai_sim: selectedPackage.pakaiSim,
      });

      saveBookingPackageConfirmationDraft({
        selectedPackage,
        preview,
        tanggalMulai,
        timeSlotId: Number(timeSlotId),
      });

      navigate("/peserta/jadwal-tersedia/konfirmasi");
    } catch (error) {
      setPreviewError(getErrorMessage(error, "Preview jadwal paket gagal dibuat."));
    } finally {
      setIsPreviewLoading(false);
    }
  }

  function handleResetPlanner() {
    setTanggalMulai(getTodayIso());
    setTimeSlotId(String(timeSlots[0]?.id ?? ""));
    setPreviewError(null);
  }

  return (
    <div className="mx-auto max-w-7xl overflow-x-hidden">
      <section className="rounded-2xl bg-[#eef3f9] p-3 sm:rounded-[28px] sm:p-6 lg:p-7">
        <AvailableScheduleHeader />

        <div className="mt-5 sm:mt-8">
          <ActivePackageSummaryCard
            selectedPackage={selectedPackage}
            onChangePackage={onChangePackage}
          />
        </div>

        <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-4 sm:space-y-5">
            <Card className="rounded-2xl p-4 shadow-[0_12px_36px_rgba(15,23,42,0.08)] sm:rounded-[28px] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-700">
                    Cek Ketersediaan Jadwal Paket
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    Pilih tanggal dan jam awal latihan
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Sistem mengambil slot waktu aktif dari backend, lalu menyusun seluruh sesi paket secara otomatis. Instruktur dan kendaraan dibuat konsisten untuk satu paket, sedangkan tanggal atau jam dapat disesuaikan jika jadwal target tidak tersedia.
                  </p>
                </div>

                <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right ring-1 ring-blue-100">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
                    Paket Dipilih
                  </p>
                  <p className="mt-1 font-black text-slate-950">{selectedPackage.name}</p>
                  <p className="text-sm font-semibold text-slate-600">{selectedPackage.price}</p>
                </div>
              </div>

              {previewError ? (
                <div className="mt-5">
                  <ErrorMessage title="Preview jadwal gagal" message={previewError} />
                </div>
              ) : null}

              {timeSlotError ? (
                <div className="mt-5">
                  <ErrorMessage title="Slot waktu gagal dimuat" message={timeSlotError} />
                </div>
              ) : null}

              <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                <Input
                  label="Tanggal Mulai"
                  requiredMark
                  type="date"
                  min={getTodayIso()}
                  value={tanggalMulai}
                  onChange={(event) => setTanggalMulai(event.target.value)}
                  labelClassName="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700"
                  className="h-12 rounded-2xl bg-slate-50 font-medium text-slate-900 focus:bg-white"
                  leftIcon={<CalendarDays className="h-4 w-4" />}
                />

                <Select
                  label="Jam Awal Latihan"
                  value={timeSlotId}
                  onChange={(event) => setTimeSlotId(event.target.value)}
                  options={timeSlots.map((item) => ({
                    label: getTimeSlotLabel(item),
                    value: String(item.id),
                  }))}
                  disabled={isLoadingTimeSlots || timeSlots.length === 0}
                  leftIcon={<Clock3 className="h-4 w-4" />}
                  className="h-12 rounded-2xl bg-slate-50 font-medium text-slate-900 focus:bg-white"
                />

                <div className="flex gap-3">
                  <Button
                    onClick={() => void handlePreviewSchedule()}
                    loading={isPreviewLoading}
                    disabled={isLoadingTimeSlots || timeSlots.length === 0}
                    className="h-11 rounded-2xl px-4 text-xs font-bold uppercase tracking-wide sm:h-12 sm:px-6 sm:text-sm"
                  >
                    Cek Jadwal
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleResetPlanner}
                    className="h-12 w-12 rounded-2xl border-slate-200 bg-slate-50 px-0 text-slate-600 hover:bg-slate-100"
                    aria-label="Reset pilihan jadwal"
                  >
                    <RotateCcw className="h-5 w-5" />
                    <span className="sr-only">Reset pilihan jadwal</span>
                  </Button>
                </div>
              </div>

              {isLoadingTimeSlots ? (
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-600">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600/20 border-t-blue-600" />
                  Memuat slot waktu aktif
                </div>
              ) : null}

              
            </Card>

            <Card className="rounded-2xl p-4 text-center shadow-[0_12px_36px_rgba(15,23,42,0.08)] sm:rounded-[28px] sm:p-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 sm:h-16 sm:w-16 sm:rounded-3xl">
                <SearchCheck className="h-7 w-7" />
              </div>
              <h3 className="mt-3 text-lg font-black text-slate-950 sm:mt-4 sm:text-2xl">
                Preview jadwal ditampilkan di halaman konfirmasi
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
                Setelah klik Cek Jadwal, sistem akan membuka halaman konfirmasi khusus agar seluruh sesi paket bisa diperiksa lebih nyaman sebelum booking disimpan.
              </p>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-5">
            <BookingRulesCard
              items={[
                {
                  icon: CircleAlert,
                  text: "Peserta booking satu paket, bukan booking sesi satu per satu.",
                },
                {
                  icon: SearchCheck,
                  text: "Sistem otomatis menyusun seluruh sesi berdasarkan tanggal dan jam awal.",
                },
                {
                  icon: UserRound,
                  text: "Instruktur dibuat sama untuk semua sesi agar evaluasi konsisten.",
                },
                {
                  icon: Car,
                  text: "Kendaraan dibuat sama untuk semua sesi agar peserta tidak perlu adaptasi ulang.",
                },
                {
                  icon: Clock3,
                  text: "Tanggal atau jam dapat disesuaikan otomatis jika target jadwal bentrok.",
                },
              ]}
            />

            <ScheduleHelpCard />
          </div>
        </div>
      </section>
    </div>
  );
}
