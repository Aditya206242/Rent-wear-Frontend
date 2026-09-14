import { API_BASE_URL } from "./config";
import { ApiError, type ApiErrorCode } from "./errors";

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /** Bearer token — omit for public endpoints (catalog, occasions, outfits). */
  token?: string | null;
  /** ISO 4217 code, e.g. "USD". Sent as X-Currency; omit to let the backend geo-detect. */
  currency?: string | null;
  searchParams?: Record<string, string | number | boolean | undefined | null>;
  idempotencyKey?: string;
  /** Passed through to fetch — use for Next.js caching/revalidation on server-side calls. */
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
};

function buildUrl(path: string, searchParams?: ApiFetchOptions["searchParams"]) {
  const url = new URL(API_BASE_URL + (path.startsWith("/") ? path : `/${path}`));
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Thin wrapper around fetch for LoopWear's backend (see
 * docs/BACKEND_API_SPEC.md). Attaches auth/currency headers, parses the
 * documented `{ error: { code, message, details } }` shape, and throws
 * ApiError for anything that isn't a 2xx — callers catch ApiError, they
 * never need to check `response.ok` themselves.
 */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = "GET", body, token, currency, searchParams, idempotencyKey, cache, next } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (currency) headers["X-Currency"] = currency;
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;

  let response: Response;
  try {
    response = await fetch(buildUrl(path, searchParams), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      cache,
      next,
    });
  } catch (cause) {
    throw new ApiError(
      0,
      "internal_error",
      "Couldn't reach LoopWear's backend — is it running at " + API_BASE_URL + "?",
      cause
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const json = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const errorPayload = (json as { error?: { code?: ApiErrorCode; message?: string; details?: unknown } } | null)
      ?.error;
    throw new ApiError(
      response.status,
      errorPayload?.code ?? "internal_error",
      errorPayload?.message ?? `Request failed (${response.status})`,
      errorPayload?.details ?? null
    );
  }

  return json as T;
}
