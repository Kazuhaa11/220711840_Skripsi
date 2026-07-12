import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, ReceiptText } from "lucide-react";
import ErrorMessage from "@/components/feedback/ErrorMessage";
import LoadingSpinner from "@/components/feedback/LoadingSpinner";
import SuccesBanner from "@/components/feedback/SuccesBanner";
import DataTabs, { type DataTabItem } from "@/components/common/DataTabs";
import Card from "@/components/ui/Card";
import {
  cancelAdminBooking,
  cancelAdminBookingPackage,
  completeAdminBookingRefund,
  changeAdminBookingSchedule,
  confirmAdminBookingPayment,
  downloadAdminBookingPaymentProof,
  getAdminAvailableReplacementSchedules,
  getAdminBookingRefundDetail,
  getAdminBookingRefunds,
  getAdminBookingDetail,
  getAdminBookings,
  processAdminBookingRefund,
  rejectAdminBookingPayment,
  rejectAdminBookingRefund,
} from "@/services/adminBooking.service";
import AdminBookingCancelModal from "@/features/admin/components/bookings/AdminBookingCancelModal";
import AdminBookingDetailModal from "@/features/admin/components/bookings/AdminBookingDetailModal";
import AdminBookingPaymentActionModal from "@/features/admin/components/bookings/AdminBookingPaymentActionModal";
import AdminBookingRefundActionModal from "@/features/admin/components/bookings/AdminBookingRefundActionModal";
import AdminBookingRefundDetailModal from "@/features/admin/components/bookings/AdminBookingRefundDetailModal";
import AdminBookingRefundsFilters from "@/features/admin/components/bookings/AdminBookingRefundsFilters";
import AdminBookingRefundsTable from "@/features/admin/components/bookings/AdminBookingRefundsTable";
import AdminBookingRescheduleModal from "@/features/admin/components/bookings/AdminBookingRescheduleModal";
import AdminBookingsFilters from "@/features/admin/components/bookings/AdminBookingsFilters";
import AdminBookingsHeader from "@/features/admin/components/bookings/AdminBookingsHeader";
import AdminBookingsTable from "@/features/admin/components/bookings/AdminBookingsTable";
import {
  isScheduleAvailableForReplacement,
  mapAdminBookingToDetail,
  mapAdminBookingToRow,
  mapScheduleToAdminReplacementSlot,
} from "@/features/admin/utils/adminBookingMapper";
import type { PaginationMeta } from "@/types/api";
import type {
  AdminBookingApiItem,
  AdminBookingDetailItem,
  AdminBookingRefundApiItem,
  AdminBookingRowItem,
  AdminReplacementScheduleItem,
} from "@/types/adminBooking";

const DEFAULT_ERROR_MESSAGE = "Data booking admin gagal dimuat.";

type PaymentActionMode = "confirm" | "reject";
type RefundActionMode = "process" | "complete" | "reject";
type BookingManagementTab = "booking" | "refund";

const bookingManagementTabs: DataTabItem<BookingManagementTab>[] = [
  { id: "booking", label: "Booking Paket", icon: ClipboardList },
  { id: "refund", label: "Refund", icon: ReceiptText },
];

function buildPaymentProofFileName(item: AdminBookingRowItem): string {
  if (
    item.paymentProofName &&
    item.paymentProofName !== "Bukti bayar belum ada"
  ) {
    return item.paymentProofName;
  }

  return `bukti-bayar-${item.code}.pdf`;
}

