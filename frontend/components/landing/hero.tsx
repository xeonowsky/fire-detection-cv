import { AnalysisPreview } from "@/components/landing/analysis-preview";
import { ButtonLink } from "@/components/ui/button";
import { Badge, DisplayHeading } from "@/components/ui/typography";
import { ROUTES } from "@/lib/routes";

export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-14 px-8 pt-16 pb-24">
      <div className="flex flex-[1_1_480px] flex-col gap-6">
        <Badge>wizja komputerowa · klatka po klatce</Badge>
        <DisplayHeading lead="Wgraj film." accent="Zobacz ogień." size="xl" breakBeforeAccent />
        <p className="max-w-[500px] text-lg leading-relaxed font-medium text-body">
          fireDetector zaznacza ogień i dym w każdej klatce nagrania. Dostajesz werdykt, poziom zagrożenia i
          odtwarzacz z detekcjami na żywo.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={ROUTES.newAnalysis} size="lg">
            Przeanalizuj film →
          </ButtonLink>
          <ButtonLink href={ROUTES.howItWorks} variant="outline" size="lg">
            Jak to działa?
          </ButtonLink>
        </div>
      </div>

      <AnalysisPreview />
    </section>
  );
}
