import type { ReactNode } from "react";

export function Placeholder({ step, children }: { step: number; children: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-line bg-white p-8 text-body">
      <span className="mb-2 block font-mono text-xs font-semibold text-fire-strong">
        KROK {step} · W BUDOWIE
      </span>
      {children}
    </div>
  );
}
