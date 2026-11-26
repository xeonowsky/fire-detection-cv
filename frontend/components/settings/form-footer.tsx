import type { ReactNode } from "react";

type FormFooterProps = {
  message: string | null;
  error?: string | null;
  children: ReactNode;
};

/** Przycisk zapisu z komunikatem obok: „✓ Zapisano” albo błąd z serwera. */
export function FormFooter({ message, error, children }: FormFooterProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
      {children}
      {error ? (
        <p role="alert" className="text-sm font-semibold text-fire-deep">
          {error}
        </p>
      ) : (
        <p role="status" aria-live="polite" className="text-sm font-semibold text-ok">
          {message ? `✓ ${message}` : ""}
        </p>
      )}
    </div>
  );
}
