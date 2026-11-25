"use client";

import { useEffect, useRef, useState } from "react";
import { withSession } from "@/lib/api/browser";
import { analysesApi, toErrorMessage } from "@/lib/api/client";
import type { Analysis, AnalysisStatus } from "@/lib/api/types";

const POLL_INTERVAL_MS = 1500;

export function isActive(status: AnalysisStatus): boolean {
  return status === "queued" || status === "processing";
}

/** Odpytuje API o analizę, dopóki jest w kolejce lub w toku. onSettled: raz, po zakończeniu. */
export function useAnalysisPolling(initial: Analysis | null, onSettled?: (analysis: Analysis) => void) {
  const [analysis, setAnalysis] = useState<Analysis | null>(initial);
  const [error, setError] = useState<string | null>(null);
  const onSettledRef = useRef(onSettled);

  useEffect(() => {
    onSettledRef.current = onSettled;
  });

  const activeId = analysis && isActive(analysis.status) ? analysis.id : null;

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const next = await withSession((token) => analysesApi.get(token, activeId));
        if (cancelled) return;
        setError(null);
        setAnalysis(next);
        if (!isActive(next.status)) {
          onSettledRef.current?.(next);
          return;
        }
      } catch (pollError) {
        if (!cancelled) setError(toErrorMessage(pollError));
      }
      if (!cancelled) timer = setTimeout(poll, POLL_INTERVAL_MS);
    };

    timer = setTimeout(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeId]);

  return { analysis, setAnalysis, error };
}

/** Sekundy od `since`, odświeżane co sekundę, dopóki `running`. */
export function useElapsedSeconds(since: number | null, running: boolean): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!running) return;
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, 1000);
    const first = setTimeout(tick, 0);
    return () => {
      clearInterval(timer);
      clearTimeout(first);
    };
  }, [running]);
  return since === null || now === 0 ? 0 : Math.max(0, (now - since) / 1000);
}
