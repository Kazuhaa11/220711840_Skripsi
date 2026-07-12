import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import BookingSuccessModal from "@/features/participant/components/available-schedule/schedule-available/BookingSuccessModal";
import PaymentProofUploadModal from "@/features/participant/components/available-schedule/schedule-available/PaymentProofUploadModal";
import {
  clearBookingPackageConfirmationDraft,
  getBookingPackageConfirmationDraft,
} from "@/features/participant/utils/bookingPackageDraftStorage";
import {
  createParticipantPackageBooking,
  getParticipantTimeSlots,
  previewParticipantPackageSession,
  uploadParticipantPaymentProof,
} from "@/services/booking.service";
import type { AvailableScheduleSlot } from "@/features/participant/constants/type";
import type {
  BookingApiItem,
  BookingGroupApiItem,
  BookingPackagePreviewData,
  BookingPackagePreviewSessionData,
  BookingPaymentMethod,
  TimeSlotApiItem,
} from "@/types/booking";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  Clock3,
  MapPin,
  Route,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

type SuccessModalMode = "booking" | "payment";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function resolveTimeCategory(startTime: string | null | undefined): AvailableScheduleSlot["timeCategory"] {
  const hour = Number((startTime ?? "").split(":")[0]);
  if (Number.isNaN(hour)) return "pagi";
  if (hour < 12) return "pagi";
  if (hour < 16) return "siang";
  return "sore";
}

function previewToFirstSlot(preview: BookingPackagePreviewData | null): AvailableScheduleSlot | null {
  const firstSession = preview?.sessions[0];
  if (!preview || !firstSession) return null;

  const parsedDate = new Date(`${firstSession.tanggal_latihan}T00:00:00`);
  const dayLabel = Number.isNaN(parsedDate.getTime())
    ? "-"
    : new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(parsedDate).toUpperCase();
  const dayNumber = Number.isNaN(parsedDate.getTime())
    ? "-"
    : new Intl.DateTimeFormat("id-ID", { day: "2-digit" }).format(parsedDate);
  const monthYearLabel = Number.isNaN(parsedDate.getTime())
    ? "-"
    : new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(parsedDate).toUpperCase();

  return {
    id: `${firstSession.tanggal_latihan}-${firstSession.time_slot.id}`,
    date: firstSession.tanggal_latihan,
    dayLabel,
    dayNumber,
    monthYearLabel,
    dateLabel: formatDate(firstSession.tanggal_latihan),
    timeRange: `${firstSession.time_slot.jam_mulai} - ${firstSession.time_slot.jam_selesai}`,
    timeCategory: resolveTimeCategory(firstSession.time_slot.jam_mulai),
    instructorName: preview.instructor.nama_instruktur ?? "Instruktur belum ditentukan",
    vehicleName: `${preview.vehicle.nama_kendaraan} (${preview.vehicle.transmisi})`,
    remainingQuota: 1,
    status: "TERSEDIA",
  };
}

function bookingGroupToPaymentBooking(group: BookingGroupApiItem): BookingApiItem | null {
  const firstSession = group.sessions[0];
  if (!firstSession || !group.course_package) return null;

  return {
    id: group.payment?.booking_id ?? firstSession.id,
    kode_booking: group.kode_group,
    status: group.status,
    tanggal_booking: group.tanggal_booking,
    tanggal_dikonfirmasi: group.tanggal_dikonfirmasi,
    tanggal_dibatalkan: group.tanggal_dibatalkan,
    alasan_pembatalan: group.alasan_pembatalan,
    catatan: group.catatan,
    pakai_antar_jemput: group.pakai_antar_jemput,
    pakai_sim: group.pakai_sim,
    alamat_jemput: group.alamat_jemput,
    harga_paket: group.harga_paket,
    course_package: group.course_package,
    training_schedule: firstSession.training_schedule,
    payment: group.payment
      ? {
          id: group.payment.id,
          nominal_bayar: group.payment.nominal_bayar,
          metode_pembayaran: group.payment.metode_pembayaran ?? "Transfer",
          metode_pembayaran_label: group.payment.metode_pembayaran_label ?? resolvePaymentMethodLabel(group.payment.metode_pembayaran ?? "Transfer"),
          bukti_bayar: null,
          bukti_bayar_url: null,
          bukti_bayar_original_name: null,
          bukti_bayar_mime: null,
          bukti_bayar_size: null,
          ada_bukti_bayar: group.payment.ada_bukti_bayar,
          bukti_bayar_legacy: false,
          nama_pengirim: null,
          bank_pengirim: null,
          tanggal_upload: group.payment.tanggal_upload,
          tanggal_verifikasi: group.payment.tanggal_verifikasi,
          status: group.payment.status,
          catatan_peserta: null,
          catatan_admin: null,
          alasan_penolakan: null,
        }
      : null,
    created_at: group.created_at,
    updated_at: group.updated_at,
  };
}

