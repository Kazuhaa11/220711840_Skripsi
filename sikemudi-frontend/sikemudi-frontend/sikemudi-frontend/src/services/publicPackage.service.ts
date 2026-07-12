import { apiRequest } from "@/services/api";
import { PUBLIC_ENDPOINTS } from "@/services/endpoints";
import type {
  PublicCoursePackageApiItem,
  PublicCoursePackageDetailData,
  PublicCoursePackageListData,
} from "@/types/publicPackage";

interface PublicPackageQuery {
  q?: string;
}

export async function getPublicCoursePackages(
  query: PublicPackageQuery = {},
): Promise<PublicCoursePackageApiItem[]> {
  const response = await apiRequest<PublicCoursePackageListData>(
    PUBLIC_ENDPOINTS.packages,
    {
      method: "GET",
      query: { q: query.q },
      withAuth: false,
    },
  );

  return response.data?.items ?? [];
}

export async function getPublicCoursePackageDetail(
  id: string | number,
): Promise<PublicCoursePackageApiItem> {
  const response = await apiRequest<PublicCoursePackageDetailData>(
    PUBLIC_ENDPOINTS.packageDetail(id),
    {
      method: "GET",
      withAuth: false,
    },
  );

  if (!response.data?.item) {
    throw new Error("Detail paket kursus tidak ditemukan.");
  }

  return response.data.item;
}
