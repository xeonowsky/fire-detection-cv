"use client";

import { Button } from "@/components/ui/button";
import { DisplayHeading } from "@/components/ui/typography";

type ErrorPageProps = { error: Error & { digest?: string }; reset: () => void };

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-24 text-center">
      <span className="font-mono text-sm font-semibold text-fire-strong">BŁĄD</span>
      <DisplayHeading lead="Coś poszło" accent="nie tak." size="md" />
      <p className="max-w-md text-body">Spróbuj ponownie. Jeśli błąd się powtarza, odśwież stronę.</p>
      <Button onClick={reset}>Spróbuj ponownie</Button>
    </main>
  );
}
