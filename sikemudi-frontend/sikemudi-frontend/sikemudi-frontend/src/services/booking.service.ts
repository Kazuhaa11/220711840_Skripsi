import { apiRequest } from "@/services/api";
import { PARTICIPANT_ENDPOINTS, PUBLIC_ENDPOINTS } from "@/services/endpoints";
import type {
  BookingGroupItemData,
  BookingItemData,
  BookingPackagePreviewData,
  BookingPackagePreviewPayload,
  BookingPackageSessionPreviewData,
  BookingPackageSessionPreviewPayload,
  BookingRescheduleRecommendationListData,
  BookingRescheduleRecommendationPayload,
  CancelBookingPayload,
  ChangeBookingSchedulePayload,
  CoursePackageListData,
  CreateParticipantPackageBookingPayload,
  ParticipantBookingGroupListData,
  ParticipantBookingHistoryQuery,
  ParticipantBookingListQuery,
  TimeSlotListData,
  UploadPaymentProofPayload,
} from "@/types/booking";

function ensureData<TData>(data: TData | undefined, fallbackMessage: string): TData {
  if (!data) {
    throw new Error(fallbackMessage);
  }

  return data;
}

export async function getPublicCoursePackages(q?: string): Promise<CoursePackageListData> {
  const response = await apiRequest<CoursePackageListData>(PUBLIC_ENDPOINTS.packages, {
    withAuth: false,
    query: { q },
  });

  return ensureData(response.data, "Response paket kursus tidak valid.");
}


export async function getParticipantTimeSlots(): Promise<TimeSlotListData> {
  const response = await apiRequest<TimeSlotListData>(
    PARTICIPANT_ENDPOINTS.timeSlots,
  );

  return ensureData(response.data, "Response slot waktu tidak valid.");
}

export async function previewParticipantPackageSchedule(
  payload: BookingPackagePreviewPayload,
): Promise<BookingPackagePreviewData> {
  const response = await apiRequest<BookingPackagePreviewData>(
    PARTICIPANT_ENDPOINTS.previewPackageSchedule,
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response preview jadwal paket tidak valid.");
}


export async function previewParticipantPackageSession(
  payload: BookingPackageSessionPreviewPayload,
): Promise<BookingPackageSessionPreviewData> {
  const response = await apiRequest<BookingPackageSessionPreviewData>(
    PARTICIPANT_ENDPOINTS.previewPackageSession,
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response preview perubahan sesi tidak valid.");
}

export async function createParticipantPackageBooking(
  payload: CreateParticipantPackageBookingPayload,
): Promise<BookingGroupItemData> {
  const response = await apiRequest<BookingGroupItemData>(
    PARTICIPANT_ENDPOINTS.packageBooking,
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response booking paket tidak valid.");
}

export async function uploadParticipantPaymentProof(
  bookingId: string | number,
  payload: UploadPaymentProofPayload,
): Promise<BookingItemData> {
  const formData = new FormData();
  formData.append("nominal_bayar", String(payload.nominal_bayar));
  formData.append("bukti_bayar", payload.bukti_bayar);

  if (payload.nama_pengirim) {
    formData.append("nama_pengirim", payload.nama_pengirim);
  }

  if (payload.bank_pengirim) {
    formData.append("bank_pengirim", payload.bank_pengirim);
  }

  if (payload.catatan_peserta) {
    formData.append("catatan_peserta", payload.catatan_peserta);
  }

  const response = await apiRequest<BookingItemData>(
    PARTICIPANT_ENDPOINTS.uploadPaymentProof(bookingId),
    {
      method: "POST",
      body: formData,
    },
  );

  return ensureData(response.data, "Response upload bukti bayar tidak valid.");
}



export async function getParticipantBookingGroups(
  query: ParticipantBookingListQuery = {},
): Promise<ParticipantBookingGroupListData> {
  const response = await apiRequest<ParticipantBookingGroupListData>(
    PARTICIPANT_ENDPOINTS.bookingGroups,
    { query: { per_page: 100, ...query } },
  );

  return ensureData(response.data, "Response booking paket peserta tidak valid.");
}

export async function getParticipantBookingPackageHistory(
  query: ParticipantBookingHistoryQuery = {},
): Promise<ParticipantBookingGroupListData> {
  const response = await apiRequest<ParticipantBookingGroupListData>(
    PARTICIPANT_ENDPOINTS.bookingPackageHistory,
    { query: { per_page: 100, ...query } },
  );

  return ensureData(response.data, "Response riwayat booking paket tidak valid.");
}

export async function getParticipantBookingDetail(
  bookingId: string | number,
): Promise<BookingItemData> {
  const response = await apiRequest<BookingItemData>(
    PARTICIPANT_ENDPOINTS.bookingDetail(bookingId),
  );

  return ensureData(response.data, "Response detail booking tidak valid.");
}


export async function getParticipantBookingScheduleRecommendations(
  bookingId: string | number,
  payload: BookingRescheduleRecommendationPayload,
): Promise<BookingRescheduleRecommendationListData> {
  const response = await apiRequest<BookingRescheduleRecommendationListData>(
    PARTICIPANT_ENDPOINTS.recommendBookingSchedule(bookingId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response rekomendasi jadwal tidak valid.");
}

export async function changeParticipantBookingSchedule(
  bookingId: string | number,
  payload: ChangeBookingSchedulePayload,
): Promise<BookingItemData> {
  const response = await apiRequest<BookingItemData>(
    PARTICIPANT_ENDPOINTS.changeBookingSchedule(bookingId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response ubah jadwal tidak valid.");
}


export async function cancelParticipantBookingPackage(
  bookingGroupId: string | number,
  payload: CancelBookingPayload = {},
): Promise<BookingGroupItemData> {
  const response = await apiRequest<BookingGroupItemData>(
    PARTICIPANT_ENDPOINTS.cancelBookingPackage(bookingGroupId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response batal booking paket tidak valid.");
}

export async function cancelParticipantBooking(
  bookingId: string | number,
  payload: CancelBookingPayload = {},
): Promise<BookingItemData> {
  const response = await apiRequest<BookingItemData>(
    PARTICIPANT_ENDPOINTS.cancelBooking(bookingId),
    {
      method: "POST",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response batal booking tidak valid.");
}
