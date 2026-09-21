export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (typeof window !== "undefined"
    ? "/api-proxy"
    : "https://multi-tenant-saas-ten.vercel.app");

export const ACCESS_TOKEN_KEY = "clinic_access_token";
export const REFRESH_TOKEN_KEY = "clinic_refresh_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  payload: unknown;
  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}


// ───────────────────────────── Session refresh ─────────────────────────────

export const AUTH_EXPIRED_EVENT = "auth-expired";

/** ok = valid session | invalid = refresh token rejected (real logout) | error = transient failure (network / 5xx) */
export type RefreshResult = "ok" | "invalid" | "error";

export function getTokenExp(token: string | null): number | null {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = JSON.parse(json)?.exp;
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

/** true when the token is expired or will expire within `skewMs` */
export function isTokenExpiring(token: string | null, skewMs = 60_000): boolean {
  const exp = getTokenExp(token);
  if (exp === null) return false; // unknown expiry → let the 401 flow handle it
  return exp * 1000 - Date.now() <= skewMs;
}

function notifyAuthExpired() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function doRefresh(staleAccessToken: string | null): Promise<RefreshResult> {
  // Another tab may already have refreshed while we were waiting for the lock.
  const current = getAccessToken();
  if (current && current !== staleAccessToken && !isTokenExpiring(current, 5_000)) {
    return "ok";
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return "invalid";

    try {
      const accessToken = getAccessToken();
      const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: accessToken } : {}),
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        const result = json?.data?.result ?? json?.data;
        if (result?.accessToken && result?.refreshToken) {
          setTokens(result.accessToken, result.refreshToken);
          return "ok";
        }
        return "error";
      }

      if (res.status === 400 || res.status === 401 || res.status === 403) {
        // Refresh token may have been rotated by another tab in the meantime.
        const latest = getRefreshToken();
        if (latest && latest !== refreshToken) return "ok";
        return "invalid";
      }
      // 404 / 5xx / cold start → transient, retry once then give up WITHOUT logging out
    } catch {
      // network error → transient
    }
    if (attempt === 0) await sleep(800);
  }
  return "error";
}

let refreshPromise: Promise<RefreshResult> | null = null;

