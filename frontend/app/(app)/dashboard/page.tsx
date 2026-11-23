import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";
import { ButtonLink } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Pulpit" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Pulpit"
        description="Statystyki i ostatnie analizy."
        actions={<ButtonLink href={ROUTES.newAnalysis}>+ Nowa analiza</ButtonLink>}
      />
      <Placeholder step={6}>Kafelki statystyk i lista ostatnich analiz.</Placeholder>
    </>
  );
}
