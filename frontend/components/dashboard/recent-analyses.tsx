import Link from "next/link";
import { StatusBadge } from "@/components/analysis/status-badge";
import { VerdictBadge } from "@/components/analysis/verdict-badge";
import { Panel } from "@/components/ui/panel";
import { formatDateTime, formatDuration } from "@/lib/analysis/format";
import type { Analysis } from "@/lib/api/types";
import { ROUTES } from "@/lib/routes";

export function RecentAnalyses({ analyses }: { analyses: Analysis[] }) {
  return (
    <Panel
      title="Ostatnie analizy"
      action={
        <Link href={ROUTES.analyses} className="text-sm font-bold text-fire-strong">
          Zobacz wszystkie →
        </Link>
      }
    >
      {analyses.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[620px] border-separate border-spacing-y-1 text-left">
            <thead className="font-mono text-xs text-muted">
              <tr>
                <th className="px-2 pb-1 font-medium">NAGRANIE</th>
                <th className="px-2 pb-1 font-medium">DŁUGOŚĆ</th>
                <th className="px-2 pb-1 font-medium">STATUS</th>
                <th className="px-2 pb-1 font-medium">WERDYKT</th>
                <th className="px-2 pb-1">
                  <span className="sr-only">Akcje</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((analysis) => (
                <tr key={analysis.id} className="group">
                  <td className="rounded-l-xl bg-paper px-3 py-3 group-hover:bg-fire-soft">
                    <Link href={ROUTES.analysis(analysis.id)} className="font-semibold text-ink no-underline">
                      {analysis.name}
                    </Link>
                    <div className="font-mono text-xs text-muted">{formatDateTime(analysis.created_at)}</div>
                  </td>
                  <td className="bg-paper px-2 py-3 font-mono text-sm text-body group-hover:bg-fire-soft">
                    {formatDuration(analysis.duration_s)}
                  </td>
                  <td className="bg-paper px-2 py-3 group-hover:bg-fire-soft">
                    <StatusBadge status={analysis.status} progress={analysis.progress} />
                  </td>
                  <td className="bg-paper px-2 py-3 group-hover:bg-fire-soft">
                    <VerdictBadge verdict={analysis.result?.verdict ?? null} />
                  </td>
                  <td className="rounded-r-xl bg-paper px-3 py-3 text-right group-hover:bg-fire-soft">
                    <Link
                      href={ROUTES.analysis(analysis.id)}
                      aria-label={`Otwórz analizę ${analysis.name}`}
                      className="font-bold text-fire-strong no-underline"
                    >
                      →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-line px-6 py-10 text-center">
      <p className="font-extrabold">Nie masz jeszcze żadnych analiz</p>
      <p className="max-w-sm text-sm text-body">Wgraj pierwsze nagranie, a wynik pojawi się tutaj.</p>
      <Link href={ROUTES.newAnalysis} className="font-bold text-fire-strong">
        Wgraj film →
      </Link>
    </div>
  );
}
