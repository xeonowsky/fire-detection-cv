"use client";

import { useState, type FormEvent } from "react";
import { FormFooter } from "@/components/settings/form-footer";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { PasswordField } from "@/components/ui/password-field";
import { useFlash } from "@/hooks/use-flash";
import { withSession } from "@/lib/api/browser";
import { ApiError, toErrorMessage, usersApi } from "@/lib/api/client";

const MIN_PASSWORD_LENGTH = 8;

type PasswordErrors = { current?: string; next?: string; confirm?: string };

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
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { message, flash } = useFlash();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validatePasswords(next, confirm);
    setErrors(validation);
    setError(null);
    if (Object.keys(validation).length > 0) return;

    setPending(true);
    try {
      await withSession((token) => usersApi.changePassword(token, current, next));
      setCurrent("");
      setNext("");
      setConfirm("");
      flash("Hasło zostało zmienione");
    } catch (saveError) {
      if (saveError instanceof ApiError && saveError.status === 400) {
        setErrors({ current: saveError.message });
      } else {
        setError(toErrorMessage(saveError));
      }
    } finally {
      setPending(false);
    }
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
          error={errors.current}
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
        <FormFooter message={message} error={error}>
          <Button type="submit" variant="dark" disabled={pending || !current || !next || !confirm}>
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
