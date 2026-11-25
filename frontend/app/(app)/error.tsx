"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";
import { Button } from "@/components/ui/button";
import { DisplayHeading } from "@/components/ui/typography";

type ErrorPageProps = { error: Error & { digest?: string }; reset: () => void };

// Najczęstsza przyczyna w części po zalogowaniu: API nie odpowiada.
export default function AppErrorPage({ reset }: ErrorPageProps) {
  const router = useRouter();

  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-24 text-center">
      <span className="font-mono text-sm font-semibold text-fire-strong">BRAK DANYCH</span>
      <DisplayHeading lead="Nie udało się" accent="pobrać danych." size="md" />
      <p className="max-w-md text-body">
        Serwer API nie odpowiada. Sprawdź, czy backend działa (
        <code className="font-mono">docker compose up</code>), i spróbuj ponownie.
      </p>
      <Button onClick={retry}>Spróbuj ponownie</Button>
    </div>
  );
}
