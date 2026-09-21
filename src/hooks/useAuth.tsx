"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ACCESS_TOKEN_KEY,
  AUTH_EXPIRED_EVENT,
  clearApiCache,
  clearTokens,
  ensureSession,
  getAccessToken,
  getTokenExp,
  setTokens as persistTokens,
} from "@/lib/http";
import { login as loginRequest } from "@/lib/api/auth";
import type { JwtPayload, LoginPayload, Role } from "@/types/api";

interface AuthState {
  role: Role | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<Role>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOGGED_OUT: AuthState = {
  role: null,
  userId: null,
  isAuthenticated: false,
  isLoading: false,
};

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payloadPart = token.split(".")[1];
    const json = atob(payloadPart.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    role: null,
    userId: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // ── Initial session restore ────────────────────────────────────────────────
  // Previously an expired access token meant "logged out" even when a valid
  // refresh token existed. Now we try to refresh first.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      const status = await ensureSession();
      if (cancelled) return;

      const token = getAccessToken();
      const payload = token ? decodeJwt(token) : null;

      // "ok"    → fresh session.
      // "error" → transient failure (network / server cold start): keep the user
      //           signed in; the API layer will retry the refresh on the next request.
      // "invalid" → refresh token rejected → really logged out.
      if (payload && (status === "ok" || status === "error")) {
        setState({
          role: payload.role,
          userId: payload.userId,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState(LOGGED_OUT);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Session ended (refresh token rejected) ─────────────────────────────────
  useEffect(() => {
    const onExpired = () => setState(LOGGED_OUT);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  // ── Keep tabs in sync (logout/login in another tab) ────────────────────────
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== ACCESS_TOKEN_KEY) return;
      const token = getAccessToken();
      if (!token) {
        setState(LOGGED_OUT);
        return;
      }
      const payload = decodeJwt(token);
      if (!payload) return;
      setState((prev) =>
        prev.isAuthenticated &&
          prev.userId === payload.userId &&
          prev.role === payload.role
          ? prev
          : {
            role: payload.role,
            userId: payload.userId,
            isAuthenticated: true,
            isLoading: false,
          }
      );
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ── Proactive refresh while the user is on the site ────────────────────────
  useEffect(() => {
    if (!state.isAuthenticated) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    const schedule = () => {
      if (stopped) return;
      const exp = getTokenExp(getAccessToken());
      // refresh ~90s before expiry (at least every 15s retry, at most every 10 min check)
      const delay = exp
        ? Math.min(Math.max(exp * 1000 - Date.now() - 90_000, 15_000), 10 * 60_000)
        : 5 * 60_000;
      timer = setTimeout(async () => {
        await ensureSession(90_000);
        schedule();
      }, delay);
    };
    schedule();

    // Timers are throttled in background tabs → also check when the user comes back.
    const onWake = () => {
      if (document.visibilityState === "visible") void ensureSession(60_000);
    };
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("online", onWake);

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("online", onWake);
    };
  }, [state.isAuthenticated]);

  const login = useCallback(async (payload: LoginPayload) => {
    const res = await loginRequest(payload);
    const { accessToken, refreshToken } = res.data;
    persistTokens(accessToken, refreshToken);
    const decoded = decodeJwt(accessToken);
    if (!decoded) throw new Error("Malformed token from server");
    setState({
      role: decoded.role,
      userId: decoded.userId,
      isAuthenticated: true,
      isLoading: false,
    });
    return decoded.role;
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    clearApiCache();
    setState(LOGGED_OUT);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}