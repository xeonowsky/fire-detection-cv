"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { withSession } from "@/lib/api/browser";
import { analysesApi, toErrorMessage } from "@/lib/api/client";
import { ROUTES } from "@/lib/routes";

export function DeleteAnalysisButton({ id }: { id: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async () => {
    setPending(true);
    setError(null);
    try {
      await withSession((token) => analysesApi.remove(token, id));
      router.replace(ROUTES.dashboard);
      router.refresh();
    } catch (deleteError) {
      setError(toErrorMessage(deleteError));
      setPending(false);
    }
  };

  if (!confirming) {
    return (
      <Button variant="outline" onClick={() => setConfirming(true)}>
        Usuń analizę
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error ? <span className="text-sm font-semibold text-fire-deep">{error}</span> : null}
      <Button variant="danger" onClick={remove} disabled={pending}>
        {pending ? "Usuwanie…" : "Tak, usuń film i wynik"}
      </Button>
      <Button variant="ghost" onClick={() => setConfirming(false)} disabled={pending}>
        Anuluj
      </Button>
    </div>
  );
}
