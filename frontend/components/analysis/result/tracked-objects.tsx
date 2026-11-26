import { Panel } from "@/components/ui/panel";
import { DETECTION_LABELS, formatPercent, formatTimestamp } from "@/lib/analysis/format";
import type { TrackSummary } from "@/lib/analysis/detections";
import { cn } from "@/lib/cn";

type TrackedObjectsProps = {
  tracks: TrackSummary[];
  activeTrackIds: Set<number>;
  onSeek: (seconds: number) => void;
};

export function TrackedObjects({ tracks, activeTrackIds, onSeek }: TrackedObjectsProps) {
  return (
    <Panel
      title="Wykryte obiekty"
      description="Każdy obiekt śledzony między klatkami. Kliknij czas, aby przejść do tego momentu filmu."
    >
      {tracks.length === 0 ? (
        <p className="rounded-xl bg-paper p-5 text-sm text-body">
          Model nie wykrył ognia ani dymu na tym nagraniu.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="font-mono text-xs text-muted uppercase">
              <tr className="border-b border-line">
                <th className="py-2.5 pr-4 font-semibold">Obiekt</th>
                <th className="py-2.5 pr-4 font-semibold">Typ</th>
                <th className="py-2.5 pr-4 font-semibold">Widoczny</th>
                <th className="py-2.5 pr-4 font-semibold">Maks. pewność</th>
                <th className="py-2.5 font-semibold">Wystąpienia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {tracks.map((track) => (
                <tr key={track.trackId} className={cn(activeTrackIds.has(track.trackId) && "bg-fire-soft")}>
                  <td className="py-3 pr-4 font-mono font-semibold">#{track.trackId}</td>
                  <td className="py-3 pr-4">
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs font-extrabold uppercase",
                        track.label === "fire" ? "bg-fire text-ink" : "bg-ink text-cream",
                      )}
                    >
                      {DETECTION_LABELS[track.label]}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => onSeek(track.firstSeen)}
                      className="font-mono font-semibold text-fire-strong underline underline-offset-2"
                    >
                      {formatTimestamp(track.firstSeen)} – {formatTimestamp(track.lastSeen)}
                    </button>
                  </td>
                  <td className="py-3 pr-4 font-mono">{formatPercent(track.maxScore)}</td>
                  <td className="py-3 font-mono">{track.appearances}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
