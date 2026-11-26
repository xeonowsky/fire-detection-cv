export const ROUTES = {
  home: "/",
  howItWorks: "/#jak",
  login: "/login",
  register: "/register",
  logout: "/logout",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  analyses: "/analyses",
  newAnalysis: "/analyses/new",
  analysis: (id: string) => `/analyses/${encodeURIComponent(id)}`,
  settings: "/settings",
  terms: "/terms",
  privacy: "/privacy",
  contact: "/contact",
} as const;

export const PROTECTED_ROUTES = [ROUTES.dashboard, ROUTES.analyses, ROUTES.settings] as const;

export const GUEST_ONLY_ROUTES = [ROUTES.login, ROUTES.register] as const;

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function isGuestOnlyPath(pathname: string): boolean {
  return (GUEST_ONLY_ROUTES as readonly string[]).includes(pathname);
}

// Tylko ścieżki wewnętrzne: parametr ?next= nie może przekierować na obcą domenę (open redirect).
export function safeRedirectPath(next: string | null, fallback: string = ROUTES.dashboard): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
