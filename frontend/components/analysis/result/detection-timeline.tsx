"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { formatTimestamp } from "@/lib/analysis/format";
import { labelRanges, type TimeRange } from "@/lib/analysis/detections";
import type { DetectionTrack } from "@/lib/api/types";
import { cn } from "@/lib/cn";

type DetectionTimelineProps = {
  track: DetectionTrack;
  duration: number;
  currentTime: number;
  firstDetection: number | null;
  onSeek: (seconds: number) => void;
};

const KEYBOARD_STEP_S = 5;

export function DetectionTimeline({
  track,
  duration,
  currentTime,
  firstDetection,
  onSeek,
}: DetectionTimelineProps) {
  const percent = (seconds: number) => `${Math.min(100, Math.max(0, (seconds / duration) * 100))}%`;

  const seekFromPointer = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onSeek(((event.clientX - rect.left) / rect.width) * duration);
  };

  const seekFromKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = { ArrowRight: KEYBOARD_STEP_S, ArrowLeft: -KEYBOARD_STEP_S };
    if (event.key in steps) {
      event.preventDefault();
      onSeek(Math.min(duration, Math.max(0, currentTime + steps[event.key])));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="font-semibold">Oś czasu detekcji</span>
        <span className="flex gap-4 font-mono text-xs text-muted">
          <Legend className="bg-fire">ogień</Legend>
          <Legend className="bg-muted">dym</Legend>
        </span>
      </div>

      <div
        role="slider"
        tabIndex={0}
        aria-label="Oś czasu detekcji — kliknij, aby przewinąć film"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={formatTimestamp(currentTime)}
        onClick={seekFromPointer}
        onKeyDown={seekFromKeyboard}
        className="relative h-14 cursor-pointer overflow-hidden rounded-xl bg-surface-dark focus-visible:ring-4 focus-visible:ring-fire/30 focus-visible:outline-none"
      >
        <Lane ranges={labelRanges(track, "fire")} className="top-2 bg-fire" percent={percent} />
        <Lane ranges={labelRanges(track, "smoke")} className="bottom-2 bg-muted" percent={percent} />
        {firstDetection !== null ? (
          <span
            title={`Pierwsza detekcja ${formatTimestamp(firstDetection)}`}
            className="absolute top-0 h-full w-px bg-fire-hover/70"
            style={{ left: percent(firstDetection) }}
          />
        ) : null}
        <span
          aria-hidden="true"
          className="absolute top-0 h-full w-0.5 -translate-x-1/2 bg-cream shadow-[0_0_8px_rgb(255_255_255/0.6)]"
          style={{ left: percent(currentTime) }}
        />
      </div>

      <div className="flex justify-between font-mono text-xs text-muted">
        <span>{formatTimestamp(0)}</span>
        <span>{formatTimestamp(duration)}</span>
      </div>
    </div>
  );
}

function Lane({
  ranges,
  className,
  percent,
}: {
  ranges: TimeRange[];
  className: string;
  percent: (seconds: number) => string;
}) {
  return ranges.map((range) => (
    <span
      key={range.start}
      className={cn("absolute h-[18px] rounded-[4px]", className)}
      style={{ left: percent(range.start), width: `calc(${percent(range.end)} - ${percent(range.start)})` }}
    />
  ));
}

function Legend({ className, children }: { className: string; children: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-2.5 rounded-sm", className)} />
      {children}
    </span>
  );
}
