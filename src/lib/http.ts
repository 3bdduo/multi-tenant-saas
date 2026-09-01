


export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (typeof window !== "undefined"
    ? "/api-proxy"
    : "https://multi-tenant-saas-ten.vercel.app");

const ACCESS_TOKEN_KEY = "clinic_access_token";
const REFRESH_TOKEN_KEY = "clinic_refresh_token";

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

interface RequestOptions extends RequestInit {
  auth?: boolean; 
  retry?: boolean; 
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshPromise) {
    const accessToken = getAccessToken();
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: accessToken } : {}),
      },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const json = await res.json();
        const result = json?.data?.result ?? json?.data;
        if (result?.accessToken && result?.refreshToken) {
          setTokens(result.accessToken, result.refreshToken);
          return true;
        }
        return false;
      })
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

let activeRequests = 0;

function updateLoadingState(increment: boolean) {
  if (typeof window === "undefined") return;
  if (increment) {
    activeRequests++;
  } else {
    activeRequests = Math.max(0, activeRequests - 1);
  }
  window.dispatchEvent(
    new CustomEvent("global-loading", { detail: { isLoading: activeRequests > 0 } })
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

  // 5. Invalid credentials / Auth errors
  if (
    rawMsg.includes("invalid credentials") ||
    rawMsg.includes("wrong password") ||
    rawMsg.includes("incorrect")
  ) {
    return "الرقم القومي أو كلمة المرور غير صحيحة. يرجى التأكد من البيانات وإعادة المحاولة.";
  }

  // 6. Status code fallbacks
  if (status === 401) {
    return "الرقم القومي أو كلمة المرور غير صحيحة، أو انتهت جلسة العمل.";
  }

  if (status === 403) {
    return "ليس لديك الصلاحية الكافية لإجراء هذه العملية.";
  }

  if (status === 404) {
    return "الحساب أو الخدمة المطلوبة غير موجودة في النظام حالياً (404). يرجى التأكد من البيانات أو التواصل مع الدعم.";
  }

  if (status === 400 || status === 422) {
    return "البيانات المدخلة غير صالحة أو مكررة. يرجى التأكد من صحة الرقم القومي والبريد وكلمة المرور.";
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
}

export async function prefetchApi<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<void> {
  try {
    await apiFetch<T>(path, options);
  } catch {
    // ignore prefetch errors
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, retry = false, noCache = false, headers, ...rest } = options;
  const method = (rest.method || "GET").toUpperCase();
  const isGet = method === "GET";

  // Build cache key
  const token = auth ? getAccessToken() : null;
  const cacheKey = `${method}:${path}:${token || "public"}`;

  // If GET and cached within TTL, return cached value instantly!
  if (isGet && !noCache && !retry && typeof window !== "undefined") {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T;
    }
  }

  // Mutating methods (POST/PUT/DELETE/PATCH) invalidate cache
  if (!isGet && typeof window !== "undefined") {
    clearApiCache();
  }

  if (!retry) updateLoadingState(true);

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
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return await apiFetch<T>(path, { ...options, retry: true });
      }
      clearTokens();
      clearApiCache();
    }

    if (!res.ok) {
      const rawMessage =
        (body && (body.message || body.error || (Array.isArray(body.errors) && body.errors.join(", ")))) || "";
      const friendlyArabicMessage = formatArabicErrorMessage(res.status, rawMessage, body);
      throw new ApiError(friendlyArabicMessage, res.status, body);
    }

    // Save successful GET response to in-memory cache
    if (isGet && typeof window !== "undefined") {
      apiCache.set(cacheKey, { data: body, timestamp: Date.now() });
    }

    return body as T;
  } finally {
    if (!retry) updateLoadingState(false);
  }
}

