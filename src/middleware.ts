import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/operators/session-token";

const PROTECTED = ["/desk", "/risk", "/orders", "/paper", "/blotter", "/audit", "/backtest"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!needsAuth) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (verifySession(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/enter";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/desk",
    "/desk/:path*",
    "/risk",
    "/risk/:path*",
    "/orders",
    "/orders/:path*",
    "/paper",
    "/paper/:path*",
    "/blotter",
    "/blotter/:path*",
    "/audit",
    "/audit/:path*",
    "/backtest",
    "/backtest/:path*",
  ],
};
