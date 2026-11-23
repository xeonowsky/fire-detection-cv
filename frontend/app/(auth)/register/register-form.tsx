"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { AuthLink, AuthSwitch } from "@/components/auth/auth-link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { DisplayHeading } from "@/components/ui/typography";
import { startSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

// TODO(krok 3): walidacja i POST /auth/register zamiast sesji demonstracyjnej.
export function RegisterForm() {
  const router = useRouter();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startSession();
    router.push(ROUTES.dashboard);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-[420px] flex-col gap-4">
      <DisplayHeading lead="Załóż" accent="konto." className="mb-2" />
      <Field label="Imię" name="name" autoComplete="given-name" />
      <Field label="Email" type="email" name="email" autoComplete="email" />
      <PasswordField label="Hasło" name="password" autoComplete="new-password" hint="min. 8 znaków" />
      <PasswordField label="Powtórz hasło" name="passwordConfirm" autoComplete="new-password" />
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
      <Button type="submit" size="lg" className="mt-1">
        Załóż konto <span aria-hidden="true">→</span>
      </Button>
      <AuthSwitch question="Masz już konto?" href={ROUTES.login} action="Zaloguj się" />
    </form>
  );
}
