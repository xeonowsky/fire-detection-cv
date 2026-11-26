import type { Metadata } from "next";
import { Suspense } from "react";
import { DeleteAnalysisButton } from "@/components/analysis/result/delete-analysis-button";
import { AnalysisResult } from "@/components/analysis/result/analysis-result";
import { PageHeader } from "@/components/layout/page-header";
import { PageLoading } from "@/components/layout/page-loading";
import { ButtonLink } from "@/components/ui/button";
import { formatDateTime } from "@/lib/analysis/format";
import { getAnalysis } from "@/lib/api/server";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Wynik analizy" };

export default function AnalysisPage({ params }: PageProps<"/analyses/[id]">) {
  return (
    <Suspense fallback={<PageLoading />}>
      <AnalysisContent params={params} />
    </Suspense>
  );
}

async function AnalysisContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analysis = await getAnalysis(id);

  return (
    <>
      <PageHeader
        eyebrow={`analizy / ${formatDateTime(analysis.created_at)}`}
        title={analysis.name}
        actions={
          <>
            <DeleteAnalysisButton id={analysis.id} />
            <ButtonLink href={ROUTES.newAnalysis} variant="dark">
              + Nowa analiza
            </ButtonLink>
          </>
        }
      />
      <AnalysisResult initial={analysis} />
    </>
  );
}
