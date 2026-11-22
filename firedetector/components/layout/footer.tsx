import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Badge, Eyebrow } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { FOOTER_COLUMNS, LEGAL_LINKS } from "@/lib/navigation";
import { SITE } from "@/lib/site";

type FooterProps = {
  variant?: "full" | "compact";
  className?: string;
};

export function Footer({ variant = "full", className }: FooterProps) {
  return variant === "compact" ? (
    <CompactFooter className={className} />
  ) : (
    <FullFooter className={className} />
  );
}

function Wordmark() {
  return (
    <span className="text-ink">
      <span className="font-normal">fire</span>
      <span className="font-extrabold">Detector</span>
    </span>
  );
}

function CompactFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-line bg-paper", className)}>
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-4 px-8 py-5 text-[13px] text-muted">
        <span>
          <Wordmark /> · ocena pożaru z nagrania
        </span>
        <nav aria-label="Stopka" className="flex flex-wrap gap-5">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted no-underline hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="font-mono text-xs">
          © {SITE.copyrightYear} · v{SITE.version}
        </span>
      </div>
    </footer>
  );
}

function FullFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t border-line bg-paper text-ink", className)}>
      <div className="mx-auto grid max-w-[1200px] gap-12 px-8 pt-16 pb-10 md:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-[320px] text-[15px] leading-relaxed text-body">{SITE.description}</p>
          <Badge className="text-xs">wizja komputerowa · klatka po klatce</Badge>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
            <Eyebrow>{column.title}</Eyebrow>
            {column.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[15px] font-medium text-ink no-underline transition-colors hover:text-fire-strong"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-8 py-5 font-mono text-xs text-muted">
          <span>
            © {SITE.copyrightYear} {SITE.name}. Wszelkie prawa zastrzeżone.
          </span>
          <span>{SITE.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
