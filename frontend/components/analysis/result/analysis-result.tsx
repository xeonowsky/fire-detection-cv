"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { ProcessingPanel } from "@/components/analysis/processing-panel";
import { DetectionPlayer } from "@/components/analysis/result/detection-player";
import { DetectionTimeline } from "@/components/analysis/result/detection-timeline";
import { ResultStats } from "@/components/analysis/result/result-stats";
import { TrackedObjects } from "@/components/analysis/result/tracked-objects";
import { EmergencyNotice } from "@/components/site/emergency-notice";
import { ButtonLink } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { Panel } from "@/components/ui/panel";
import { isActive, useAnalysisPolling } from "@/hooks/use-analysis-polling";
import { objectsAt, summarizeTracks, trackEnd } from "@/lib/analysis/detections";
import { apiAssetUrl } from "@/lib/api/client";
import type { Analysis, AnalysisResult as Result } from "@/lib/api/types";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

export function AnalysisResult({ initial }: { initial: Analysis }) {
  const router = useRouter();
  const { analysis, error } = useAnalysisPolling(initial, () => router.refresh());
  const current = analysis ?? initial;

  if (isActive(current.status)) return <ProcessingPanel analysis={current} error={error} />;

  if (current.status === "failed" || !current.result) {
    return (
      <Panel title="Analiza nie powiodła się">
        <FormError message={current.error ?? "Nie udało się przeanalizować filmu."} />
        <div>
          <ButtonLink href={ROUTES.newAnalysis} variant="dark">
            Wgraj film ponownie
          </ButtonLink>
        </div>
      </Panel>
    );
  }

  return <ResultView analysis={current} result={current.result} />;
}

function ResultView({ analysis, result }: { analysis: Analysis; result: Result }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const track = result.detections_track;
  const duration = videoDuration ?? analysis.duration_s ?? trackEnd(track);
  const tracks = useMemo(() => summarizeTracks(track), [track]);
  const activeTrackIds = new Set(objectsAt(track, currentTime).map((object) => object.track_id));

  const seek = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (video) video.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {result.verdict === "fire" ? <EmergencyNotice title="Na nagraniu wykryto ogień." /> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-4">
          <DetectionPlayer
            src={apiAssetUrl(analysis.video_url)}
            name={analysis.name}
            track={track}
            riskLevel={result.risk_level}
            videoRef={videoRef}
            currentTime={currentTime}
            onTimeChange={setCurrentTime}
            onDurationChange={setVideoDuration}
            showBoxes={showBoxes}
            showLabels={showLabels}
          />
          <div className="flex flex-wrap gap-2">
            <Toggle pressed={showBoxes} onChange={setShowBoxes}>
              Ramki detekcji
            </Toggle>
            <Toggle pressed={showLabels} onChange={setShowLabels} disabled={!showBoxes}>
              Etykiety
            </Toggle>
          </div>
          <DetectionTimeline
            track={track}
            duration={duration}
            currentTime={currentTime}
            firstDetection={result.first_detection_s}
            onSeek={seek}
          />
        </div>
        <ResultStats result={result} duration={duration} onSeek={seek} />
      </div>

      <TrackedObjects tracks={tracks} activeTrackIds={activeTrackIds} onSeek={seek} />
    </div>
  );
}

type ToggleProps = {
  pressed: boolean;
  onChange: (pressed: boolean) => void;
  disabled?: boolean;
  children: ReactNode;
};

function Toggle({ pressed, onChange, disabled, children }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={() => onChange(!pressed)}
      className={cn(
        "flex items-center gap-2 rounded-full border-2 px-3.5 py-1.5 text-sm font-semibold transition-colors disabled:opacity-40",
        pressed ? "border-ink bg-ink text-cream" : "border-line bg-white text-body hover:border-ink",
      )}
    >
      <span className={cn("size-2 rounded-full", pressed ? "bg-fire" : "bg-line")} />
      {children}
    </button>
  );
}
