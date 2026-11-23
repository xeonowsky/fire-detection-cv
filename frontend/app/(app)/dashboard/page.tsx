import type { Metadata } from "next";
import { AnalysisLimits } from "@/components/dashboard/analysis-limits";
import { LatestAlert } from "@/components/dashboard/latest-alert";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentAnalyses } from "@/components/dashboard/recent-analyses";
import { StatTiles } from "@/components/dashboard/stat-tiles";
import { ButtonLink } from "@/components/ui/button";
import { DisplayHeading } from "@/components/ui/typography";
import { findLatestFire, summarizeAnalyses } from "@/lib/analysis/stats";
import { DEMO_ANALYSES, DEMO_USER } from "@/lib/demo-data";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Pulpit" };

const RECENT_LIMIT = 5;

function summaryLine(total: number, inProgress: number): string {
  if (total === 0) return "Wgraj pierwsze nagranie, a tu pojawią się statystyki i wyniki.";
  if (inProgress === 0) return "Wszystkie analizy są zakończone.";
  return `${inProgress} ${inProgress === 1 ? "analiza jest" : "analizy są"} w toku.`;
}

export default function DashboardPage() {
  const analyses = DEMO_ANALYSES;
  const stats = summarizeAnalyses(analyses);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-mono text-[12.5px] text-muted">pulpit</span>
          <DisplayHeading lead="Cześć," accent={`${DEMO_USER.name}.`} size="md" />
          <p className="text-body">{summaryLine(stats.total, stats.inProgress)}</p>
        </div>
        <ButtonLink href={ROUTES.newAnalysis} size="lg">
          + Nowa analiza
        </ButtonLink>
      </div>

      <StatTiles stats={stats} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-6">
          <LatestAlert analysis={findLatestFire(analyses)} />
          <RecentAnalyses analyses={analyses.slice(0, RECENT_LIMIT)} />
        </div>
        <aside className="flex flex-col gap-6">
          <QuickActions />
          <AnalysisLimits />
        </aside>
      </div>
    </>
  );
}
