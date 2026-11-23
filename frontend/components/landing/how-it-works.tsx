import { ProcessPath } from "@/components/landing/process-path";
import { DisplayHeading, Eyebrow } from "@/components/ui/typography";

export function HowItWorks() {
  return (
    <section id="jak" className="scroll-mt-4 bg-ink text-cream">
      <div className="mx-auto max-w-[1200px] px-8 py-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <DisplayHeading
            as="h2"
            size="md"
            lead="Od nagrania do werdyktu"
            accent="w czterech krokach."
            className="max-w-[640px] tracking-[-0.04em]"
          />
          <Eyebrow tone="dark">Jak to działa</Eyebrow>
        </div>
        <ProcessPath />
      </div>
    </section>
  );
}
