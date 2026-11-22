import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Wynik analizy" };

async function AnalysisContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <PageHeader eyebrow={`historia / analiza #${id}`} title="Wynik analizy" />
      <Placeholder step={5}>
        Status analizy (krok 4), a po zakończeniu: werdykt, odtwarzacz z nakładką na żywo, oś czasu i kluczowe
        klatki.
      </Placeholder>
    </>
  );
}

export default function AnalysisPage({ params }: PageProps<"/analyses/[id]">) {
  return (
    <Suspense fallback={<PageHeader title="Wynik analizy" />}>
      <AnalysisContent params={params} />
    </Suspense>
  );
}
