import { Panel } from "@/components/ui/panel";
import { ANALYSIS_LIMITS } from "@/lib/site";

export function AnalysisLimits() {
  const rows = [
    { label: "Maks. długość filmu", value: `${ANALYSIS_LIMITS.maxDurationLabel} min` },
    { label: "Czas analizy", value: `do ${ANALYSIS_LIMITS.maxProcessingMinutes} min` },
    { label: "Formaty", value: ANALYSIS_LIMITS.acceptedFormats.join(", ") },
  ];

  return (
    <Panel title="Limity analizy">
      <dl className="flex flex-col divide-y divide-line">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4 py-2.5 text-sm">
            <dt className="text-body">{row.label}</dt>
            <dd className="font-mono font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
