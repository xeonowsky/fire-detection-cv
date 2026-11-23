import { TriangleAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatDateTime, formatDuration, formatPercent, RISK_LABELS } from "@/lib/analysis/format";
import type { Analysis } from "@/lib/api/types";
import { ROUTES } from "@/lib/routes";

export function LatestAlert({ analysis }: { analysis: Analysis | undefined }) {
  if (!analysis?.result) return null;

  const { result } = analysis;
  return (
    <div className="flex flex-wrap items-center gap-5 rounded-[20px] border-2 border-ink bg-white p-6">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ink text-fire">
        <TriangleAlert className="size-6" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-[1_1_280px] flex-col gap-1">
        <span className="font-mono text-xs font-semibold text-fire-strong">
          OSTATNI ALARM · {formatDateTime(analysis.created_at)}
        </span>
        <p className="text-xl font-extrabold tracking-[-0.02em]">Pożar — {analysis.name}</p>
        <p className="text-sm text-body">
          Pewność {formatPercent(result.confidence)} · zagrożenie {RISK_LABELS[result.risk_level]}
          {result.first_detection_s !== null ? ` · ogień od ${formatDuration(result.first_detection_s)}` : ""}
        </p>
      </div>
      <ButtonLink href={ROUTES.analysis(analysis.id)} variant="dark">
        Otwórz analizę{" "}
        <span aria-hidden="true" className="text-fire">
          →
        </span>
      </ButtonLink>
    </div>
  );
}
