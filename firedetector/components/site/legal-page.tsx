import type { ReactNode } from "react";
import { Eyebrow } from "@/components/ui/typography";

type Section = { id: string; title: string; body: ReactNode };

type LegalPageProps = {
  eyebrow: string;
  title: ReactNode;
  updated: string;
  intro: ReactNode;
  sections: Section[];
};

const sectionNumber = (index: number) => String(index + 1).padStart(2, "0");

export function LegalPage({ eyebrow, title, updated, intro, sections }: LegalPageProps) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-8 pt-10 pb-24">
      <div className="mb-12 flex flex-col gap-4 border-b border-line pb-10">
        <Eyebrow>{eyebrow}</Eyebrow>
        {title}
        <p className="font-mono text-xs text-muted">Ostatnia aktualizacja: {updated}</p>
        <div className="max-w-[720px] text-lg leading-relaxed text-body">{intro}</div>
      </div>

      <div className="grid gap-12 md:grid-cols-[240px_minmax(0,1fr)]">
        <nav aria-label="Spis treści" className="md:sticky md:top-8 md:self-start">
          <ol className="flex list-none flex-col gap-1 p-0">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="flex gap-3 rounded-lg px-3 py-2 text-sm text-body no-underline hover:bg-white hover:text-ink"
                >
                  <span className="font-mono text-fire-strong">{sectionNumber(i)}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="flex max-w-[760px] flex-col gap-10">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-8">
              <h2 className="mb-3 flex gap-3 text-2xl font-extrabold tracking-[-0.03em]">
                <span className="font-mono text-fire">{sectionNumber(i)}</span>
                {s.title}
              </h2>
              <div className="flex flex-col gap-3 leading-relaxed text-body [&_li]:ml-5 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1.5">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

// Wyróżnia dane do uzupełnienia przed publikacją, np. nazwę administratora.
export function MissingInfo({ children }: { children: ReactNode }) {
  return (
    <mark className="rounded bg-fire-soft px-1 font-mono text-[0.9em] font-semibold text-fire-deep">
      [{children}]
    </mark>
  );
}