function getErrorMessage(error: unknown, fallbackMessage: string): string {
  return error instanceof Error ? error.message : fallbackMessage;
}
function resolvePaymentMethodLabel(method: BookingPaymentMethod): string {
  return method === "Cash" ? "Cash" : "Transfer Bank";
}

function resolvePaymentInstruction(method: BookingPaymentMethod): string {
  return method === "Cash"
    ? "Booking berhasil dibuat. Silakan lakukan pembayaran cash kepada admin. Status akan aktif setelah admin mengonfirmasi pembayaran."
    : "Paket berhasil dibuat. Silakan unggah bukti bayar agar admin bisa memverifikasi.";
}


export default function BookingPackageConfirmationPage() {
  const navigate = useNavigate();
  const { showNotification } = useFloatingNotification();
  const [draft] = useState(getBookingPackageConfirmationDraft);
  const [previewPlan, setPreviewPlan] = useState<BookingPackagePreviewData | null>(() => draft?.preview ?? null);
  const [alamatJemput, setAlamatJemput] = useState("");
  const [catatan, setCatatan] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<BookingPaymentMethod>("Transfer");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [createdBooking, setCreatedBooking] = useState<BookingApiItem | null>(null);

  const [successModalOpened, setSuccessModalOpened] = useState(false);
  const [successModalMode, setSuccessModalMode] = useState<SuccessModalMode>("booking");
  const [paymentModalOpened, setPaymentModalOpened] = useState(false);
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [editSession, setEditSession] = useState<BookingPackagePreviewSessionData | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editSlotId, setEditSlotId] = useState("");
  const [timeSlots, setTimeSlots] = useState<TimeSlotApiItem[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const previewFirstSlot = useMemo(
    () => previewToFirstSlot(previewPlan),
    [previewPlan],
  );

  if (!draft || !previewPlan) {
    return (
      <div className="mx-auto max-w-5xl">
        <section className="rounded-[28px] bg-[#eef3f9] p-5 sm:p-6 lg:p-8">
          <Card className="rounded-[28px] p-8 text-center shadow-[0_12px_36px_rgba(15,23,42,0.08)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
              <CalendarDays className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-3xl font-black text-slate-950">
              Draft booking tidak ditemukan
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-base leading-7 text-slate-600">
              Silakan kembali ke halaman Jadwal Tersedia, pilih tanggal dan jam awal, lalu cek jadwal paket terlebih dahulu.
            </p>
            <Button
              onClick={() => navigate("/peserta/jadwal-tersedia")}
              className="mt-6 h-12 rounded-2xl px-6 text-sm font-bold uppercase tracking-wide"
            >
              Kembali ke Jadwal Tersedia
            </Button>
          </Card>
        </section>
      </div>
    );
  }

  const { selectedPackage, tanggalMulai, timeSlotId } = draft;
  const preview = previewPlan;


  async function handleOpenEditSession(session: BookingPackagePreviewSessionData) {
    setEditSession(session);
    setEditDate(session.tanggal_latihan);
    setEditSlotId(String(session.time_slot.id));
    setEditError(null);

    if (timeSlots.length === 0) {
      try {
        const response = await getParticipantTimeSlots();
        setTimeSlots(response.items);
      } catch (error) {
        setEditError(getErrorMessage(error, "Slot waktu gagal dimuat."));
      }
    }
  }

  async function handleApplyEditSession() {
    if (!editSession || !editDate || !editSlotId) {
      setEditError("Tanggal dan slot baru wajib dipilih.");
      return;
    }

    const hasDuplicateSession = preview.sessions.some((session) =>
      session.sesi_ke !== editSession.sesi_ke &&
      session.tanggal_latihan === editDate &&
      Number(session.time_slot.id) === Number(editSlotId),
    );

    if (hasDuplicateSession) {
      setEditError("Dalam satu paket tidak boleh ada dua sesi pada tanggal dan slot yang sama.");
      return;
    }

    try {
      setEditLoading(true);
      setEditError(null);

      const response = await previewParticipantPackageSession({
        course_package_id: Number(selectedPackage.id),
        tanggal_latihan: editDate,
        time_slot_id: Number(editSlotId),
        instructor_id: preview.instructor.id,
        vehicle_id: preview.vehicle.id,
        sesi_ke: editSession.sesi_ke,
        total_sesi: editSession.total_sesi,
        target_tanggal_latihan: editSession.target_tanggal_latihan,
        target_time_slot_id: editSession.target_time_slot.id,
      });

      setPreviewPlan((current) => {
        if (!current) return current;

        return {
          ...current,
          sessions: current.sessions.map((session) =>
            session.sesi_ke === editSession.sesi_ke ? response.item : session,
          ),
        };
      });

      setEditSession(null);
    } catch (error) {
      setEditError(getErrorMessage(error, "Jadwal sesi tidak tersedia. Coba tanggal atau slot lain."));
    } finally {
      setEditLoading(false);
    }
  }

  async function handleConfirmBooking() {
    if (selectedPackage.pakaiAntarJemput && !alamatJemput.trim()) {
      setBookingError("Alamat jemput wajib diisi jika memilih layanan antar jemput.");
      return;
    }

    try {
      setIsSubmitting(true);
      setBookingError(null);

      const response = await createParticipantPackageBooking({
        course_package_id: Number(selectedPackage.id),
        tanggal_mulai: tanggalMulai,
        time_slot_id: timeSlotId,
        pakai_antar_jemput: selectedPackage.pakaiAntarJemput,
        pakai_sim: selectedPackage.pakaiSim,
        alamat_jemput: selectedPackage.pakaiAntarJemput ? alamatJemput.trim() : null,
        catatan: catatan.trim() || null,
        metode_pembayaran: paymentMethod,
        sessions: preview.sessions.map((session) => ({
          sesi_ke: session.sesi_ke,
          tanggal_latihan: session.tanggal_latihan,
          time_slot_id: session.time_slot.id,
          target_tanggal_latihan: session.target_tanggal_latihan,
          target_time_slot_id: session.target_time_slot.id,
        })),
      });

      setCreatedBooking(bookingGroupToPaymentBooking(response.item));
      clearBookingPackageConfirmationDraft();
      setSuccessModalMode("booking");
      setSuccessModalOpened(true);
      setAlamatJemput("");
      setCatatan("");
      showNotification({
        type: "success",
        title: "Booking berhasil",
        message: resolvePaymentInstruction(paymentMethod),
        duration: 4000,
      });
    } catch (error) {
      const message = getErrorMessage(error, "Booking paket gagal dibuat.");
      setBookingError(message);
      showNotification({
        type: "error",
        title: "Booking gagal",
        message,
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUploadPaymentProof(payload: {
    nominalBayar: number;
    namaPengirim: string;
    bankPengirim: string;
    catatanPeserta: string;
    buktiBayar: File;
  }) {
    if (!createdBooking) return;

    try {
      setIsUploadingPayment(true);
      setPaymentError(null);

      const response = await uploadParticipantPaymentProof(createdBooking.id, {
        nominal_bayar: payload.nominalBayar,
        nama_pengirim: payload.namaPengirim.trim() || null,
        bank_pengirim: payload.bankPengirim.trim() || null,
        catatan_peserta: payload.catatanPeserta.trim() || null,
        bukti_bayar: payload.buktiBayar,
      });

      setCreatedBooking(response.item);
      setPaymentModalOpened(false);
      setSuccessModalMode("payment");
      setSuccessModalOpened(true);
      showNotification({
        type: "success",
        title: "Bukti bayar terkirim",
        message: "Bukti pembayaran sudah dikirim dan menunggu konfirmasi admin.",
        duration: 3500,
      });
    } catch (error) {
      const message = getErrorMessage(error, "Bukti bayar gagal diunggah.");
      setPaymentError(message);
      showNotification({
        type: "error",
        title: "Upload bukti bayar gagal",
        message,
        duration: 4000,
      });
    } finally {
      setIsUploadingPayment(false);
    }
  }

  function handleViewMySchedule() {
    setSuccessModalOpened(false);
    setPaymentModalOpened(false);
    navigate("/peserta/jadwal-saya", { replace: true });
  }

  function handleCloseSuccessModal() {
    setSuccessModalOpened(false);
    navigate("/peserta/jadwal-saya", { replace: true });
  }

  function handleClosePaymentModal() {
    setPaymentModalOpened(false);

    if (createdBooking) {
      navigate("/peserta/jadwal-saya", { replace: true });
    }
  }

  function handleOpenPaymentFromSuccess() {
    if (paymentMethod === "Cash") {
      setSuccessModalOpened(false);
      navigate("/peserta/jadwal-saya", { replace: true });
      return;
    }

    setSuccessModalOpened(false);
    setPaymentError(null);
    setPaymentModalOpened(true);
  }

  return (
    <>
      <div className="mx-auto max-w-7xl">
        <section className="rounded-[28px] bg-[#eef3f9] p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => navigate("/peserta/jadwal-tersedia")}
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-blue-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke cek jadwal
              </button>
              <p className="mt-6 text-[11px] font-black uppercase tracking-[0.24em] text-blue-700">
                Final Check
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 lg:text-4xl">
                Konfirmasi Booking Paket
              </h1>
              <p className="mt-2 max-w-3xl text-base leading-7 text-slate-600">
                Periksa rencana seluruh sesi latihan sebelum booking disimpan. Jadwal aktual akan dibuat otomatis setelah konfirmasi.
              </p>
            </div>

            <Card className="rounded-3xl p-5 text-right shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                Total Tagihan
              </p>
              <p className="mt-1 text-2xl font-black text-slate-950">
                {formatCurrency(preview.harga_paket)}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {selectedPackage.name} • {preview.total_sesi} sesi
              </p>
            </Card>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              {bookingError ? (
                <ErrorMessage title="Booking paket gagal dibuat" message={bookingError} />
              ) : null}

              <Card className="rounded-3xl p-5 shadow-sm sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-700">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Instruktur Tetap
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {preview.instructor.nama_instruktur ?? "Instruktur belum ditentukan"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-700">
                      <Car className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Kendaraan Tetap
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {preview.vehicle.nama_kendaraan} ({preview.vehicle.transmisi})
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2 xl:col-span-1">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-blue-700">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Durasi Per Sesi
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {preview.durasi_sesi_menit} menit
                    </p>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                {preview.sessions.map((session) => (
                  <Card key={`${session.sesi_ke}-${session.tanggal_latihan}`} className="rounded-3xl p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                          <Route className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
                            Sesi {session.sesi_ke}/{session.total_sesi}
                          </p>
                          <h4 className="mt-1 text-xl font-extrabold text-slate-950">
                            {formatDate(session.tanggal_latihan)}
                          </h4>
                          <p className="mt-1 text-base font-bold text-blue-700">
                            {session.time_slot.jam_mulai} - {session.time_slot.jam_selesai}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        onClick={() => void handleOpenEditSession(session)}
                        disabled={isSubmitting}
                        className="h-11 rounded-xl text-xs font-black uppercase tracking-[0.08em]"
                      >
                        Ubah Sesi
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="rounded-3xl p-5 shadow-sm">
                <h3 className="text-lg font-extrabold uppercase tracking-[0.18em] text-slate-900">
                  Detail Tambahan
                </h3>

                <div className="mt-5 grid gap-4">
                  {selectedPackage.pakaiAntarJemput ? (
                    <Input
                      label="Alamat Jemput"
                      requiredMark
                      value={alamatJemput}
                      onChange={(event) => setAlamatJemput(event.target.value)}
                      placeholder="Masukkan alamat penjemputan peserta"
                      labelClassName="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700"
                      className="h-12 rounded-2xl bg-slate-50 font-medium text-slate-900 focus:bg-white"
                      leftIcon={<MapPin className="h-4 w-4" />}
                    />
                  ) : null}

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
                      Metode Pembayaran
                    </p>
                    <div className="mt-2 grid gap-3 sm:grid-cols-2">
                      {(["Transfer", "Cash"] as BookingPaymentMethod[]).map((method) => {
                        const active = paymentMethod === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            disabled={isSubmitting}
                            className={`rounded-2xl border p-4 text-left transition ${
                              active
                                ? "border-blue-600 bg-blue-50 shadow-sm shadow-blue-100"
                                : "border-slate-200 bg-slate-50 hover:border-blue-200 hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-blue-600 text-white" : "bg-white text-slate-600"}`}>
                                <WalletCards className="h-4 w-4" />
                              </span>
                              <span>
                                <span className="block text-sm font-black text-slate-950">
                                  {resolvePaymentMethodLabel(method)}
                                </span>
                                <span className="mt-0.5 block text-xs font-semibold leading-5 text-slate-500">
                                  {method === "Transfer"
                                    ? "Upload bukti bayar setelah booking berhasil."
                                    : "Bayar cash ke admin tanpa upload bukti."}
                                </span>
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <TextArea
                    label="Catatan Booking"
                    value={catatan}
                    onChange={(event) => setCatatan(event.target.value)}
                    placeholder="Catatan opsional untuk admin/instruktur."
                    rows={4}
                    labelClassName="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700"
                    className="rounded-2xl bg-slate-50 text-base focus:bg-white"
                  />
                </div>
              </Card>
            </div>

            <aside className="space-y-5">
              <Card className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm">
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-200">
                  Siap Dipesan?
                </p>
                <h2 className="mt-3 text-3xl font-black">
                  {preview.total_sesi} sesi akan dibuat otomatis
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Semua sesi memakai instruktur dan kendaraan yang sama. Setelah konfirmasi, jadwal latihan akan muncul di admin dan peserta.
                </p>

                <div className="mt-5 rounded-2xl bg-white/10 p-4 text-sm leading-6 text-slate-200">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-1 h-4 w-4 text-emerald-300" />
                    <p>
                      {paymentMethod === "Cash"
                        ? "Pembayaran dipilih cash. Admin akan mengonfirmasi setelah pembayaran diterima."
                        : "Pembayaran dilakukan transfer. Upload bukti bayar bisa dilakukan setelah booking berhasil."}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => void handleConfirmBooking()}
                  loading={isSubmitting}
                  className="mt-6 h-14 w-full rounded-2xl bg-white text-sm font-black uppercase tracking-wide text-slate-950 hover:bg-slate-100"
                >
                  Ya, Konfirmasi Booking Paket
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/peserta/jadwal-tersedia")}
                  disabled={isSubmitting}
                  className="mt-3 h-12 w-full rounded-2xl border-white/20 bg-white/10 text-sm font-bold uppercase tracking-wide text-white hover:bg-white/15"
                >
                  Kembali Ubah Jadwal
                </Button>
              </Card>

              <Card className="rounded-3xl p-5 shadow-sm">
                <h3 className="text-base font-black text-slate-950">
                  Ringkasan Paket
                </h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-4">
                    <span>Paket</span>
                    <span className="font-bold text-slate-950">{selectedPackage.name}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Total sesi</span>
                    <span className="font-bold text-slate-950">{preview.total_sesi} sesi</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Layanan</span>
                    <span className="font-bold text-slate-950">{selectedPackage.serviceType}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Kategori</span>
                    <span className="font-bold text-slate-950">{selectedPackage.category}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Pembayaran</span>
                    <span className="font-bold text-slate-950">{resolvePaymentMethodLabel(paymentMethod)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between gap-4">
                      <span>Total</span>
                      <span className="font-black text-slate-950">{formatCurrency(preview.harga_paket)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </section>
      </div>


      <Modal
        opened={Boolean(editSession)}
        onClose={() => {
          if (editLoading) return;
          setEditSession(null);
        }}
        title="Ubah Sesi Preview"
        description="Pilih tanggal dan slot baru sebelum booking dikonfirmasi. Instruktur dan kendaraan tetap sama."
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setEditSession(null)}
              disabled={editLoading}
              className="rounded-2xl"
            >
              Batal
            </Button>
            <Button
              onClick={() => void handleApplyEditSession()}
              loading={editLoading}
              className="rounded-2xl"
            >
              Terapkan Jadwal
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {editError ? <ErrorMessage message={editError} /> : null}
          <Input
            type="date"
            label="Tanggal Latihan"
            value={editDate}
            onChange={(event) => setEditDate(event.target.value)}
          />
          <Select
            label="Slot Waktu"
            value={editSlotId}
            onChange={(event) => setEditSlotId(event.target.value)}
            placeholder="Pilih slot"
            options={timeSlots.map((slot) => ({
              value: String(slot.id),
              label: `${slot.nama_slot} • ${slot.jam_mulai ?? ""} - ${slot.jam_selesai ?? ""}`,
            }))}
          />
          <p className="rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
            Sistem akan mengecek apakah instruktur {preview.instructor.nama_instruktur ?? "terpilih"} dan kendaraan {preview.vehicle.nama_kendaraan} masih tersedia pada tanggal dan slot baru.
          </p>
        </div>
      </Modal>

      <BookingSuccessModal
        opened={successModalOpened}
        onClose={handleCloseSuccessModal}
        onViewMySchedule={handleViewMySchedule}
        mode={successModalMode}
        onUploadPaymentProof={handleOpenPaymentFromSuccess}
        paymentMethod={paymentMethod}
        selectedPackage={selectedPackage}
        slot={previewFirstSlot}
      />

      <PaymentProofUploadModal
        opened={paymentModalOpened}
        onClose={handleClosePaymentModal}
        booking={createdBooking}
        onSubmit={handleUploadPaymentProof}
        isSubmitting={isUploadingPayment}
        errorMessage={paymentError}
        successMessage={null}
      />
    </>
  );
}
