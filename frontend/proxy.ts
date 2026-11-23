import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { ROUTES, isGuestOnlyPath, isProtectedPath } from "@/lib/routes";

// Sprawdza tylko obecność ciasteczka (szybkie przekierowanie); właściwą autoryzację robi API.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestOnlyPath(pathname) && hasSession) {
    return NextResponse.redirect(new URL(ROUTES.dashboard, request.url));
  }

  return NextResponse.next();
}

// Matcher jest analizowany przy buildzie i musi być literałem, dlatego nie używa ROUTES.
export const config = {
  matcher: ["/dashboard/:path*", "/analyses/:path*", "/settings/:path*", "/login", "/register"],
};
