import type { ReactNode } from "react";

/** Przycisk zapisu z komunikatem obok, np. „✓ Zapisano”. */
export function FormFooter({ message, children }: { message: string | null; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
      {children}
      <p role="status" aria-live="polite" className="text-sm font-semibold text-ok">
        {message ? `✓ ${message}` : ""}
      </p>
    </div>
  );
}
