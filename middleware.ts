import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "loopwear_token";

/**
 * Fast-path only: bounces requests with no session cookie at all straight to
 * sign-in. It does NOT verify the token (we no longer self-sign JWTs — the
 * real backend does, see lib/auth/session.ts) and it does NOT check role.
 * Real authentication (is this token still valid?) and authorization (is
 * this user an operator?) happen server-side via getSession()/requireOperator()
 * in the relevant layouts, which actually ask the backend.
 */
export function middleware(request: NextRequest) {
  const hasToken = !!request.cookies.get(SESSION_COOKIE)?.value;

  if (!hasToken) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // The Concourse (operator console) additionally enforces role via
  // requireOperator() in app/(console)/layout.tsx — this matcher only
  // rules out the "not logged in at all" case before that check runs.
  matcher: [
    "/account/:path*",
    // /checkout is intentionally not gated here while its UI is being built
    // against local/dummy cart data (see CheckoutClient.tsx) instead of the
    // backend — add it back once checkout is wired to the real cart/session.
    "/orders/:path*",
    "/overview/:path*",
    "/operations/:path*",
    "/products/:path*",
    "/inventory/:path*",
    "/laundry/:path*",
    "/orders/:path*",
    "/customers/:path*",
    "/delivery/:path*",
    "/payments/:path*",
    "/analytics/:path*",
    "/notifications/:path*",
    "/settings/:path*",
  ],
};
