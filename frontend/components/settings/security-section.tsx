"use client";

import { useState, type FormEvent } from "react";
import { FormFooter } from "@/components/settings/form-footer";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { PasswordField } from "@/components/ui/password-field";
import { useFlash } from "@/hooks/use-flash";

const MIN_PASSWORD_LENGTH = 8;

type PasswordErrors = { next?: string; confirm?: string };

function validatePasswords(next: string, confirm: string): PasswordErrors {
  const errors: PasswordErrors = {};
  if (next.length < MIN_PASSWORD_LENGTH)
    errors.next = `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`;
  if (confirm !== next) errors.confirm = "Hasła nie są takie same.";
  return errors;
}

export function SecuritySection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<PasswordErrors>({});
  const { message, flash } = useFlash();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validatePasswords(next, confirm);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    // TODO(krok 3): POST /users/me/password
    setCurrent("");
    setNext("");
    setConfirm("");
    flash("Hasło zostało zmienione");
  };

  return (
    <Panel
      id="bezpieczenstwo"
      title="Bezpieczeństwo"
      description="Zmień hasło albo wyloguj się ze wszystkich urządzeń."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <PasswordField
          label="Obecne hasło"
          name="currentPassword"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Nowe hasło"
            name="newPassword"
            autoComplete="new-password"
            hint={`min. ${MIN_PASSWORD_LENGTH} znaków`}
            error={errors.next}
            value={next}
            onChange={(e) => setNext(e.target.value)}
          />
          <PasswordField
            label="Powtórz nowe hasło"
            name="confirmPassword"
            autoComplete="new-password"
            error={errors.confirm}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <FormFooter message={message}>
          <Button type="submit" variant="dark" disabled={!current || !next || !confirm}>
            Zmień hasło
          </Button>
          <Button variant="outline" onClick={() => flash("Wylogowano z pozostałych urządzeń")}>
            Wyloguj ze wszystkich urządzeń
          </Button>
        </FormFooter>
      </form>
    </Panel>
  );
}
