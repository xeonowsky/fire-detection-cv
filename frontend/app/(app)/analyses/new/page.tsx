import type { Metadata } from "next";
import { UploadPanel } from "@/components/analysis/upload-panel";
import { AnalysisLimits } from "@/components/dashboard/analysis-limits";
import { PageHeader } from "@/components/layout/page-header";
import { Panel } from "@/components/ui/panel";
import { ANALYSIS_LIMITS } from "@/lib/site";

export const metadata: Metadata = { title: "Nowa analiza" };

const TIPS = [
  "Nagranie poziome i ustabilizowane daje najlepsze wyniki.",
  "Ogień i dym powinny być widoczne w kadrze, nie tylko odbicia światła.",
  "Krótszy fragment z samym zdarzeniem analizuje się dokładniej niż długi film.",
];

export default function NewAnalysisPage() {
  return (
    <>
      <PageHeader
        eyebrow="analizy / nowa"
        title="Nowa analiza"
        description={`Wgraj nagranie do ${ANALYSIS_LIMITS.maxDurationLabel} min. Analiza trwa maksymalnie ${ANALYSIS_LIMITS.maxProcessingMinutes} minuty.`}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <UploadPanel />
        <aside className="flex flex-col gap-6">
          <AnalysisLimits />
          <Panel title="Wskazówki">
            <ul className="flex list-disc flex-col gap-2 pl-5 text-sm text-body">
              {TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </Panel>
        </aside>
      </div>
    </>
  );
}
