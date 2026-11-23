import { VERDICT_LABELS } from "@/lib/analysis/format";
import type { Verdict } from "@/lib/api/types";
import { cn } from "@/lib/cn";

const styles: Record<Verdict, string> = {
  fire: "bg-fire text-ink",
  smoke: "bg-ink text-cream",
  none: "border border-line bg-white text-body",
};

export function VerdictBadge({ verdict }: { verdict: Verdict | null }) {
  if (verdict === null) {
    return <span className="font-mono text-xs text-muted">—</span>;
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2.5 py-1 text-xs font-extrabold tracking-wide uppercase",
        styles[verdict],
      )}
    >
      {VERDICT_LABELS[verdict]}
    </span>
  );
}
