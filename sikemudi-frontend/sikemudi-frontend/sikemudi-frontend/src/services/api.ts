import { API_BASE_URL } from "@/services/endpoints";
import type { ApiQueryParams, ApiResponse } from "@/types/api";

const AUTH_TOKEN_KEY = "sikemudi_auth_token";
const AUTH_TOKEN_META_KEY = "sikemudi_auth_token_meta";
const AUTH_EXPIRED_STATUS_CODES = [401, 402, 419];
const EXPIRED_TOKEN_MESSAGE = "Sesi login Anda sudah kedaluwarsa. Silakan login kembali.";
const NETWORK_ERROR_MESSAGE =
  "Server tidak dapat dihubungi. Periksa koneksi internet Anda atau coba beberapa saat lagi.";
const DEFAULT_API_ERROR_MESSAGE = "Terjadi kesalahan saat menghubungi server.";
const GENERIC_INVALID_RESPONSE_MESSAGE = "Response server tidak valid.";
const MAX_VALIDATION_MESSAGES = 4;

export const API_UNAUTHORIZED_EVENT = "sikemudi:unauthorized";

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: BodyInit | Record<string, unknown> | null;
  query?: ApiQueryParams;
  withAuth?: boolean;
}

interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[] | string>;
}

type ApiValidationErrors = Record<string, string[] | string>;

export interface StoredAuthTokenMeta {
  token_type?: string;
  token_expires_at?: string | null;
  token_expires_in_seconds?: number | null;
  stored_at: string;
}

export interface SetStoredAuthTokenOptions {
  tokenType?: string | null;
  tokenExpiresAt?: string | null;
  tokenExpiresInSeconds?: number | null;
}

export interface ApiUnauthorizedEventDetail {
  reason: "missing_token" | "expired_token" | "unauthorized_response";
  status?: number;
  message?: string;
}

export class ApiRequestError extends Error {
  status: number;
  errors?: ApiValidationErrors;

  constructor(message: string, status: number, errors?: ApiValidationErrors) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

function humanizeFieldName(field: string): string {
  const lastPath = field.split(".").at(-1) ?? field;
  return lastPath
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatApiValidationErrors(errors?: ApiValidationErrors): string {
  if (!errors) return "";

  const messages = Object.entries(errors)
    .flatMap(([field, fieldErrors]) => {
      const values = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];

      return values
        .filter(Boolean)
        .map((message) => `${humanizeFieldName(field)}: ${message}`);
    })
    .slice(0, MAX_VALIDATION_MESSAGES);

  if (messages.length === 0) return "";

  const remainingCount = Object.values(errors).reduce((total, fieldErrors) => {
    return total + (Array.isArray(fieldErrors) ? fieldErrors.length : 1);
  }, 0) - messages.length;

  return remainingCount > 0
    ? `${messages.join(" ")} Dan ${remainingCount} error lain.`
    : messages.join(" ");
}

function isGenericValidationMessage(message?: string): boolean {
  if (!message) return true;

  const normalized = message.trim().toLowerCase();

  return [
    "the given data was invalid.",
    "validasi gagal.",
    "validation error.",
    "validation failed.",
  ].includes(normalized);
}

function buildApiErrorMessage(payload: ApiErrorPayload | null, fallback: string): string {
  const validationMessage = formatApiValidationErrors(payload?.errors);

  if (validationMessage && isGenericValidationMessage(payload?.message)) {
    return validationMessage;
  }

  if (payload?.message?.trim()) {
    return validationMessage
      ? `${payload.message.trim()} ${validationMessage}`
      : payload.message.trim();
  }

  return validationMessage || fallback;
}

export function getFriendlyApiErrorMessage(error: unknown, fallback = DEFAULT_API_ERROR_MESSAGE): string {
  if (isApiRequestError(error)) {
    return error.message || fallback;
  }

  if (error instanceof TypeError) {
    return NETWORK_ERROR_MESSAGE;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

function wrapNetworkError(error: unknown, fallback = NETWORK_ERROR_MESSAGE): never {
  if (error instanceof ApiRequestError) {
    throw error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    throw new ApiRequestError("Permintaan dibatalkan. Silakan coba lagi.", 0);
  }

  throw new ApiRequestError(getFriendlyApiErrorMessage(error, fallback), 0);
}

export function getStoredAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getStoredAuthTokenMeta(): StoredAuthTokenMeta | null {
  const rawMeta = localStorage.getItem(AUTH_TOKEN_META_KEY);

  if (!rawMeta) {
    return null;
  }

  try {
    return JSON.parse(rawMeta) as StoredAuthTokenMeta;
  } catch {
    localStorage.removeItem(AUTH_TOKEN_META_KEY);
    return null;
  }
}

export function getStoredAuthTokenExpiresAt(): string | null {
  return getStoredAuthTokenMeta()?.token_expires_at ?? null;
}

export function getStoredAuthTokenExpiresAtTime(): number | null {
  const expiresAt = getStoredAuthTokenExpiresAt();

  if (!expiresAt) {
    return null;
  }

  const expiresAtTime = new Date(expiresAt).getTime();

  return Number.isFinite(expiresAtTime) ? expiresAtTime : null;
}

export function isStoredAuthTokenExpired(bufferMs = 0): boolean {
  const expiresAtTime = getStoredAuthTokenExpiresAtTime();

  if (!expiresAtTime) {
    return false;
  }

  return Date.now() + bufferMs >= expiresAtTime;
}

export function setStoredAuthToken(
  token: string,
  options: SetStoredAuthTokenOptions = {},
): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(
    AUTH_TOKEN_META_KEY,
    JSON.stringify({
      token_type: options.tokenType ?? "Bearer",
      token_expires_at: options.tokenExpiresAt ?? null,
      token_expires_in_seconds: options.tokenExpiresInSeconds ?? null,
      stored_at: new Date().toISOString(),
    } satisfies StoredAuthTokenMeta),
  );
}

export function clearStoredAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_TOKEN_META_KEY);
}

