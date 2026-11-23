"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { APP_NAV } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";

const itemClass = "rounded-full px-3.5 py-2.5 text-sm no-underline transition-colors";

// „Historia” obejmuje też /analyses/[id], ale nie /analyses/new (osobna zakładka).
function isActive(pathname: string, href: string): boolean {
  if (href === ROUTES.analyses) {
    const isAnalysisDetail = pathname.startsWith(`${ROUTES.analyses}/`) && pathname !== ROUTES.newAnalysis;
    return pathname === ROUTES.analyses || isAnalysisDetail;
  }
  return pathname === href;
}

function NavList({ activeHref }: { activeHref?: string }) {
  return (
    <nav aria-label="Główna" className="flex flex-1 flex-wrap gap-1">
      {APP_NAV.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              itemClass,
              active ? "bg-paper font-bold text-ink" : "text-muted-dark hover:text-cream",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MainNav() {
  const pathname = usePathname();
  const activeHref = APP_NAV.find((item) => isActive(pathname, item.href))?.href;
  return <NavList activeHref={activeHref} />;
}

// Statyczna wersja na czas prerenderu, zanim usePathname zna ścieżkę (wymóg Cache Components).
export function MainNavFallback() {
  return <NavList />;
}
