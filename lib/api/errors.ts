export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "validation_error"
  | "bad_gateway"
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

/**
 * Field errors from a `validation_error` response. The backend sends zod's
 * own `err.flatten()` shape — `{ formErrors: string[], fieldErrors: { [field]: string[] } }`
 * — not a flat `{ field: string }` map. This previously iterated `details`'s
 * top-level keys expecting string values there directly, so it always found
 * `formErrors` (an array) and `fieldErrors` (an object) and returned `{}`:
 * every backend-side validation failure silently fell back to a generic
 * "Invalid request" message instead of pointing at the offending field.
 */
export function fieldErrorsFrom(error: unknown): Record<string, string> {
  if (error instanceof ApiError && error.code === "validation_error" && error.details && typeof error.details === "object") {
    const details = error.details as { fieldErrors?: Record<string, string[]> };
    const out: Record<string, string> = {};
    if (details.fieldErrors) {
      for (const [key, messages] of Object.entries(details.fieldErrors)) {
        if (messages?.[0]) out[key] = messages[0];
      }
    }
    return out;
  }
  return {};
}
