import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/dashboard", "/meetings", "/meeting", "/settings"];
const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isAuthPath = authPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isProtected && !isAuthPath) {
    return NextResponse.next();
  }

  // Token is held in memory (Zustand); layout-level AuthGuard handles redirects.
  // Middleware passes through — cookie-based refresh may be added by backend later.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/meetings/:path*",
    "/meeting/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
