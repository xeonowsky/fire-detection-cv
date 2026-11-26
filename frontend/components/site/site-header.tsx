import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { MobileMenu } from "@/components/site/mobile-menu";
import { hasSession } from "@/lib/auth/server";
import { SITE_NAV } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-7 px-5 py-5 md:px-8">
      <Logo className="relative z-50" />

      {/* Desktop */}
      <nav aria-label="Strona" className="hidden flex-1 justify-center gap-1.5 text-sm font-medium md:flex">
        {SITE_NAV.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-2.5 whitespace-nowrap text-ink no-underline hover:text-fire-strong"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="hidden items-center gap-2 md:flex">
        <Suspense fallback={<div aria-hidden className="h-9 w-[220px]" />}>
          <HeaderActions layout="inline" />
        </Suspense>
      </div>

      {/* Mobile */}
      <MobileMenu
        links={SITE_NAV}
        actions={
          <Suspense fallback={<div aria-hidden className="h-[116px]" />}>
            <HeaderActions layout="stacked" />
          </Suspense>
        }
      />
    </header>
  );
}

async function HeaderActions({ layout }: { layout: "inline" | "stacked" }) {
  const stacked = layout === "stacked";
  const size = stacked ? "lg" : "sm";
  const width = stacked ? "w-full" : undefined;

  if (await hasSession()) {
    return (
      <ButtonLink href={ROUTES.dashboard} variant="dark" size={size} className={width}>
        Przejdź do pulpitu
      </ButtonLink>
    );
  }

  return (
    <>
      {stacked && (
        <ButtonLink href={ROUTES.register} variant="dark" size={size} className={width}>
          Załóż konto
        </ButtonLink>
      )}
      <ButtonLink
        href={ROUTES.login}
        variant={stacked ? "outline" : "ghost"}
        size={size}
        className={stacked ? width : "text-ink"}
      >
        Zaloguj się
      </ButtonLink>
      {!stacked && (
        <ButtonLink href={ROUTES.register} variant="dark" size={size}>
          Załóż konto
        </ButtonLink>
      )}
    </>
  );
}
