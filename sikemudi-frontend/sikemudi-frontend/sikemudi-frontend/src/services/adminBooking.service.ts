import { apiDownload, apiRequest } from "@/services/api";
import { ADMIN_ENDPOINTS } from "@/services/endpoints";
import type { AvailableScheduleListData } from "@/types/booking";
import type {
  AdminBookingItemData,
  AdminBookingRefundItemData,
  AdminBookingRefundListData,
  AdminBookingRefundListQuery,
  AdminBookingListData,
  AdminBookingListQuery,
  CancelAdminBookingPayload,
  ChangeAdminBookingSchedulePayload,
  CompleteAdminBookingRefundPayload,
  ConfirmAdminBookingPaymentPayload,
  ProcessAdminBookingRefundPayload,
  RejectAdminBookingPaymentPayload,
  RejectAdminBookingRefundPayload,
} from "@/types/adminBooking";

function ensureData<TData>(data: TData | undefined, fallbackMessage: string): TData {
  if (!data) {
    throw new Error(fallbackMessage);
  }

  return data;
}

export async function getAdminBookings(
  query: AdminBookingListQuery = {},
): Promise<AdminBookingListData> {
  const response = await apiRequest<AdminBookingListData>(ADMIN_ENDPOINTS.bookings, {
    query: { per_page: 100, ...query },
  });

  return ensureData(response.data, "Response booking admin tidak valid.");
}

export async function getAdminBookingDetail(
  bookingId: string | number,
): Promise<AdminBookingItemData> {
  const response = await apiRequest<AdminBookingItemData>(
    ADMIN_ENDPOINTS.bookingDetail(bookingId),
  );

  return ensureData(response.data, "Response detail booking admin tidak valid.");
}

export async function confirmAdminBookingPayment(
  bookingId: string | number,
  payload: ConfirmAdminBookingPaymentPayload = {},
): Promise<AdminBookingItemData> {
  const response = await apiRequest<AdminBookingItemData>(
    ADMIN_ENDPOINTS.confirmBookingPayment(bookingId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response konfirmasi pembayaran tidak valid.");
}

export async function rejectAdminBookingPayment(
  bookingId: string | number,
  payload: RejectAdminBookingPaymentPayload,
): Promise<AdminBookingItemData> {
  const response = await apiRequest<AdminBookingItemData>(
    ADMIN_ENDPOINTS.rejectBookingPayment(bookingId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response tolak pembayaran tidak valid.");
}

export async function changeAdminBookingSchedule(
  bookingId: string | number,
  payload: ChangeAdminBookingSchedulePayload,
): Promise<AdminBookingItemData> {
  const response = await apiRequest<AdminBookingItemData>(
    ADMIN_ENDPOINTS.changeBookingSchedule(bookingId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response ubah jadwal booking tidak valid.");
}

export async function cancelAdminBooking(
  bookingId: string | number,
  payload: CancelAdminBookingPayload = {},
): Promise<AdminBookingItemData> {
  const response = await apiRequest<AdminBookingItemData>(
    ADMIN_ENDPOINTS.cancelBooking(bookingId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response batal booking admin tidak valid.");
}

export async function cancelAdminBookingPackage(
  bookingGroupId: string | number,
  payload: CancelAdminBookingPayload = {},
): Promise<AdminBookingItemData> {
  const response = await apiRequest<AdminBookingItemData>(
    ADMIN_ENDPOINTS.cancelBookingPackage(bookingGroupId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response batal booking paket admin tidak valid.");
}

export async function downloadAdminBookingPaymentProof(
  bookingId: string | number,
): Promise<Blob> {
  return apiDownload(ADMIN_ENDPOINTS.bookingPaymentProof(bookingId));
}

export async function getAdminAvailableReplacementSchedules(
  coursePackageId: string | number,
): Promise<AvailableScheduleListData> {
  const response = await apiRequest<AvailableScheduleListData>(
    ADMIN_ENDPOINTS.trainingSchedules,
    {
      query: {
        course_package_id: coursePackageId,
        status: "Tersedia",
        tanggal_mulai: new Date().toISOString().slice(0, 10),
        per_page: 100,
      },
    },
  );

  return ensureData(response.data, "Response jadwal pengganti tidak valid.");
}

export async function getAdminBookingRefunds(
  query: AdminBookingRefundListQuery = {},
): Promise<AdminBookingRefundListData> {
  const response = await apiRequest<AdminBookingRefundListData>(
    ADMIN_ENDPOINTS.bookingRefunds,
    { query: { per_page: 100, ...query } },
  );

  return ensureData(response.data, "Response refund booking tidak valid.");
}

export async function getAdminBookingRefundDetail(
  refundId: string | number,
): Promise<AdminBookingRefundItemData> {
  const response = await apiRequest<AdminBookingRefundItemData>(
    ADMIN_ENDPOINTS.bookingRefundDetail(refundId),
  );

  return ensureData(response.data, "Response detail refund booking tidak valid.");
}

export async function processAdminBookingRefund(
  refundId: string | number,
  payload: ProcessAdminBookingRefundPayload = {},
): Promise<AdminBookingRefundItemData> {
  const response = await apiRequest<AdminBookingRefundItemData>(
    ADMIN_ENDPOINTS.processBookingRefund(refundId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response proses refund booking tidak valid.");
}

export async function completeAdminBookingRefund(
  refundId: string | number,
  payload: CompleteAdminBookingRefundPayload = {},
): Promise<AdminBookingRefundItemData> {
  const response = await apiRequest<AdminBookingRefundItemData>(
    ADMIN_ENDPOINTS.completeBookingRefund(refundId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response selesaikan refund booking tidak valid.");
}

export async function rejectAdminBookingRefund(
  refundId: string | number,
  payload: RejectAdminBookingRefundPayload,
): Promise<AdminBookingRefundItemData> {
  const response = await apiRequest<AdminBookingRefundItemData>(
    ADMIN_ENDPOINTS.rejectBookingRefund(refundId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response tolak refund booking tidak valid.");
}
