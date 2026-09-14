export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "validation_error"
  | "internal_error";

/**
 * Thrown by apiFetch for every non-2xx response, and for network failures
 * (backend unreachable) using status 0. `message` is meant to be shown to
 * the user as-is — the backend's error contract promises human-readable
 * text here (see docs/BACKEND_API_SPEC.md's frontend integration notes).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details: unknown;

  constructor(status: number, code: ApiErrorCode, message: string, details: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Field errors from a `validation_error` response, shaped like zod's fieldErrors. */
export function fieldErrorsFrom(error: unknown): Record<string, string> {
  if (error instanceof ApiError && error.code === "validation_error" && error.details && typeof error.details === "object") {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(error.details as Record<string, unknown>)) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  }
  return {};
}
