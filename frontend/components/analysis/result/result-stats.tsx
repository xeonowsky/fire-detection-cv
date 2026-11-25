import type { ReactNode } from "react";
import { VerdictBadge } from "@/components/analysis/verdict-badge";
import { Panel } from "@/components/ui/panel";
import {
  RISK_LABELS,
  formatCoverage,
  formatDuration,
  formatPercent,
  formatTimestamp,
} from "@/lib/analysis/format";
import type { AnalysisResult, RiskLevel } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const RISK_STYLES: Record<RiskLevel, string> = {
  low: "bg-ok-soft text-ok",
  medium: "bg-fire-soft text-fire-deep",
  high: "bg-fire text-ink",
};

type ResultStatsProps = {
  result: AnalysisResult;
  duration: number;
  onSeek: (seconds: number) => void;
};

export function ResultStats({ result, duration, onSeek }: ResultStatsProps) {
  const { detections_track: track } = result;

  return (
    <Panel title="Podsumowanie">
      <div className="flex items-center justify-between gap-3">
        <VerdictBadge verdict={result.verdict} />
        <span
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-extrabold uppercase",
            RISK_STYLES[result.risk_level],
          )}
        >
          zagrożenie {RISK_LABELS[result.risk_level]}
        </span>
      </div>

      <dl className="flex flex-col divide-y divide-line">
        <Row label="Pewność">{formatPercent(result.confidence)}</Row>
        <Row label="Pierwsza detekcja">
          {result.first_detection_s !== null ? (
            <button
              type="button"
              onClick={() => onSeek(result.first_detection_s ?? 0)}
              className="font-mono font-semibold text-fire-strong underline underline-offset-2"
            >
              {formatTimestamp(result.first_detection_s)} ▶
            </button>
          ) : (
            "—"
          )}
        </Row>
        <Row label="Klatki z ogniem">{formatPercent(result.fire_frame_ratio)}</Row>
        <Row label="Klatki z dymem">{formatPercent(result.smoke_frame_ratio)}</Row>
        {result.fire_coverage_max !== undefined ? (
          <Row label="Maks. ogień w kadrze">{formatCoverage(result.fire_coverage_max)}</Row>
        ) : null}
        {result.smoke_coverage_max !== undefined ? (
          <Row label="Maks. dym w kadrze">{formatCoverage(result.smoke_coverage_max)}</Row>
        ) : null}
        <Row label="Przeanalizowane klatki">
          {track.samples.length} · co {track.sample_interval_s.toFixed(1)} s
        </Row>
        <Row label="Długość filmu">{formatDuration(duration)}</Row>
      </dl>

      <div className="flex flex-col gap-2">
        <Ratio label="ogień" value={result.fire_frame_ratio} className="bg-fire" />
        <Ratio label="dym" value={result.smoke_frame_ratio} className="bg-muted" />
      </div>
    </Panel>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <dt className="text-body">{label}</dt>
      <dd className="font-mono font-semibold">{children}</dd>
    </div>
  );
}

function Ratio({ label, value, className }: { label: string; value: number; className: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs">
      <span className="w-12 text-muted">{label}</span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-line">
        <span
          className={cn("block h-full rounded-full", className)}
          style={{ width: formatPercent(value) }}
        />
      </span>
      <span className="w-10 text-right font-semibold">{formatPercent(value)}</span>
    </div>
  );
}
