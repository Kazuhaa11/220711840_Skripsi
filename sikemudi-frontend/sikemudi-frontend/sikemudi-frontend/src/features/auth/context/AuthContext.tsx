/* eslint-disable react-refresh/only-export-components */
import {
  API_UNAUTHORIZED_EVENT,
  ApiRequestError,
  clearStoredAuthToken,
  getStoredAuthToken,
  getStoredAuthTokenExpiresAtTime,
  isStoredAuthTokenExpired,
  setStoredAuthToken,
  type ApiUnauthorizedEventDetail,
} from "@/services/api";
import * as authService from "@/services/auth.service";
import type {
  AuthTokenData,
  AuthUser,
  LoginPayload,
  RegisterParticipantPayload,
  RoleSlug,
} from "@/types/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const AUTH_USER_KEY = "sikemudi_auth_user";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  roleSlug: RoleSlug | null;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  registerParticipant: (payload: RegisterParticipantPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getStoredUser(): AuthUser | null {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

function setStoredUser(user: AuthUser): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

function clearStoredUser(): void {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getRoleDashboardPath(roleSlug: RoleSlug | null | undefined): string {
  if (roleSlug === "admin") {
    return "/admin/dashboard";
  }

  if (roleSlug === "instruktur") {
    return "/instruktur/dashboard";
  }

  return "/peserta/dashboard";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (isStoredAuthTokenExpired()) {
      clearStoredAuthToken();
      clearStoredUser();
      return null;
    }

    return getStoredAuthToken();
  });
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (isStoredAuthTokenExpired()) {
      clearStoredAuthToken();
      clearStoredUser();
      return null;
    }

    return getStoredUser();
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const clearSession = useCallback(() => {
    clearStoredAuthToken();
    clearStoredUser();
    setToken(null);
    setUser(null);
  }, []);

  const applySession = useCallback((session: AuthTokenData) => {
    setStoredAuthToken(session.token, {
      tokenType: session.token_type,
      tokenExpiresAt: session.token_expires_at,
      tokenExpiresInSeconds: session.token_expires_in_seconds,
    });
    setStoredUser(session.user);
    setToken(session.token);
    setUser(session.user);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!getStoredAuthToken() || isStoredAuthTokenExpired()) {
      clearSession();
      return null;
    }

    try {
      const data = await authService.getCurrentUser();
      setStoredUser(data.user);
      setUser(data.user);
      return data.user;
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        clearSession();
        return null;
      }

      const storedUser = getStoredUser();

      if (storedUser) {
        setUser(storedUser);
        return storedUser;
      }

      return null;
    }
  }, [clearSession]);

  useEffect(() => {
    function handleUnauthorizedSession(event: Event) {
      const detail = (event as CustomEvent<ApiUnauthorizedEventDetail>).detail;

      clearSession();

      if (detail?.reason === "expired_token" || detail?.reason === "unauthorized_response") {
        sessionStorage.setItem(
          "sikemudi_auth_notice",
          detail.message ?? "Sesi login Anda sudah berakhir. Silakan login kembali.",
        );
      }
    }

    window.addEventListener(API_UNAUTHORIZED_EVENT, handleUnauthorizedSession);

    return () => {
      window.removeEventListener(API_UNAUTHORIZED_EVENT, handleUnauthorizedSession);
    };
  }, [clearSession]);

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      if (!getStoredAuthToken() || isStoredAuthTokenExpired()) {
        clearSession();
        if (active) {
          setIsBootstrapping(false);
        }
        return;
      }

      await refreshUser();

      if (active) {
        setIsBootstrapping(false);
      }
    }

    void bootstrapSession();

    return () => {
      active = false;
    };
  }, [clearSession, refreshUser]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const expiresAtTime = getStoredAuthTokenExpiresAtTime();

    if (!expiresAtTime) {
      return;
    }

    const remainingMs = expiresAtTime - Date.now();

    if (remainingMs <= 0) {
      const timeoutId = window.setTimeout(() => {
        clearSession();
        sessionStorage.setItem(
          "sikemudi_auth_notice",
          "Sesi login Anda sudah berakhir. Silakan login kembali.",
        );
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    const timeoutId = window.setTimeout(() => {
      clearSession();
      sessionStorage.setItem(
        "sikemudi_auth_notice",
        "Sesi login Anda sudah berakhir. Silakan login kembali.",
      );
    }, remainingMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [clearSession, token]);

  const handleLogin = useCallback(
    async (payload: LoginPayload) => {
      const data = await authService.login(payload);
      applySession(data);
      return data.user;
    },
    [applySession],
  );

  const handleRegisterParticipant = useCallback(
    async (payload: RegisterParticipantPayload) => {
      const data = await authService.registerParticipant(payload);
      applySession(data);
      return data.user;
    },
    [applySession],
  );

  const handleLogout = useCallback(async () => {
    try {
      if (getStoredAuthToken()) {
        await authService.logout();
      }
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(() => {
    const roleSlug = user?.role?.slug ?? null;

    return {
      user,
      token,
      roleSlug,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      login: handleLogin,
      registerParticipant: handleRegisterParticipant,
      logout: handleLogout,
      refreshUser,
    };
  }, [
    user,
    token,
    isBootstrapping,
    handleLogin,
    handleRegisterParticipant,
    handleLogout,
    refreshUser,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth harus digunakan di dalam AuthProvider.");
  }

  return context;
}
