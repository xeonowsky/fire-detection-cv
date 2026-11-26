import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth/constants";

// Odczyt ciasteczka w komponentach serwerowych. Przy cacheComponents wywołujący musi być w <Suspense>.
export async function getServerToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value || null;
}

export async function hasSession(): Promise<boolean> {
  return (await getServerToken()) !== null;
}