function notifyUnauthorized(detail: ApiUnauthorizedEventDetail): void {
  clearStoredAuthToken();

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<ApiUnauthorizedEventDetail>(API_UNAUTHORIZED_EVENT, {
      detail,
    }));
  }
}

function shouldForceLogout(status: number): boolean {
  return AUTH_EXPIRED_STATUS_CODES.includes(status);
}

function assertUsableStoredToken(withAuth: boolean): string | null {
  if (!withAuth) {
    return null;
  }

  const token = getStoredAuthToken();

  if (!token) {
    notifyUnauthorized({
      reason: "missing_token",
      message: "Sesi login tidak ditemukan. Silakan login kembali.",
    });

    throw new ApiRequestError("Sesi login tidak ditemukan. Silakan login kembali.", 401);
  }

  if (isStoredAuthTokenExpired()) {
    notifyUnauthorized({
      reason: "expired_token",
      status: 401,
      message: EXPIRED_TOKEN_MESSAGE,
    });

    throw new ApiRequestError(EXPIRED_TOKEN_MESSAGE, 401);
  }

  return token;
}

export function buildApiUrl(endpoint: string, query?: ApiQueryParams): string {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = new URL(`${baseUrl}${normalizedEndpoint}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

export async function apiRequest<TData = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<TData>> {
  const { body, query, withAuth = true, headers, ...fetchOptions } = options;
  const requestHeaders = new Headers(headers);
  const isFormData = body instanceof FormData;

  if (!isFormData && body !== undefined && body !== null && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  requestHeaders.set("Accept", "application/json");

  const token = assertUsableStoredToken(withAuth);

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildApiUrl(endpoint, query), {
      ...fetchOptions,
      headers: requestHeaders,
      body: isFormData || typeof body === "string" ? body : body ? JSON.stringify(body) : null,
    });
  } catch (error) {
    wrapNetworkError(error);
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? ((await response.json()) as ApiResponse<TData> & ApiErrorPayload) : null;

  if (!response.ok) {
    if (withAuth && shouldForceLogout(response.status)) {
      notifyUnauthorized({
        reason: "unauthorized_response",
        status: response.status,
        message: payload?.message ?? EXPIRED_TOKEN_MESSAGE,
      });
    }

    throw new ApiRequestError(
      buildApiErrorMessage(payload, DEFAULT_API_ERROR_MESSAGE),
      response.status,
      payload?.errors,
    );
  }

  if (!payload) {
    throw new ApiRequestError(GENERIC_INVALID_RESPONSE_MESSAGE, response.status);
  }

  return payload;
}

export async function apiDownload(endpoint: string, query?: ApiQueryParams): Promise<Blob> {
  const token = assertUsableStoredToken(true);
  let response: Response;

  try {
    response = await fetch(buildApiUrl(endpoint, query), {
      headers: {
        Accept: "application/octet-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (error) {
    wrapNetworkError(error, "File gagal diunduh karena server tidak dapat dihubungi.");
  }

  if (!response.ok) {
    const contentType = response.headers.get("Content-Type") ?? "";
    const payload = contentType.includes("application/json")
      ? ((await response.json()) as ApiErrorPayload)
      : null;

    if (shouldForceLogout(response.status)) {
      notifyUnauthorized({
        reason: "unauthorized_response",
        status: response.status,
        message: payload?.message ?? EXPIRED_TOKEN_MESSAGE,
      });
    }

    if (payload) {
      throw new ApiRequestError(buildApiErrorMessage(payload, "File gagal diunduh."), response.status, payload.errors);
    }

    throw new ApiRequestError("File gagal diunduh.", response.status);
  }

  return response.blob();
}
