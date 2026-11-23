import type { AnalysisStatus, RiskLevel, Verdict } from "@/lib/api/types";

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
