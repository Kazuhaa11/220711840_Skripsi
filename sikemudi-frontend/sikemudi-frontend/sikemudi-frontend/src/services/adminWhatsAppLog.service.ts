import { apiRequest } from "@/services/api";
import { ADMIN_ENDPOINTS } from "@/services/endpoints";
import type {
  AdminWhatsAppLogDetailData,
  AdminWhatsAppLogListData,
  AdminWhatsAppLogQuery,
  AdminWhatsAppLogRetryData,
} from "@/types/adminWhatsAppLog";

const DEFAULT_PER_PAGE = 10;

function ensureData<TData>(data: TData | undefined, message: string): TData {
  if (!data) {
    throw new Error(message);
  }

  return data;
}

export async function getAdminWhatsAppLogs(
  query: AdminWhatsAppLogQuery = {},
): Promise<AdminWhatsAppLogListData> {
  const response = await apiRequest<AdminWhatsAppLogListData>(
    ADMIN_ENDPOINTS.whatsAppNotificationLogs,
    {
      query: {
        per_page: query.per_page ?? DEFAULT_PER_PAGE,
        ...query,
      },
    },
  );

  return ensureData(response.data, "Response log WhatsApp tidak valid.");
}

export async function getAdminWhatsAppLogDetail(
  logId: string | number,
): Promise<AdminWhatsAppLogDetailData> {
  const response = await apiRequest<AdminWhatsAppLogDetailData>(
    ADMIN_ENDPOINTS.whatsAppNotificationLogDetail(logId),
  );

  return ensureData(response.data, "Response detail log WhatsApp tidak valid.");
}

export async function retryAdminWhatsAppLog(
  logId: string | number,
): Promise<AdminWhatsAppLogRetryData> {
  const response = await apiRequest<AdminWhatsAppLogRetryData>(
    ADMIN_ENDPOINTS.retryWhatsAppNotificationLog(logId),
    { method: "POST" },
  );

  return ensureData(response.data, "Response kirim ulang WhatsApp tidak valid.");
}
