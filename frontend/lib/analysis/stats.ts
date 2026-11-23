import type { Analysis } from "@/lib/api/types";

export type AnalysisStats = {
  total: number;
  fires: number;
  smokeOnly: number;
  inProgress: number;
};

export function summarizeAnalyses(analyses: Analysis[]): AnalysisStats {
  return {
    total: analyses.length,
    fires: analyses.filter((a) => a.result?.verdict === "fire").length,
    smokeOnly: analyses.filter((a) => a.result?.verdict === "smoke").length,
    inProgress: analyses.filter((a) => a.status === "queued" || a.status === "processing").length,
  };
}

/** Najnowsza zakończona analiza, w której wykryto ogień. */
export function findLatestFire(analyses: Analysis[]): Analysis | undefined {
  return analyses
    .filter((a) => a.result?.verdict === "fire")
    .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}
