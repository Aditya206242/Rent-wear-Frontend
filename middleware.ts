import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  const secret = process.env.SESSION_SECRET;

  const isAuthenticated =
    !!token &&
    !!secret &&
    (await jwtVerify(token, new TextEncoder().encode(secret))
      .then(() => true)
      .catch(() => false));

  if (!isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Dashboard and browsing are public. Reserve this for future protected
  // actions (e.g. purchase/checkout) that require an authenticated session.
  matcher: ["/purchase/:path*", "/checkout/:path*"],
};
