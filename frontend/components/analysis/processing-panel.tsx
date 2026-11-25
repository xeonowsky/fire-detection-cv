"use client";

import { FormError } from "@/components/ui/form-error";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useElapsedSeconds } from "@/hooks/use-analysis-polling";
import { STATUS_LABELS, formatDuration } from "@/lib/analysis/format";
import type { Analysis } from "@/lib/api/types";
import { ANALYSIS_LIMITS } from "@/lib/site";

type ProcessingPanelProps = {
  analysis: Analysis;
  error: string | null;
  /** Znacznik czasu startu (ms) do licznika; null ukrywa licznik. */
  since?: number | null;
};

export function ProcessingPanel({ analysis, error, since = null }: ProcessingPanelProps) {
  const elapsed = useElapsedSeconds(since, true);

  return (
    <Panel title="Analiza w toku" description={analysis.name}>
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-semibold">
            {analysis.status === "queued" ? STATUS_LABELS.queued : "Model analizuje klatki filmu…"}
          </span>
          <span className="font-mono text-2xl font-bold">{analysis.progress}%</span>
        </div>
        <ProgressBar value={analysis.progress} label="Postęp analizy" />
        <p className="font-mono text-xs text-muted">
          {since !== null ? `czas: ${formatDuration(elapsed)} · ` : ""}limit{" "}
          {ANALYSIS_LIMITS.maxProcessingMinutes} min
        </p>
      </div>
      <FormError message={error} />
      <p className="text-sm text-body">
        Możesz opuścić tę stronę — analiza działa dalej, a wynik pojawi się na pulpicie.
      </p>
    </Panel>
  );
}
