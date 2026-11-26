import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Badge, Eyebrow } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { FOOTER_COLUMNS } from "@/lib/navigation";
import { SITE } from "@/lib/site";

export function Footer({ className }: { className?: string }) {
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