function openBlobInNewTab(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob);
  const openedWindow = window.open(objectUrl, "_blank", "noopener,noreferrer");

  if (!openedWindow) {
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export default function AdminBookingsView() {
  const [bookings, setBookings] = useState<AdminBookingApiItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [activeTab, setActiveTab] = useState<BookingManagementTab>("booking");

  const [searchValue, setSearchValue] = useState("");
  const [bookingStatus, setBookingStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [page, setPage] = useState(1);

  const [refundSearchValue, setRefundSearchValue] = useState("");
  const [refundStatus, setRefundStatus] = useState("all");
  const [refundPaymentStatus, setRefundPaymentStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [selectedRow, setSelectedRow] = useState<AdminBookingRowItem | null>(
    null,
  );
  const [selectedDetail, setSelectedDetail] =
    useState<AdminBookingDetailItem | null>(null);
  const [detailOpened, setDetailOpened] = useState(false);

  const [paymentActionOpened, setPaymentActionOpened] = useState(false);
  const [paymentActionMode, setPaymentActionMode] =
    useState<PaymentActionMode>("confirm");

  const [rescheduleOpened, setRescheduleOpened] = useState(false);
  const [replacementSlots, setReplacementSlots] = useState<
    AdminReplacementScheduleItem[]
  >([]);
  const [replacementLoading, setReplacementLoading] = useState(false);
  const [replacementError, setReplacementError] = useState<string | null>(null);

  const [cancelOpened, setCancelOpened] = useState(false);

  const [refunds, setRefunds] = useState<AdminBookingRefundApiItem[]>([]);
  const [refundLoading, setRefundLoading] = useState(true);
  const [refundError, setRefundError] = useState<string | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<AdminBookingRefundApiItem | null>(null);
  const [selectedRefundDetail, setSelectedRefundDetail] =
    useState<AdminBookingRefundApiItem | null>(null);
  const [refundDetailOpened, setRefundDetailOpened] = useState(false);
  const [refundActionMode, setRefundActionMode] = useState<RefundActionMode>("process");
  const [refundActionOpened, setRefundActionOpened] = useState(false);
  const [refundActionError, setRefundActionError] = useState<string | null>(null);

  const rows = useMemo(() => bookings.map(mapAdminBookingToRow), [bookings]);
  const filteredRefunds = useMemo(() => {
    if (refundPaymentStatus === "all") return refunds;

    return refunds.filter((item) => item.payment?.status === refundPaymentStatus);
  }, [refundPaymentStatus, refunds]);

  const fetchBookings = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const response = await getAdminBookings({
          q: searchValue.trim() || undefined,
          status: bookingStatus === "all" ? undefined : bookingStatus,
          payment_status: paymentStatus === "all" ? undefined : paymentStatus,
          metode_pembayaran:
            paymentMethod === "all" ? undefined : (paymentMethod as "Transfer" | "Cash"),
          page,
          per_page: 10,
        });

        setBookings(response.items);
        setPagination(response.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bookingStatus, page, paymentMethod, paymentStatus, searchValue],
  );

  const fetchRefunds = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      try {
        if (!silent) {
          setRefundLoading(true);
        }

        setRefundError(null);

        const response = await getAdminBookingRefunds({
          q: refundSearchValue.trim() || undefined,
          status: refundStatus === "all" ? undefined : refundStatus,
          per_page: 100,
        });

        setRefunds(response.items);
      } catch (err) {
        setRefundError(err instanceof Error ? err.message : "Data refund booking gagal dimuat.");
      } finally {
        setRefundLoading(false);
      }
    },
    [refundSearchValue, refundStatus],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchBookings();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchBookings]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchRefunds();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchRefunds]);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  function handleResetFilters() {
    setSearchValue("");
    setBookingStatus("all");
    setPaymentStatus("all");
    setPaymentMethod("all");
    setPage(1);
  }

  function handleResetRefundFilters() {
    setRefundSearchValue("");
    setRefundStatus("all");
    setRefundPaymentStatus("all");
  }

  function handleSearchChange(value: string) {
    setSearchValue(value);
    setPage(1);
  }

  function handleBookingStatusChange(value: string) {
    setBookingStatus(value);
    setPage(1);
  }

  function handlePaymentStatusChange(value: string) {
    setPaymentStatus(value);
    setPage(1);
  }

  function handlePaymentMethodChange(value: string) {
    setPaymentMethod(value);
    setPage(1);
  }

  function handleRefundSearchChange(value: string) {
    setRefundSearchValue(value);
  }

  function handleRefundStatusChange(value: string) {
    setRefundStatus(value);
  }

  function handleRefundPaymentStatusChange(value: string) {
    setRefundPaymentStatus(value);
  }

  async function handleOpenDetail(item: AdminBookingRowItem) {
    try {
      setActionLoading(true);
      setError(null);
      setSelectedRow(item);

      const response = await getAdminBookingDetail(item.numericId);
      setSelectedDetail(mapAdminBookingToDetail(response.item));
      setDetailOpened(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Detail booking gagal dimuat.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleViewPaymentProof(
    item: AdminBookingRowItem | AdminBookingDetailItem,
  ) {
    if (item.isCashPayment) {
      setError("Booking cash tidak membutuhkan bukti bayar untuk dilihat.");
      return;
    }

    if (!item.hasPaymentProof) {
      setError("Bukti bayar belum tersedia.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const blob = await downloadAdminBookingPaymentProof(item.numericId);
      openBlobInNewTab(blob, buildPaymentProofFileName(item));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Bukti bayar gagal dibuka.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenPaymentAction(
    item: AdminBookingRowItem,
    mode: PaymentActionMode,
  ) {
    setSelectedRow(item);
    setPaymentActionMode(mode);
    setPaymentActionOpened(true);
  }

  async function handleSubmitPaymentAction(values: {
    catatan_admin?: string;
    alasan_penolakan?: string;
  }) {
    if (!selectedRow) return;

    try {
      setActionLoading(true);
      setError(null);

      if (paymentActionMode === "confirm") {
        await confirmAdminBookingPayment(selectedRow.numericId, {
          catatan_admin: values.catatan_admin,
        });

        setSuccessMessage(
          selectedRow.isCashPayment
            ? "Pembayaran cash berhasil dikonfirmasi."
            : "Pembayaran booking berhasil dikonfirmasi.",
        );
      } else {
        await rejectAdminBookingPayment(selectedRow.numericId, {
          alasan_penolakan:
            values.alasan_penolakan ?? "Pembayaran ditolak oleh admin.",
          catatan_admin: values.catatan_admin,
        });

        setSuccessMessage("Pembayaran booking berhasil ditolak.");
      }

      setPaymentActionOpened(false);
      setSelectedRow(null);
      await fetchBookings({ silent: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Aksi pembayaran gagal diproses.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleOpenReschedule(item: AdminBookingRowItem) {
    setSelectedRow(item);
    setReplacementSlots([]);
    setReplacementError(null);
    setRescheduleOpened(true);

    if (!item.packageId) {
      setReplacementError("Paket kursus booking tidak ditemukan.");
      return;
    }

    try {
      setReplacementLoading(true);

      const response = await getAdminAvailableReplacementSchedules(
        item.packageId,
      );

      const slots = response.items
        .filter((schedule) => String(schedule.id) !== String(item.scheduleId))
        .filter(isScheduleAvailableForReplacement)
        .map(mapScheduleToAdminReplacementSlot);

      setReplacementSlots(slots);
    } catch (err) {
      setReplacementError(
        err instanceof Error ? err.message : "Slot pengganti gagal dimuat.",
      );
    } finally {
      setReplacementLoading(false);
    }
  }

  async function handleSubmitReschedule(values: {
    training_schedule_id: number;
    catatan?: string;
  }) {
    if (!selectedRow) return;

    try {
      setActionLoading(true);
      setError(null);

      await changeAdminBookingSchedule(selectedRow.numericId, values);

      setSuccessMessage("Jadwal booking berhasil diubah.");
      setRescheduleOpened(false);
      setSelectedRow(null);
      setReplacementSlots([]);
      await fetchBookings({ silent: true });
    } catch (err) {
      setReplacementError(
        err instanceof Error ? err.message : "Jadwal booking gagal diubah.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenCancel(item: AdminBookingRowItem) {
    setSelectedRow(item);
    setCancelOpened(true);
  }

  async function handleSubmitCancel(reason: string) {
    if (!selectedRow) return;

    try {
      setActionLoading(true);
      setError(null);

      if (selectedRow.isPackageBooking) {
        await cancelAdminBookingPackage(selectedRow.numericId, {
          alasan_pembatalan: reason,
        });
      } else {
        await cancelAdminBooking(selectedRow.numericId, {
          alasan_pembatalan: reason,
        });
      }

      setSuccessMessage(
        selectedRow.isPackageBooking
          ? "Booking paket dan seluruh sesinya berhasil dibatalkan."
          : "Booking berhasil dibatalkan.",
      );
      setCancelOpened(false);
      setSelectedRow(null);
      await fetchBookings({ silent: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Booking gagal dibatalkan.",
      );
    } finally {
      setActionLoading(false);
    }
  }

  function handleOpenRefundAction(item: AdminBookingRefundApiItem, mode: RefundActionMode) {
    setSelectedRefund(item);
    setRefundActionMode(mode);
    setRefundActionError(null);
    setRefundActionOpened(true);
  }

  async function handleOpenRefundDetail(item: AdminBookingRefundApiItem) {
    try {
      setActionLoading(true);
      setRefundError(null);
      setSelectedRefundDetail(item);

      const response = await getAdminBookingRefundDetail(item.id);
      setSelectedRefundDetail(response.item);
      setRefundDetailOpened(true);
    } catch (err) {
      setRefundError(err instanceof Error ? err.message : "Detail refund booking gagal dimuat.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSubmitRefundAction(values: {
    nominal_refund?: number | null;
    tipe_refund?: "Penuh" | "Sebagian" | null;
    catatan_admin?: string | null;
  }) {
    if (!selectedRefund) return;

    try {
      setActionLoading(true);
      setRefundActionError(null);

      if (refundActionMode === "process") {
        await processAdminBookingRefund(selectedRefund.id, {
          catatan_admin: values.catatan_admin,
        });
        setSuccessMessage("Refund booking berhasil ditandai sedang diproses.");
      } else if (refundActionMode === "complete") {
        await completeAdminBookingRefund(selectedRefund.id, {
          nominal_refund: values.nominal_refund,
          tipe_refund: values.tipe_refund,
          catatan_admin: values.catatan_admin,
        });
        setSuccessMessage("Refund booking berhasil diselesaikan.");
      } else {
        await rejectAdminBookingRefund(selectedRefund.id, {
          catatan_admin: values.catatan_admin || "Refund ditolak oleh admin.",
        });
        setSuccessMessage("Refund booking berhasil ditolak.");
      }

      setRefundActionOpened(false);
      setSelectedRefund(null);
      await fetchRefunds({ silent: true });
      await fetchBookings({ silent: true });
    } catch (err) {
      setRefundActionError(err instanceof Error ? err.message : "Aksi refund booking gagal diproses.");
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <AdminBookingsHeader
        loading={activeTab === "booking" ? refreshing : refundLoading}
        onRefresh={() => {
          if (activeTab === "booking") {
            void fetchBookings({ silent: true });
            return;
          }

          void fetchRefunds({ silent: true });
        }}
      />

      {successMessage ? <SuccesBanner message={successMessage} /> : null}

      {error ? <ErrorMessage message={error} /> : null}

      <Card className="rounded-3xl p-3 shadow-sm">
        <DataTabs
          tabs={bookingManagementTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="segmented"
        />
      </Card>

      {activeTab === "booking" ? (
        <>
          <AdminBookingsFilters
            searchValue={searchValue}
            bookingStatus={bookingStatus}
            paymentStatus={paymentStatus}
            paymentMethod={paymentMethod}
            onSearchChange={handleSearchChange}
            onBookingStatusChange={handleBookingStatusChange}
            onPaymentStatusChange={handlePaymentStatusChange}
            onPaymentMethodChange={handlePaymentMethodChange}
            onReset={handleResetFilters}
          />

          {loading ? (
            <Card className="rounded-3xl p-4 shadow-sm sm:p-8">
              <LoadingSpinner label="Memuat data booking admin..." />
            </Card>
          ) : (
            <AdminBookingsTable
              items={rows}
              pagination={pagination}
              loading={loading}
              onDetail={handleOpenDetail}
              onViewPaymentProof={handleViewPaymentProof}
              onConfirmPayment={(item) => handleOpenPaymentAction(item, "confirm")}
              onRejectPayment={(item) => handleOpenPaymentAction(item, "reject")}
              onReschedule={handleOpenReschedule}
              onCancel={handleOpenCancel}
              onPageChange={setPage}
            />
          )}
        </>
      ) : (
        <>
          <AdminBookingRefundsFilters
            searchValue={refundSearchValue}
            refundStatus={refundStatus}
            paymentStatus={refundPaymentStatus}
            onSearchChange={handleRefundSearchChange}
            onRefundStatusChange={handleRefundStatusChange}
            onPaymentStatusChange={handleRefundPaymentStatusChange}
            onReset={handleResetRefundFilters}
          />

          {refundError ? <ErrorMessage message={refundError} /> : null}

          <AdminBookingRefundsTable
            items={filteredRefunds}
            loading={refundLoading}
            onDetail={handleOpenRefundDetail}
            onProcess={(item) => handleOpenRefundAction(item, "process")}
            onComplete={(item) => handleOpenRefundAction(item, "complete")}
            onReject={(item) => handleOpenRefundAction(item, "reject")}
          />
        </>
      )}

      <AdminBookingDetailModal
        opened={detailOpened}
        item={selectedDetail}
        onClose={() => {
          setDetailOpened(false);
          setSelectedDetail(null);
        }}
        onViewPaymentProof={handleViewPaymentProof}
      />

      <AdminBookingPaymentActionModal
        opened={paymentActionOpened}
        mode={paymentActionMode}
        item={selectedRow}
        loading={actionLoading}
        onClose={() => {
          if (actionLoading) return;
          setPaymentActionOpened(false);
          setSelectedRow(null);
        }}
        onConfirm={handleSubmitPaymentAction}
      />

      <AdminBookingRescheduleModal
        opened={rescheduleOpened}
        item={selectedRow}
        slots={replacementSlots}
        loadingSlots={replacementLoading}
        submitting={actionLoading}
        error={replacementError}
        onClose={() => {
          if (actionLoading) return;
          setRescheduleOpened(false);
          setSelectedRow(null);
          setReplacementSlots([]);
          setReplacementError(null);
        }}
        onConfirm={handleSubmitReschedule}
      />

      <AdminBookingCancelModal
        opened={cancelOpened}
        item={selectedRow}
        loading={actionLoading}
        onClose={() => {
          if (actionLoading) return;
          setCancelOpened(false);
          setSelectedRow(null);
        }}
        onConfirm={handleSubmitCancel}
      />

      <AdminBookingRefundActionModal
        opened={refundActionOpened}
        mode={refundActionMode}
        item={selectedRefund}
        loading={actionLoading}
        error={refundActionError}
        onClose={() => {
          if (actionLoading) return;
          setRefundActionOpened(false);
          setSelectedRefund(null);
          setRefundActionError(null);
        }}
        onConfirm={handleSubmitRefundAction}
      />

      <AdminBookingRefundDetailModal
        opened={refundDetailOpened}
        item={selectedRefundDetail}
        onClose={() => {
          if (actionLoading) return;
          setRefundDetailOpened(false);
          setSelectedRefundDetail(null);
        }}
      />
    </div>
  );
}
