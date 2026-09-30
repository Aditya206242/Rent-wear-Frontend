import { ApiError, type ApiErrorCode } from "@/lib/api/errors";

/**
 * What every shop Server Action returns: a plain, serializable result the
 * client component can branch on (Server Actions can't throw ApiError
 * instances across the boundary with their fields intact).
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code: ApiErrorCode; error: string; details?: unknown };

export async function toResult<T>(run: () => Promise<T>, fallback: string): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, status: error.status, code: error.code, error: error.message, details: error.details ?? undefined };
    }
    console.error(fallback, error);
    return { ok: false, status: 0, code: "internal_error", error: fallback };
  }
}

export function signedOut<T>(): ActionResult<T> {
  return { ok: false, status: 401, code: "unauthorized", error: "Please sign in to continue." };
}
