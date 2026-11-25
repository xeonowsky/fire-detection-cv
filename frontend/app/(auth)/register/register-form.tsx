"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthLink, AuthSwitch } from "@/components/auth/auth-link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { PasswordField } from "@/components/ui/password-field";
import { DisplayHeading } from "@/components/ui/typography";
import { authApi, toErrorMessage } from "@/lib/api/client";
import { startSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

const MIN_PASSWORD_LENGTH = 8;

type PasswordErrors = { password?: string; passwordConfirm?: string };

function validatePasswords(password: string, confirm: string): PasswordErrors {
  const errors: PasswordErrors = {};
  if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Hasło musi mieć co najmniej ${MIN_PASSWORD_LENGTH} znaków.`;
  if (confirm !== password) errors.passwordConfirm = "Hasła nie są takie same.";
  return errors;
}

export function RegisterForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));

    const validation = validatePasswords(password, String(form.get("passwordConfirm")));
    setErrors(validation);
    setError(null);
    if (Object.keys(validation).length > 0) return;

    setPending(true);
    try {
      const { access_token } = await authApi.register(name, email, password);
      startSession(access_token);
      router.replace(ROUTES.dashboard);
      router.refresh();
    } catch (registerError) {
      setError(toErrorMessage(registerError));
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-[420px] flex-col gap-4">
      <DisplayHeading lead="Załóż" accent="konto." className="mb-2" />
      <FormError message={error} />
      <Field label="Imię" name="name" autoComplete="given-name" required maxLength={80} />
      <Field label="Email" type="email" name="email" autoComplete="email" required />
      <PasswordField
        label="Hasło"
        name="password"
        autoComplete="new-password"
        hint={`min. ${MIN_PASSWORD_LENGTH} znaków`}
        error={errors.password}
        required
      />
      <PasswordField
        label="Powtórz hasło"
        name="passwordConfirm"
        autoComplete="new-password"
        error={errors.passwordConfirm}
        required
      />
      <label className="flex items-start gap-2.5 text-sm leading-snug font-medium">
        <input type="checkbox" name="terms" required className="mt-0.5 size-[18px] accent-fire" />
        <span>
          Akceptuję{" "}
          <AuthLink href={ROUTES.terms} target="_blank" className="font-semibold">
            regulamin
          </AuthLink>{" "}
          i{" "}
          <AuthLink href={ROUTES.privacy} target="_blank" className="font-semibold">
            politykę prywatności
          </AuthLink>
        </span>
      </label>
      <Button type="submit" size="lg" className="mt-1" disabled={pending}>
        {pending ? "Zakładanie konta…" : "Załóż konto"} <span aria-hidden="true">→</span>
      </Button>
      <AuthSwitch question="Masz już konto?" href={ROUTES.login} action="Zaloguj się" />
    </form>
  );
}
