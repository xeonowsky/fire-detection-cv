import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { SITE_NAV } from "@/lib/navigation";
import { ROUTES } from "@/lib/routes";

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-7 px-8 py-5">
      <Logo />
      <nav aria-label="Strona" className="flex flex-1 justify-center gap-1.5 text-sm font-medium">
        {SITE_NAV.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-2.5 text-ink no-underline hover:text-fire-strong"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <ButtonLink href={ROUTES.login} variant="ghost" size="sm" className="text-ink">
        Zaloguj się
      </ButtonLink>
      <ButtonLink href={ROUTES.register} variant="dark" size="sm">
        Załóż konto
      </ButtonLink>
    </header>
  );
}
