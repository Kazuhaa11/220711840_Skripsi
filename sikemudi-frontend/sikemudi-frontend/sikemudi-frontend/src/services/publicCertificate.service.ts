import { ApiRequestError, buildApiUrl, getFriendlyApiErrorMessage } from "@/services/api";
import { PUBLIC_ENDPOINTS } from "@/services/endpoints";
import type {
  PublicCertificateVerificationData,
  PublicCertificateVerificationResult,
} from "@/types/publicCertificate";

interface PublicCertificateVerificationPayload {
  success: boolean;
  message?: string;
  data?: PublicCertificateVerificationData;
}

export async function verifyPublicCertificate(
  code: string,
): Promise<PublicCertificateVerificationResult> {
  const normalizedCode = code.trim();

  if (!normalizedCode) {
    throw new Error("Kode verifikasi atau nomor sertifikat wajib diisi.");
  }

  let response: Response;

  try {
    response = await fetch(
      buildApiUrl(PUBLIC_ENDPOINTS.verifyCertificate(normalizedCode)),
      {
        headers: {
          Accept: "application/json",
        },
      },
    );
  } catch (error) {
    throw new ApiRequestError(
      getFriendlyApiErrorMessage(error, "Verifikasi sertifikat gagal diproses."),
      0,
    );
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as PublicCertificateVerificationPayload)
    : null;

  if (!payload) {
    throw new Error("Response server tidak valid.");
  }

  if (!response.ok && response.status !== 404 && response.status !== 410) {
    throw new Error(payload.message ?? "Verifikasi sertifikat gagal diproses.");
  }

  return {
    success: payload.success,
    message: payload.message ?? "Hasil verifikasi sertifikat berhasil dimuat.",
    data: payload.data ?? { is_valid: false },
    statusCode: response.status,
  };
}
