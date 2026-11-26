import type { AnalysisStatus, DetectionLabel, RiskLevel, Verdict } from "@/lib/api/types";

const dateTimeFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Warsaw",
});

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

/** 135 → "02:15" */
export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  return `${String(minutes).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** 12.43 → "00:12.4" — czas z dokładnością do dziesiątej sekundy (oś czasu, odtwarzacz). */
export function formatTimestamp(seconds: number): string {
  const tenths = Math.max(0, Math.round(seconds * 10));
  const minutes = Math.floor(tenths / 600);
  const rest = (tenths % 600) / 10;
  return `${String(minutes).padStart(2, "0")}:${rest.toFixed(1).padStart(4, "0")}`;
}

/** 0.0861 → "8.6%" — część kadru, z jednym miejscem po przecinku jak w nakładce modelu. */
export function formatCoverage(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}

export const STATUS_LABELS: Record<AnalysisStatus, string> = {
  queued: "W kolejce",
  processing: "W toku",
  done: "Gotowe",
  failed: "Błąd",
};

export const VERDICT_LABELS: Record<Verdict, string> = {
  fire: "Pożar",
  smoke: "Dym",
  none: "Czysto",
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "niskie",
  medium: "średnie",
  high: "wysokie",
};

export const DETECTION_LABELS: Record<DetectionLabel, string> = {
  fire: "ogień",
  smoke: "dym",
};
