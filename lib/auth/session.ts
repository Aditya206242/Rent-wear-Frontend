import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

const COOKIE_NAME = "loopwear_token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "operator" | "admin";
  verified: boolean;
  country: string | null;
  preferredCurrency: string | null;
};

export async function createSessionCookie(token: string): Promise<void> {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

/** Raw bearer token for this session, or null if signed out. */
export async function getToken(): Promise<string | null> {
  return (await cookies()).get(COOKIE_NAME)?.value ?? null;
}

/**
 * The backend is the source of truth for who's logged in — we don't
 * self-sign or locally verify the token, we just hold it and ask
 * `GET /auth/session` (see docs/BACKEND_API_SPEC.md). `cache()` dedupes
 * repeat calls within one request (layout + page both calling getSession()
 * shouldn't mean two network round trips).
 */
export const getSession = cache(async (): Promise<SessionUser | null> => {
  const token = await getToken();
  if (!token) return null;

  try {
    const { user } = await apiFetch<{ user: SessionUser }>("/auth/session", { token });
    return user;
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) return null;
    // Backend unreachable/erroring: fail closed (treat as logged out) rather
    // than throwing on every page render.
    console.error("getSession: backend error, treating as signed out —", error);
    return null;
  }
});

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/** Use at the top of any Console page/layout — redirects non-operators to sign-in. */
export async function requireOperator(): Promise<SessionUser> {
  const user = await getSession();
  if (!user || (user.role !== "operator" && user.role !== "admin")) {
    redirect("/sign-in?redirectTo=/overview");
  }
  return user;
}

/** Use for pages that require any authenticated account (cart, orders, wishlist). */
export async function requireUser(redirectTo: string): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    redirect(`/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}
