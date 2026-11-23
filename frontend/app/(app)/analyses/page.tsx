import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Historia analiz" };

export default function AnalysesPage() {
  return (
    <>
      <PageHeader title="Historia analiz" description="Wszystkie Twoje nagrania i wyniki." />
      <Placeholder step={6}>Tabela analiz z filtrami, wyszukiwaniem i paginacją.</Placeholder>
    </>
  );
}
