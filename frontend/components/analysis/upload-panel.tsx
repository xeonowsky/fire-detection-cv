"use client";

import { Film, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { ProcessingPanel } from "@/components/analysis/processing-panel";
import { VerdictBadge } from "@/components/analysis/verdict-badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { isActive, useAnalysisPolling } from "@/hooks/use-analysis-polling";
import { RISK_LABELS, formatDuration, formatPercent } from "@/lib/analysis/format";
import {
  canPreview,
  durationError,
  formatFileSize,
  readVideoDuration,
  validateVideoFile,
} from "@/lib/analysis/video-file";
import { withSession } from "@/lib/api/browser";
import { toErrorMessage } from "@/lib/api/client";
import { uploadVideo } from "@/lib/api/upload";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";
import { ANALYSIS_LIMITS } from "@/lib/site";

const ACCEPT = [
  ...ANALYSIS_LIMITS.acceptedExtensions,
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
].join(",");

type SelectedVideo = { file: File; url: string; duration: number | null };

type Stage = { kind: "pick" } | { kind: "uploading"; ratio: number } | { kind: "sent"; startedAt: number };

function nameFromFile(file: File): string {
  return file.name.replace(/\.[^.]+$/, "");
}

export function UploadPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [video, setVideo] = useState<SelectedVideo | null>(null);
  const [name, setName] = useState("");
  const [stage, setStage] = useState<Stage>({ kind: "pick" });
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const { analysis, setAnalysis, error: pollError } = useAnalysisPolling(null, () => router.refresh());

  // Zwalnia adres podglądu po zmianie pliku i przy wyjściu ze strony.
  const videoUrl = video?.url;
  useEffect(
    () => () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    },
    [videoUrl],
  );

  const selectFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    const invalid = validateVideoFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }
    const url = URL.createObjectURL(file);
    setVideo({ file, url, duration: null });
    setName(nameFromFile(file));
    const duration = await readVideoDuration(url);
    setVideo((current) => (current?.url === url ? { ...current, duration } : current));
    setError(durationError(duration));
  };

  const clearFile = () => {
    setVideo(null);
    setName("");
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const startAnalysis = async () => {
    if (!video) return;
    setError(null);
    abortRef.current = new AbortController();
    setStage({ kind: "uploading", ratio: 0 });
    try {
      const sent = await withSession((token) =>
        uploadVideo({
          token,
          file: video.file,
          name: name.trim() || nameFromFile(video.file),
          onProgress: (ratio) => setStage({ kind: "uploading", ratio }),
          signal: abortRef.current?.signal,
        }),
      );
      setAnalysis(sent);
      setStage({ kind: "sent", startedAt: Date.now() });
    } catch (uploadError) {
      setStage({ kind: "pick" });
      if (!(uploadError instanceof DOMException && uploadError.name === "AbortError")) {
        setError(toErrorMessage(uploadError));
      }
    }
  };

  const startOver = () => {
    clearFile();
    setAnalysis(null);
    setStage({ kind: "pick" });
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    void selectFile(event.dataTransfer.files[0]);
  };

  if (stage.kind === "sent" && analysis && isActive(analysis.status)) {
    return <ProcessingPanel analysis={analysis} error={pollError} since={stage.startedAt} />;
  }

  if (stage.kind === "sent" && analysis) {
    const result = analysis.result;
    return (
      <Panel title={analysis.status === "done" ? "Analiza zakończona" : "Analiza nie powiodła się"}>
        {analysis.status === "done" && result ? (
          <dl className="grid gap-4 sm:grid-cols-4">
            <ResultItem label="Werdykt">
              <VerdictBadge verdict={result.verdict} />
            </ResultItem>
            <ResultItem label="Zagrożenie">{RISK_LABELS[result.risk_level]}</ResultItem>
            <ResultItem label="Pewność">{formatPercent(result.confidence)}</ResultItem>
            <ResultItem label="Pierwsza detekcja">{formatDuration(result.first_detection_s)}</ResultItem>
          </dl>
        ) : (
          <FormError message={analysis.error ?? "Analiza nie powiodła się. Spróbuj ponownie."} />
        )}
        <div className="flex flex-wrap gap-3 border-t border-line pt-5">
          {analysis.status === "done" ? (
            <ButtonLink href={ROUTES.analysis(analysis.id)} variant="dark">
              Zobacz wynik →
            </ButtonLink>
          ) : null}
          <Button variant="outline" onClick={startOver}>
            Wgraj kolejny film
          </Button>
        </div>
      </Panel>
    );
  }

  const uploading = stage.kind === "uploading";

  return (
    <Panel title="Wybierz nagranie" description="Przeciągnij plik albo wybierz go z dysku.">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => void selectFile(event.target.files?.[0])}
      />

      {!video ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            dragging ? "border-fire bg-fire-soft" : "border-line bg-paper hover:border-ink",
          )}
        >
          <span
            className={cn(
              "flex size-16 items-center justify-center rounded-full transition-colors",
              dragging ? "bg-fire text-ink" : "bg-ink text-fire",
            )}
          >
            <Upload className="size-7" aria-hidden="true" />
          </span>
          <span className="text-xl font-extrabold tracking-[-0.02em]">
            {dragging ? "Upuść, aby dodać film" : "Przeciągnij film tutaj"}
          </span>
          <span className="text-body">
            albo <span className="font-semibold text-fire-strong underline">wybierz z dysku</span>
          </span>
          <span className="font-mono text-xs text-muted">
            {ANALYSIS_LIMITS.acceptedFormats.join(" · ")} · do {ANALYSIS_LIMITS.maxDurationLabel} min · do{" "}
            {ANALYSIS_LIMITS.maxFileMegabytes} MB
          </span>
        </button>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid gap-5 sm:grid-cols-[260px_minmax(0,1fr)]">
            {canPreview(video.file) ? (
              <video
                src={video.url}
                controls
                muted
                playsInline
                className="aspect-video w-full rounded-xl bg-ink object-contain"
              />
            ) : (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl bg-ink text-muted-dark">
                <Film className="size-8 text-fire" aria-hidden="true" />
                <span className="px-4 text-center text-xs">Podgląd AVI niedostępny w przeglądarce</span>
              </div>
            )}
            <div className="flex min-w-0 flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold" title={video.file.name}>
                    {video.file.name}
                  </p>
                  <p className="font-mono text-xs text-muted">
                    {formatFileSize(video.file.size)} · {formatDuration(video.duration)}
                  </p>
                </div>
                {!uploading ? (
                  <button
                    type="button"
                    onClick={clearFile}
                    aria-label="Usuń wybrany plik"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-paper hover:text-ink"
                  >
                    <X className="size-5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
              <Field
                label="Nazwa analizy"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                disabled={uploading}
              />
            </div>
          </div>

          {uploading ? (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>Wysyłanie filmu…</span>
                <span className="font-mono">{Math.round(stage.ratio * 100)}%</span>
              </div>
              <ProgressBar value={stage.ratio * 100} label="Postęp wysyłania" tone="ink" />
            </div>
          ) : null}
        </div>
      )}

      <FormError message={error} />

      {video ? (
        <div className="flex flex-wrap gap-3 border-t border-line pt-5">
          {uploading ? (
            <Button variant="outline" onClick={() => abortRef.current?.abort()}>
              Anuluj wysyłanie
            </Button>
          ) : (
            <>
              <Button size="lg" onClick={startAnalysis} disabled={Boolean(error)}>
                Rozpocznij analizę →
              </Button>
              <Button variant="ghost" size="lg" onClick={() => inputRef.current?.click()}>
                Zmień plik
              </Button>
            </>
          )}
        </div>
      ) : null}
    </Panel>
  );
}

function ResultItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="font-mono text-xs text-muted uppercase">{label}</dt>
      <dd className="text-lg font-extrabold">{children}</dd>
    </div>
  );
}
