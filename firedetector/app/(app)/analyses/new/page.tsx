import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";
import { ANALYSIS_LIMITS } from "@/lib/site";

export const metadata: Metadata = { title: "Nowa analiza" };

export default function NewAnalysisPage() {
  return (
    <>
      <PageHeader
        title="Nowa analiza"
        description={`Wgraj nagranie do ${ANALYSIS_LIMITS.maxDurationLabel} min. Analiza trwa maksymalnie ${ANALYSIS_LIMITS.maxProcessingMinutes} minuty.`}
      />
      <Placeholder step={4}>Drag &amp; drop filmu, walidacja długości, pasek postępu wysyłania.</Placeholder>
    </>
  );
}