/** Single-flight refresh, also serialized across browser tabs (Web Locks API). */
export function refreshSession(
  staleAccessToken: string | null = getAccessToken()
): Promise<RefreshResult> {
  if (!refreshPromise) {
    const run = () => doRefresh(staleAccessToken);
    const locks =
      typeof navigator !== "undefined" ? (navigator as any).locks : undefined;
    const p: Promise<RefreshResult> = locks?.request
      ? locks.request("clinic-refresh-token", run)
      : run();
    refreshPromise = Promise.resolve(p).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

/**
 * Makes sure a usable access token exists, refreshing it if it is expired or about to expire.
 * Clears the session (and notifies the UI) only when the refresh token is really rejected.
 */
export async function ensureSession(skewMs = 60_000): Promise<RefreshResult> {
  const access = getAccessToken();
  if (access && !isTokenExpiring(access, skewMs)) return "ok";
  if (!getRefreshToken()) {
    clearTokens();
    clearApiCache();
    if (access) notifyAuthExpired();
    return "invalid";
  }
  const result = await refreshSession();
  if (result === "invalid") {
    clearTokens();
    clearApiCache();
    notifyAuthExpired();
  }
  return result;
}

let activeRequests = 0;
let activeBlocking = 0;

function updateLoadingState(increment: boolean, blocking: boolean) {
  if (typeof window === "undefined") return;
  if (increment) {
    activeRequests++;
    if (blocking) activeBlocking++;
  } else {
    activeRequests = Math.max(0, activeRequests - 1);
    if (blocking) activeBlocking = Math.max(0, activeBlocking - 1);
  }
  window.dispatchEvent(
    new CustomEvent("global-loading", {
      detail: { isLoading: activeRequests > 0, blocking: activeBlocking > 0 },
    })
  );
}

export function formatArabicErrorMessage(
  status: number,
  message?: string,
  body?: any
): string {
  const rawMsg = (
    (message || "") +
    " " +
    (typeof body === "string" ? body : JSON.stringify(body || {}))
  ).toLowerCase();

  // 1. National ID duplicates / existence errors
  if (
    rawMsg.includes("nationalid") ||
    rawMsg.includes("national_id") ||
    rawMsg.includes("الرقم القومي")
  ) {
    if (
      rawMsg.includes("exist") ||
      rawMsg.includes("duplicate") ||
      rawMsg.includes("already") ||
      rawMsg.includes("registered") ||
      status === 409 ||
      status === 400
    ) {
      return "الرقم القومي هذا مسجّل بالفعل في النظام. يرجى استخدام رقم قومي آخر أو تسجيل الدخول.";
    }
  }

  // 2. Email duplicates
  if (rawMsg.includes("email") || rawMsg.includes("البريد")) {
    if (
      rawMsg.includes("exist") ||
      rawMsg.includes("duplicate") ||
      rawMsg.includes("already") ||
      rawMsg.includes("registered") ||
      status === 409 ||
      status === 400
    ) {
      return "البريد الإلكتروني هذا مسجّل بالفعل. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.";
    }
  }

  // 3. Phone duplicates
  if (rawMsg.includes("phone") || rawMsg.includes("الهاتف")) {
    if (
      rawMsg.includes("exist") ||
      rawMsg.includes("duplicate") ||
      rawMsg.includes("already")
    ) {
      return "رقم الهاتف هذا مسجّل بالفعل لدى حساب آخر.";
    }
  }

  // 4. Generic duplicate / conflict errors
  if (
    rawMsg.includes("duplicate") ||
    rawMsg.includes("already exist") ||
    rawMsg.includes("already registered") ||
    status === 409
  ) {
    return "هذه البيانات مسجّلة بالفعل في النظام. يرجى التأكد من الرقم القومي والبريد الإلكتروني.";
  }

  // 5. User not found (Wrong National ID usually)
  if (rawMsg.includes("user not found")) {
    return "الرقم القومي غير صحيح أو الحساب غير مسجل في النظام.";
  }
  if (rawMsg.includes("patient not found")) {
    return "لم يتم العثور على حساب المريض. يرجى التأكد من الرقم القومي أو البيانات.";
  }
  if (rawMsg.includes("doctor not found")) {
    return "لم يتم العثور على حساب الطبيب المطلوب.";
  }
  if (rawMsg.includes("hospital not found")) {
    return "لم يتم العثور على حساب المستشفى المطلوب.";
  }
  if (rawMsg.includes("clinic not found")) {
    return "لم يتم العثور على العيادة المطلوبة.";
  }

  // 6. Invalid credentials (Wrong Password)
  if (
    rawMsg.includes("invalid credential") ||
    rawMsg.includes("wrong password") ||
    rawMsg.includes("incorrect password")
  ) {
    return "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.";
  }

  // 7. Role & Subscription specific errors
  if (rawMsg.includes("subscription expired") || rawMsg.includes("ispaid")) {
    return "انتهت صلاحية اشتراك حساب الطبيب أو العيادة — يرجى تجديد الاشتراك لتفعيل هذه الميزة.";
  }

  if (rawMsg.includes("must be a doctor") || rawMsg.includes("doctors only")) {
    return "هذا الإجراء مخصص لحسابات الأطباء المشتركين فقط.";
  }

  // 8. Status code fallbacks
  if (status === 401) {
    if (
      rawMsg.includes("login") ||
      rawMsg.includes("credential") ||
      rawMsg.includes("password") ||
      rawMsg.includes("unauthorized") && !rawMsg.includes("token")
    ) {
      return "الرقم القومي أو كلمة المرور غير صحيحة.";
    }
    return "انتهت جلسة تسجيل الدخول — يرجى تسجيل الدخول مرة أخرى للمتابعة.";
  }

  if (status === 403) {
    if (rawMsg.includes("subscription") || rawMsg.includes("paid")) {
      return "انتهت صلاحية اشتراك حساب الطبيب أو العيادة — يرجى تجديد الاشتراك.";
    }
    return "ليس لديك الصلاحية الكافية لإجراء هذه العملية.";
  }

  if (status === 404) {
    return "الحساب أو الخدمة المطلوبة غير موجودة في النظام حالياً (404). يرجى التأكد من البيانات أو التواصل مع الدعم.";
  }

  if (status === 400 || status === 422) {
    if (rawMsg.includes("jwt expired") || rawMsg.includes("token expired")) {
      return "انتهت جلسة تسجيل الدخول — يرجى تسجيل الدخول مرة أخرى.";
    }
    return "البيانات المدخلة غير صالحة أو مكررة. يرجى التأكد من صحة البيانات.";
  }

  if (status >= 500) {
    return "حدث خطأ في السيرفر الرئيسي. يرجى المحاولة مرة أخرى لاحقاً.";
  }

  // 7. If the backend sent a clear Arabic message directly, use it
  if (message && /^[\u0600-\u06FF\s0-9.,!?()-]+$/.test(message.trim())) {
    return message;
  }

  // 8. Fallback
  return message && !message.startsWith("Request failed")
    ? `خطأ: ${message}`
    : "حدث خطأ أثناء تنفيذ الطلب. يرجى مراجعة البيانات والمحاولة مجدداً.";
}

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache
const apiCache = new Map<string, { data: any; timestamp: number }>();

export function clearApiCache(pathPrefix?: string) {
  if (!pathPrefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.startsWith(pathPrefix)) {
      apiCache.delete(key);
    }
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // attach Authorization header (default: true)
  retry?: boolean; // internal flag to prevent infinite refresh loops
  noCache?: boolean; // bypass memory cache
  silent?: boolean; // don't show the global loading indicator (background requests)
}

export async function prefetchApi<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<void> {
  try {
    await apiFetch<T>(path, { ...options, silent: true });
  } catch {
    // ignore prefetch errors
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    auth = true,
    retry = false,
    noCache = false,
    silent = false,
    headers,
    ...rest
  } = options;
  const method = (rest.method || "GET").toUpperCase();
  const isGet = method === "GET";

  // Refresh proactively so the request doesn't have to fail with 401 first.
  if (auth && !retry && typeof window !== "undefined") {
    const access = getAccessToken();
    if (access && isTokenExpiring(access, 30_000)) {
      await ensureSession(30_000);
    }
  }

  // Build cache key
  const token = auth ? getAccessToken() : null;
  const cacheKey = `${method}:${path}:${token || "public"}`;

  // If GET and cached within TTL, return cached value instantly! (Exclude dynamic notification endpoints)
  const isExcludedFromCache = path.includes("notification");
  if (isGet && !noCache && !retry && !isExcludedFromCache && typeof window !== "undefined") {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  // Mutating methods (POST/PUT/DELETE/PATCH) invalidate cache
  if (!isGet && typeof window !== "undefined") {
    clearApiCache();
  }

  // Only user-triggered writes block the screen; reads just move the top progress bar.
  const track = !retry && !silent;
  const blocking = !isGet;
  if (track) updateLoadingState(true, blocking);

  const isFormData =
    typeof FormData !== "undefined" && rest.body instanceof FormData;

  const finalHeaders: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(headers as Record<string, string>),
  };

  if (auth && token) {
    finalHeaders["Authorization"] = token;
  }

  let res: Response;
  try {
    try {
      res = await fetch(`${API_BASE_URL}${path}`, {
        ...rest,
        method,
        headers: finalHeaders,
        cache: "no-store",
      });
    } catch (err: any) {
      throw new ApiError(
        "تعذّر الاتصال بالسيرفر. يرجى التحقق من اتصال الإنترنت أو إعدادات الشبكة.",
        0,
        err
      );
    }

    let body: any = null;
    const text = await res.text();
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (res.status === 401 && auth && !retry) {
      // Pass the token THIS request used: if it was already replaced (by another
      // request or tab), doRefresh returns "ok" without hitting the server again.
      const result = await refreshSession(token);
      if (result === "ok") {
        return await apiFetch<T>(path, { ...options, retry: true });
      }
      if (result === "invalid") {
        clearTokens();
        clearApiCache();
        notifyAuthExpired();
      } else {
        // Transient refresh failure: keep the session, just report a connection problem.
        throw new ApiError(
          "تعذّر تجديد الجلسة مؤقتاً بسبب مشكلة في الاتصال بالسيرفر. حاول مرة أخرى.",
          0,
          body
        );
      }
    }

    if (!res.ok) {
      const rawMessage =
        (body && (body.message || body.error || (Array.isArray(body.errors) && body.errors.join(", ")))) || "";
      const friendlyArabicMessage = formatArabicErrorMessage(res.status, rawMessage, body);
      throw new ApiError(friendlyArabicMessage, res.status, body);
    }

    // Save successful GET response to in-memory cache (unless excluded)
    if (isGet && !isExcludedFromCache && typeof window !== "undefined") {
      apiCache.set(cacheKey, { data: body, timestamp: Date.now() });
    }

    return body as T;
  } finally {
    if (track) updateLoadingState(false, blocking);
  }
}