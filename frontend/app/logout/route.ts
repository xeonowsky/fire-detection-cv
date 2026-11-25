import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { ROUTES } from "@/lib/routes";

// Komponent serwerowy nie może usunąć ciasteczka, więc po 401 z API przekierowuje tutaj.
export async function GET(request: NextRequest) {
  (await cookies()).delete(SESSION_COOKIE);
  return NextResponse.redirect(new URL(ROUTES.login, request.url));
}
