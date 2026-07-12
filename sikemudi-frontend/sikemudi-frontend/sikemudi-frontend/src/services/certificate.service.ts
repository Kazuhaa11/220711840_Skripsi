import { apiDownload, apiRequest } from "@/services/api";
import { PARTICIPANT_ENDPOINTS } from "@/services/endpoints";
import type {
  CertificateResponseItem,
  ParticipantCertificateItemData,
  ParticipantCertificateListData,
} from "@/types/certificate";

function ensureData<TData>(data: TData | undefined, fallbackMessage: string): TData {
  if (!data) {
    throw new Error(fallbackMessage);
  }

  return data;
}

export async function getParticipantCertificates(): Promise<ParticipantCertificateListData> {
  const response = await apiRequest<ParticipantCertificateListData>(
    PARTICIPANT_ENDPOINTS.certificates,
  );

  return ensureData(response.data, "Response sertifikat peserta tidak valid.");
}

export async function getParticipantCertificateDetail(
  certificateId: string | number,
): Promise<CertificateResponseItem> {
  const response = await apiRequest<ParticipantCertificateItemData>(
    PARTICIPANT_ENDPOINTS.certificateDetail(certificateId),
  );

  return ensureData(response.data, "Response detail sertifikat tidak valid.").item;
}

export async function downloadParticipantCertificatePdf(
  certificateId: string | number,
): Promise<Blob> {
  return apiDownload(PARTICIPANT_ENDPOINTS.downloadCertificate(certificateId));
}
