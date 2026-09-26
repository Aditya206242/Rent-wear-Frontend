import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "loopwear_token";

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

  matcher: [
    "/account/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/overview/:path*",
    "/operations/:path*",
    "/products/:path*",
    "/inventory/:path*",
    "/laundry/:path*",
    "/customers/:path*",
    "/delivery/:path*",
    "/payments/:path*",
    "/analytics/:path*",
    "/notifications/:path*",
    "/settings/:path*",
  ],
};
