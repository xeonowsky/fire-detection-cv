"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useFlash } from "@/hooks/use-flash";
import { withSession } from "@/lib/api/browser";
import { analysesApi, toErrorMessage, usersApi } from "@/lib/api/client";
import { endSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

export function DangerZone({ email }: { email: string }) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [typedEmail, setTypedEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { message, flash } = useFlash(4000);

  const run = async (action: () => Promise<void>) => {
    setError(null);
    setPending(true);
    try {
      await action();
    } catch (actionError) {
      setError(toErrorMessage(actionError));
    } finally {
      setPending(false);
    }
  };

  const deleteAnalyses = () =>
    run(async () => {
      await withSession(analysesApi.removeAll);
      flash("Usunięto wszystkie analizy");
      router.refresh();
    });

  const deleteAccount = () =>
    run(async () => {
      await withSession(usersApi.remove);
      endSession();
      router.replace(ROUTES.home);
      router.refresh();
    });

  return (
    <section
      id="konto"
      className="flex scroll-mt-6 flex-col gap-5 rounded-[20px] border-2 border-fire-strong bg-fire-soft p-6"
    >
      <div>
        <h2 className="text-xl font-extrabold tracking-[-0.03em] text-fire-deep">Strefa niebezpieczna</h2>
        <p className="text-sm text-body">Tych operacji nie da się cofnąć.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5">
        <div>
          <p className="font-semibold">Usuń wszystkie analizy</p>
          <p className="text-sm text-body">Usuwa nagrania i wyniki. Konto zostaje.</p>
        </div>
        <Button variant="danger" onClick={deleteAnalyses} disabled={pending}>
          Usuń analizy
        </Button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold">Usuń konto</p>
            <p className="text-sm text-body">Usuwa konto, wszystkie nagrania i wyniki.</p>
          </div>
          {!confirmingDelete ? (
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Usuń konto
            </Button>
          ) : null}
        </div>

        {confirmingDelete ? (
          <div className="flex flex-col gap-3 border-t border-line pt-4">
            <Field
              label={`Wpisz ${email}, aby potwierdzić`}
              value={typedEmail}
              onChange={(e) => setTypedEmail(e.target.value)}
              autoComplete="off"
            />
            <div className="flex flex-wrap gap-3">
              <Button
                variant="danger"
                disabled={pending || typedEmail.trim().toLowerCase() !== email.toLowerCase()}
                onClick={deleteAccount}
              >
                Usuwam konto na zawsze
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setConfirmingDelete(false);
                  setTypedEmail("");
                }}
              >
                Anuluj
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm font-semibold text-fire-deep">
          {error}
        </p>
      ) : (
        <p role="status" aria-live="polite" className="text-sm font-semibold text-fire-deep">
          {message ?? ""}
        </p>
      )}
    </section>
  );
}
