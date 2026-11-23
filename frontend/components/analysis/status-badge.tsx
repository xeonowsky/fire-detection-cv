import { STATUS_LABELS } from "@/lib/analysis/format";
import type { AnalysisStatus } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const styles: Record<AnalysisStatus, string> = {
  queued: "border border-ink/30 text-ink",
  processing: "bg-ink text-white",
  done: "bg-ok-soft text-ok",
  failed: "bg-fire-soft text-fire-deep",
};

export function StatusBadge({ status, progress }: { status: AnalysisStatus; progress?: number }) {
  const label =
    status === "processing" && progress !== undefined ? `Analiza ${progress}%` : STATUS_LABELS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs font-semibold whitespace-nowrap",
        styles[status],
      )}
    >
      {status === "processing" ? <span className="size-1.5 animate-pulse rounded-full bg-fire" /> : null}
      {label}
    </span>
  );
}
