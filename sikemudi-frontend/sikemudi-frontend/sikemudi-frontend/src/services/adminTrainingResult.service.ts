import { apiRequest } from "@/services/api";
import { ADMIN_ENDPOINTS } from "@/services/endpoints";
import type {
  AdminTrainingResultItemData,
  AdminTrainingResultPackageListData,
  AdminTrainingResultQuery,
  ValidateAdminTrainingResultPayload,
} from "@/types/adminTrainingResult";

function ensureData<TData>(data: TData | undefined, fallbackMessage: string): TData {
  if (!data) {
    throw new Error(fallbackMessage);
  }

  return data;
}

export async function getAdminTrainingResults(
  query: AdminTrainingResultQuery = {},
): Promise<AdminTrainingResultPackageListData> {
  const response = await apiRequest<AdminTrainingResultPackageListData>(
    ADMIN_ENDPOINTS.trainingResults,
    {
      query: {
        per_page: 10,
        ...query,
      },
    },
  );

  return ensureData(response.data, "Response hasil latihan admin tidak valid.");
}

export async function getAdminTrainingResultDetail(
  resultId: string | number,
): Promise<AdminTrainingResultItemData> {
  const response = await apiRequest<AdminTrainingResultItemData>(
    ADMIN_ENDPOINTS.trainingResultDetail(resultId),
  );

  return ensureData(response.data, "Response detail hasil latihan tidak valid.");
}

export async function validateAdminTrainingResult(
  resultId: string | number,
  payload: ValidateAdminTrainingResultPayload,
): Promise<AdminTrainingResultItemData> {
  const response = await apiRequest<AdminTrainingResultItemData>(
    ADMIN_ENDPOINTS.validateTrainingResult(resultId),
    {
      method: "PUT",
      body: payload as unknown as Record<string, unknown>,
    },
  );

  return ensureData(response.data, "Response validasi hasil latihan tidak valid.");
}
