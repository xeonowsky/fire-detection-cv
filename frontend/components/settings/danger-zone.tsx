"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useFlash } from "@/hooks/use-flash";
import { endSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

export function DangerZone({ email }: { email: string }) {
  const router = useRouter();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [typedEmail, setTypedEmail] = useState("");
  const { message, flash } = useFlash(4000);

  const deleteAccount = () => {
    // TODO(krok 3): DELETE /users/me
    endSession();
    router.push(ROUTES.home);
  };

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
        {/* TODO(krok 3): DELETE /analyses */}
        <Button variant="danger" onClick={() => flash("Usunięto wszystkie analizy")}>
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
                disabled={typedEmail.trim().toLowerCase() !== email.toLowerCase()}
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

      <p role="status" aria-live="polite" className="text-sm font-semibold text-fire-deep">
        {message ?? ""}
      </p>
    </section>
  );
}
