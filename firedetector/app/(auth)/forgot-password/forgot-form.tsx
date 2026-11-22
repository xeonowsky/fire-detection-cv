"use client";

import { useState, type FormEvent } from "react";
import { AuthLink } from "@/components/auth/auth-link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { DisplayHeading } from "@/components/ui/typography";
import { ROUTES } from "@/lib/routes";

const RESET_LINK_VALID_HOURS = 1;

// TODO(krok 3): wysyłka linku przez API.
export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSent(true);
  };

  if (isSent) {
    return <ResetLinkSent email={email} onResend={() => setIsSent(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-[400px] flex-col gap-[18px]">
      <DisplayHeading lead="Nowe" accent="hasło." className="mb-2" />
      <p className="text-body">Podaj email konta, a wyślemy link do ustawienia nowego hasła.</p>
      <Field
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="jan@firma.pl"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button type="submit" variant="dark" size="lg" className="mt-1">
        Wyślij link{" "}
        <span aria-hidden="true" className="text-fire">
          →
        </span>
      </Button>
      <BackToLogin />
    </form>
  );
}

function ResetLinkSent({ email, onResend }: { email: string; onResend: () => void }) {
  return (
    <div role="status" className="flex w-full max-w-[400px] flex-col gap-4">
      <span className="font-mono text-sm font-semibold text-fire-strong">● link wysłany</span>
      <DisplayHeading lead="Sprawdź" accent="skrzynkę." size="md" />
      <p className="text-body">
        Jeśli konto <strong className="text-ink">{email}</strong> istnieje, wysłaliśmy na nie link do
        ustawienia nowego hasła. Link jest ważny przez {RESET_LINK_VALID_HOURS} godzinę.
      </p>
      <p className="text-sm text-body">
        Nie dostałeś maila? Sprawdź spam albo{" "}
        <button type="button" onClick={onResend} className="font-bold text-fire-strong">
          wyślij ponownie
        </button>
        .
      </p>
      <BackToLogin />
    </div>
  );
}

function BackToLogin() {
  return (
    <AuthLink href={ROUTES.login} className="self-start text-sm">
      ← Wróć do logowania
    </AuthLink>
  );
}
