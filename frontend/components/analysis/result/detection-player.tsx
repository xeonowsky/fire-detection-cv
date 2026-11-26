"use client";

import { useEffect, useState, type RefObject } from "react";
import { DETECTION_LABELS, formatCoverage, formatTimestamp } from "@/lib/analysis/format";
import { coverageAt, maxScoreAt, objectsAt } from "@/lib/analysis/detections";
import type { DetectedObject, DetectionTrack, RiskLevel } from "@/lib/api/types";
import { cn } from "@/lib/cn";

type DetectionPlayerProps = {
  src: string;
  name: string;
  track: DetectionTrack;
  riskLevel: RiskLevel;
  videoRef: RefObject<HTMLVideoElement | null>;
  currentTime: number;
  onTimeChange: (seconds: number) => void;
  onDurationChange: (seconds: number) => void;
  showBoxes: boolean;
  showLabels: boolean;
};

const DEFAULT_ASPECT = 16 / 9;

function formatScore(score: number | null): string {
  return score === null ? "—" : score.toFixed(2);
}

export function DetectionPlayer({
  src,
  name,
  track,
  riskLevel,
  videoRef,
  currentTime,
  onTimeChange,
  onDurationChange,
  showBoxes,
  showLabels,
}: DetectionPlayerProps) {
  const [aspect, setAspect] = useState(DEFAULT_ASPECT);
  const [playbackError, setPlaybackError] = useState(false);
  const objects = objectsAt(track, currentTime);
  const coverage = coverageAt(track, currentTime);

  // Podczas odtwarzania czas czytamy co klatkę ekranu, żeby ramki płynnie podążały za obrazem.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let frame = 0;
    const loop = () => {
      onTimeChange(video.currentTime);
      if (!video.paused && !video.ended) frame = requestAnimationFrame(loop);
    };
    const start = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(loop);
    };
    video.addEventListener("play", start);
    return () => {
      video.removeEventListener("play", start);
      cancelAnimationFrame(frame);
    };
  }, [videoRef, onTimeChange]);

  return (
    <div className="flex flex-col gap-3.5 rounded-[18px] bg-[rgb(6_6_6)] p-5 text-cream">
      <div className="flex flex-wrap justify-between gap-3 font-mono text-[12.5px]">
        <span className="truncate text-muted-dark">analiza / {name}</span>
        <span className={objects.length > 0 ? "text-fire" : "text-muted-dark"}>
          ● {objects.length > 0 ? `w kadrze: ${objects.length}` : "brak detekcji w kadrze"}
        </span>
      </div>

      <div
        className="relative w-full overflow-hidden rounded-[10px] bg-black"
        style={{ aspectRatio: aspect }}
      >
        <video
          ref={videoRef}
          src={src}
          controls
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full"
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            if (video.videoWidth && video.videoHeight) setAspect(video.videoWidth / video.videoHeight);
            if (Number.isFinite(video.duration)) onDurationChange(video.duration);
          }}
          onTimeUpdate={(event) => onTimeChange(event.currentTarget.currentTime)}
          onSeeked={(event) => onTimeChange(event.currentTarget.currentTime)}
          onError={() => setPlaybackError(true)}
        />

        {showBoxes ? (
          <div className="pointer-events-none absolute inset-0">
            {objects.map((object) => (
              <DetectionBox key={object.track_id} object={object} showLabel={showLabels} />
            ))}
          </div>
        ) : null}

        {coverage ? (
          <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-md bg-black/70 px-2 py-1 font-mono text-[11.5px] font-semibold text-cream">
            Ogień: <span className="text-fire">{formatCoverage(coverage.fire)}</span> | Dym:{" "}
            {formatCoverage(coverage.smoke)}
          </span>
        ) : null}

        {playbackError ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-muted-dark">
            Przeglądarka nie potrafi odtworzyć tego pliku. Wyniki analizy poniżej są kompletne.
          </div>
        ) : null}
      </div>

      <p className="font-mono text-xs text-muted-dark">
        t <span className="text-cream">{formatTimestamp(currentTime)}</span> · fire[
        <span className="text-fire">{formatScore(maxScoreAt(objects, "fire"))}</span>] · smoke[
        {formatScore(maxScoreAt(objects, "smoke"))}] · risk:{" "}
        <span className={riskLevel === "low" ? "text-cream" : "text-fire"}>{riskLevel.toUpperCase()}</span>
      </p>
    </div>
  );
}

function DetectionBox({ object, showLabel }: { object: DetectedObject; showLabel: boolean }) {
  const [x, y, width, height] = object.box;
  const fire = object.label === "fire";
  const labelInside = y < 0.08;

  return (
    <div
      className={cn(
        "absolute rounded-[5px]",
        fire ? "animate-firepulse" : "border-2 border-dashed border-cream/85 bg-white/5",
      )}
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${width * 100}%`,
        height: `${height * 100}%`,
      }}
    >
      {showLabel ? (
        <span
          className={cn(
            "absolute left-0 rounded-[5px] px-[7px] py-[3px] font-mono text-[11px] font-bold whitespace-nowrap text-ink",
            labelInside ? "top-1 left-1" : "-top-[24px] rounded-bl-none",
            fire ? "bg-fire" : "bg-cream",
          )}
        >
          {DETECTION_LABELS[object.label]} {Math.round(object.score * 100)}% · #{object.track_id}
        </span>
      ) : null}
    </div>
  );
}
