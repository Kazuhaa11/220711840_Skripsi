import { useCallback, useEffect, useMemo, useState } from "react";
import MyScheduleHeader from "@/features/participant/components/schedule/MyScheduleHeader";
import MyScheduleStats from "@/features/participant/components/schedule/MyScheduleStats";
import BookingPackageScheduleSection from "@/features/participant/components/schedule/BookingPackageScheduleSection";
import ScheduleRulesCard from "@/features/participant/components/schedule/ScheduleRulesCard";
import SupportCard from "@/features/participant/components/schedule/SupportCard";
import BookingScheduleDetailModal from "@/features/participant/components/schedule/modals/BookingScheduleDetailModal";
import PaymentProofUploadModal from "@/features/participant/components/available-schedule/schedule-available/PaymentProofUploadModal";
import CancelPackageModal from "@/features/participant/components/schedule/modals/CancelPackageModal";
import PackageScheduleDetailModal from "@/features/participant/components/schedule/modals/PackageScheduleDetailModal";
import ReschedulePackageSessionsModal from "@/features/participant/components/schedule/modals/ReschedulePackageSessionsModal";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import Button from "@/components/ui/Button";
import { useFloatingNotification } from "@/components/feedback/FloatingNotificationProvider";
import {
  getParticipantBookingDetail,
  getParticipantBookingGroups,
  uploadParticipantPaymentProof,
} from "@/services/booking.service";
import type {
  BookingApiItem,
  BookingGroupApiItem,
  BookingGroupSessionApiItem,
} from "@/types/booking";
import type {
  ScheduleStatItem,
  UpcomingSessionItem,
} from "@/features/participant/constants/mySchedule";
import { sortByLatestDate, sortByNumber } from "@/utils/sortData";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function resolveSessionDate(session: BookingGroupSessionApiItem): string {
  const value = session.training_schedule?.tanggal_latihan;
  if (!value) return "Tanggal belum tersedia";

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function resolveSessionTime(session: BookingGroupSessionApiItem): string {
  const start = session.training_schedule?.time_slot?.jam_mulai;
  const end = session.training_schedule?.time_slot?.jam_selesai;
  return start && end ? `${start} - ${end}` : "Jam belum tersedia";
}

function mapGroupSessionToModalItem(
  group: BookingGroupApiItem,
  session: BookingGroupSessionApiItem,
): UpcomingSessionItem {
  const paymentStatus = group.payment?.status ?? "Belum Upload";

  return {
    id: String(session.id),
    bookingId: session.id,
    scheduleId: session.training_schedule?.id ?? null,
    coursePackageId: group.course_package?.id ?? null,
    status: session.status_label ?? session.status,
    paymentStatus,
    date: resolveSessionDate(session),
    dateISO: session.training_schedule?.tanggal_latihan ?? "",
    time: resolveSessionTime(session),
    instructor:
      session.training_schedule?.instructor?.nama_instruktur ??
      group.instructor?.nama_instruktur ??
      "Instruktur belum tersedia",
    vehicle: session.training_schedule?.vehicle
      ? `${session.training_schedule.vehicle.nama_kendaraan} (${session.training_schedule.vehicle.transmisi})`
      : group.vehicle
        ? `${group.vehicle.nama_kendaraan} (${group.vehicle.transmisi})`
        : "Kendaraan belum tersedia",
    packageName: group.course_package?.nama_paket ?? "Paket belum tersedia",
    pickupLabel: group.pakai_antar_jemput ? "Antar Jemput" : "Tanpa Antar Jemput",
    simLabel: group.pakai_sim ? "Dengan SIM" : "Tanpa SIM",
    priceLabel: formatCurrency(group.harga_paket),
    note: group.catatan ?? "Tidak ada catatan tambahan.",
    canModify: Boolean(session.can_change_or_cancel),
    canReschedule: Boolean(session.can_change_or_cancel),
    canCancel: Boolean(session.can_change_or_cancel),
    canUploadPaymentProof: false,
    accent: "blue",
  };
}

function sortScheduleGroupsByNewest(groups: BookingGroupApiItem[]): BookingGroupApiItem[] {
  const groupsWithSortedSessions = groups.map((group) => ({
    ...group,
    sessions: sortByNumber(group.sessions, "sesi_ke", "asc"),
  }));

  return sortByLatestDate(groupsWithSortedSessions, [
    "updated_at",
    "created_at",
    "tanggal_booking",
    "tanggal_dikonfirmasi",
    "tanggal_dibatalkan",
    "payment.tanggal_upload",
    "payment.tanggal_verifikasi",
    "refund.tanggal_pengajuan",
    "refund.tanggal_diproses",
    "refund.tanggal_refund",
  ], {
    direction: "desc",
    fallback: "id",
  });
}

function buildGroupStats(groups: BookingGroupApiItem[]): ScheduleStatItem[] {
  const allSessions = groups.flatMap((group) => group.sessions);
  const activeCount = allSessions.filter(
    (session) => !["Selesai", "Dibatalkan"].includes(session.status),
  ).length;
  const completedCount = allSessions.filter((session) => session.status === "Selesai").length;
  const waitingCount = groups.filter((group) =>
    ["Menunggu Pembayaran", "Menunggu Konfirmasi Pembayaran"].includes(group.status),
  ).length;
  const hasActiveOrCompleted = groups.some((group) =>
    ["Menunggu Pembayaran", "Menunggu Konfirmasi Pembayaran", "Dikonfirmasi", "Dijadwalkan Ulang", "Selesai"].includes(group.status),
  );

  return [
    {
      label: "JADWAL AKTIF",
      value: `${activeCount} Sesi`,
      accent: "blue",
    },
    {
      label: "SESI SELESAI",
      value: `${completedCount} Sesi`,
      accent: "green",
    },
    {
      label: "MENUNGGU KONFIRMASI",
      value: `${waitingCount} Paket`,
      accent: "slate",
    },
    {
      label: "STATUS SERTIFIKAT",
      value: hasActiveOrCompleted ? "Dalam Proses" : "Belum Aktif",
      accent: "blue",
      highlighted: true,
    },
  ];
}

export default function MySchedulePage() {
  const { showNotification } = useFloatingNotification();
  const [groups, setGroups] = useState<BookingGroupApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [detailOpened, setDetailOpened] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailBooking, setDetailBooking] = useState<BookingApiItem | null>(null);
  const [selectedSession, setSelectedSession] = useState<UpcomingSessionItem | null>(null);
  const [detailGroupOpened, setDetailGroupOpened] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<BookingGroupApiItem | null>(null);

  const [paymentModalOpened, setPaymentModalOpened] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<BookingApiItem | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [rescheduleOpened, setRescheduleOpened] = useState(false);
  const [cancelOpened, setCancelOpened] = useState(false);
  const [rescheduleGroup, setRescheduleGroup] = useState<BookingGroupApiItem | null>(null);
  const [actionGroup, setActionGroup] = useState<BookingGroupApiItem | null>(null);

  const loadGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getParticipantBookingGroups({ per_page: 100 });
      setGroups(sortScheduleGroupsByNewest(response.items));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Jadwal saya gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGroups();
  }, [loadGroups]);

  const stats = useMemo(() => buildGroupStats(groups), [groups]);

  async function handleOpenDetail(
    group: BookingGroupApiItem,
    session: BookingGroupSessionApiItem,
  ) {
    setSelectedSession(mapGroupSessionToModalItem(group, session));
    setDetailOpened(true);
    setDetailLoading(true);
    setDetailError(null);
    setDetailBooking(null);

    try {
      const response = await getParticipantBookingDetail(session.id);
      setDetailBooking(response.item);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Detail booking gagal dimuat.");
    } finally {
      setDetailLoading(false);
    }
  }


  function handleOpenDetailGroup(group: BookingGroupApiItem) {
    setSelectedGroup(group);
    setDetailGroupOpened(true);
  }

  function handleOpenRescheduleGroup(group: BookingGroupApiItem) {
    setRescheduleGroup(group);
    setRescheduleOpened(true);
  }

  function handleOpenCancelPackage(group: BookingGroupApiItem) {
    setActionGroup(group);
    setCancelOpened(true);
  }

  async function handleRescheduleSuccess() {
    await loadGroups();
    showNotification({
      type: "success",
      title: "Jadwal paket diubah",
      message: "Sesi yang dipilih sudah dipindahkan ke jadwal baru.",
      duration: 3500,
    });
  }

  async function handleCancelSuccess() {
    await loadGroups();
    showNotification({
      type: "success",
      title: "Booking paket dibatalkan",
      message:
        "Seluruh sesi dalam paket sudah dibatalkan. Jika memenuhi syarat, pengajuan refund akan diproses admin.",
      duration: 3500,
    });
  }

  async function handleOpenPaymentProof(group: BookingGroupApiItem) {
    setPaymentError(null);

    if (group.payment?.metode_pembayaran === "Cash") {
      showNotification({
        type: "info",
        title: "Pembayaran cash",
        message: "Booking ini memakai pembayaran cash sehingga tidak perlu upload bukti bayar.",
        duration: 3500,
      });
      return;
    }

    const bookingId = group.payment?.booking_id ?? group.sessions[0]?.id;

    if (!bookingId) {
      setPaymentError("Booking utama untuk pembayaran paket tidak ditemukan.");
      showNotification({
        type: "error",
        title: "Upload belum bisa dibuka",
        message: "Booking utama untuk pembayaran paket tidak ditemukan.",
        duration: 3500,
      });
      return;
    }

    try {
      setPaymentLoading(true);
      const response = await getParticipantBookingDetail(bookingId);
      setPaymentBooking(response.item);
      setPaymentModalOpened(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Data booking gagal dimuat untuk upload bukti bayar.";
      setPaymentError(message);
      showNotification({
        type: "error",
        title: "Data pembayaran gagal dimuat",
        message,
        duration: 4000,
      });
    } finally {
      setPaymentLoading(false);
    }
  }

  async function handleSubmitPaymentProof(payload: {
    nominalBayar: number;
    namaPengirim: string;
    bankPengirim: string;
    catatanPeserta: string;
    buktiBayar: File;
  }) {
    if (!paymentBooking) return;

    try {
      setPaymentLoading(true);
      setPaymentError(null);

      await uploadParticipantPaymentProof(paymentBooking.id, {
        nominal_bayar: payload.nominalBayar,
        nama_pengirim: payload.namaPengirim.trim() || null,
        bank_pengirim: payload.bankPengirim.trim() || null,
        catatan_peserta: payload.catatanPeserta.trim() || null,
        bukti_bayar: payload.buktiBayar,
      });

      setPaymentModalOpened(false);
      setPaymentBooking(null);
      await loadGroups();
      showNotification({
        type: "success",
        title: "Bukti bayar terkirim",
        message: "Bukti pembayaran sudah dikirim dan menunggu konfirmasi admin.",
        duration: 3500,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bukti bayar gagal diunggah.";
      setPaymentError(message);
      showNotification({
        type: "error",
        title: "Upload bukti bayar gagal",
        message,
        duration: 4000,
      });
    } finally {
      setPaymentLoading(false);
    }
  }

  return (
    <>
      <div className="mx-auto max-w-7xl overflow-x-hidden">
        <section className="rounded-2xl bg-[#eef3f9] p-3 sm:rounded-[28px] sm:p-6 lg:p-7">
          <MyScheduleHeader />

          {loading ? (
            <LoadingSpinner label="Memuat jadwal saya..." />
          ) : error ? (
            <div className="mt-6">
              <ErrorMessage
                message={error}
                action={
                  <Button variant="outline" onClick={() => void loadGroups()}>
                    Muat Ulang
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="mt-4 sm:mt-7">
                <MyScheduleStats stats={stats} />
              </div>

              <div className="mt-5 grid gap-4 sm:mt-7 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div>
                  <BookingPackageScheduleSection
                    groups={groups}
                    onOpenDetailGroup={(group) => handleOpenDetailGroup(group)}
                    onOpenRescheduleGroup={(group) => handleOpenRescheduleGroup(group)}
                    onOpenCancelPackage={(group) => handleOpenCancelPackage(group)}
                    onOpenPaymentProof={(group) => void handleOpenPaymentProof(group)}
                  />
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <ScheduleRulesCard />
                  <SupportCard />
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <BookingScheduleDetailModal
        opened={detailOpened}
        onClose={() => setDetailOpened(false)}
        item={selectedSession}
        detail={detailBooking}
        loading={detailLoading}
        error={detailError}
      />

      {paymentError && !paymentModalOpened ? (
        <div className="fixed bottom-5 right-5 z-60 max-w-md">
          <ErrorMessage message={paymentError} />
        </div>
      ) : null}

      <PaymentProofUploadModal
        opened={paymentModalOpened}
        booking={paymentBooking}
        onClose={() => {
          if (paymentLoading) return;
          setPaymentModalOpened(false);
          setPaymentError(null);
        }}
        onSubmit={handleSubmitPaymentProof}
        isSubmitting={paymentLoading}
        errorMessage={paymentError}
        successMessage={null}
      />


      <PackageScheduleDetailModal
        opened={detailGroupOpened}
        group={selectedGroup}
        onClose={() => setDetailGroupOpened(false)}
        onOpenSessionDetail={(group, session) => void handleOpenDetail(group, session)}
      />

      <ReschedulePackageSessionsModal
        opened={rescheduleOpened}
        group={rescheduleGroup}
        onClose={() => setRescheduleOpened(false)}
        onSuccess={handleRescheduleSuccess}
      />

      <CancelPackageModal
        opened={cancelOpened}
        group={actionGroup}
        onClose={() => setCancelOpened(false)}
        onSuccess={handleCancelSuccess}
      />

    </>
  );
}
