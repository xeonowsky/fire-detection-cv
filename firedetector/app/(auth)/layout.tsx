import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Ticker } from "@/components/layout/ticker";
import { DisplayHeading } from "@/components/ui/typography";
import { ANALYSIS_LIMITS, SITE } from "@/lib/site";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-wrap bg-paper">
      <section className="flex flex-[1_1_480px] flex-col px-12 py-8">
        <Logo />
        <main className="flex flex-1 items-center justify-center py-10">{children}</main>
        <p className="font-mono text-xs text-muted">
          © {SITE.copyrightYear} {SITE.name}
        </p>
      </section>

      <aside className="flex flex-[1_1_560px] flex-col justify-center gap-7 overflow-hidden bg-ink px-12 pt-12 text-cream">
        <DisplayHeading
          as="h2"
          lead="Każda klatka sprawdzona."
          accent="Każdy płomień zaznaczony."
          className="max-w-[520px] text-4xl leading-[1.05] tracking-[-0.04em]"
        />
        <p className="max-w-[460px] text-muted-dark">
          Wgraj nagranie do {ANALYSIS_LIMITS.maxDurationLabel} min, a w ciągu{" "}
          {ANALYSIS_LIMITS.maxProcessingMinutes} minut dostaniesz werdykt i odtwarzacz z detekcjami.
        </p>
        <Ticker className="-mx-12 mt-auto border-t border-[#1a1a1a]" />
      </aside>
    </div>
  );
}
