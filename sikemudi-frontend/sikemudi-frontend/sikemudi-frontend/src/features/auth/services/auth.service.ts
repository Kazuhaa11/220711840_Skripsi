import { apiRequest } from "@/services/api";
import { AUTH_ENDPOINTS } from "@/services/endpoints";
import type {
  AuthMeData,
  AuthTokenData,
  LoginPayload,
  RegisterParticipantPayload,
} from "@/types/auth";

const DEFAULT_DEVICE_NAME = "sikemudi-web";

export async function login(payload: LoginPayload): Promise<AuthTokenData> {
  const response = await apiRequest<AuthTokenData>(AUTH_ENDPOINTS.login, {
    method: "POST",
    withAuth: false,
    body: {
      device_name: DEFAULT_DEVICE_NAME,
      ...payload,
    },
  });

  if (!response.data) {
    throw new Error("Response login tidak valid.");
  }

  return response.data;
}

export async function registerParticipant(
  payload: RegisterParticipantPayload,
): Promise<AuthTokenData> {
  const response = await apiRequest<AuthTokenData>(AUTH_ENDPOINTS.register, {
    method: "POST",
    withAuth: false,
    body: {
      device_name: DEFAULT_DEVICE_NAME,
      ...payload,
    },
  });

  if (!response.data) {
    throw new Error("Response registrasi tidak valid.");
  }

  return response.data;
}

export async function getCurrentUser(): Promise<AuthMeData> {
  const response = await apiRequest<AuthMeData>(AUTH_ENDPOINTS.me);

  if (!response.data) {
    throw new Error("Response pengguna tidak valid.");
  }

  return response.data;
}

export async function logout(): Promise<void> {
  await apiRequest(AUTH_ENDPOINTS.logout, {
    method: "POST",
  });
}
