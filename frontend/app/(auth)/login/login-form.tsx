"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import { AuthLink, AuthSwitch } from "@/components/auth/auth-link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { DisplayHeading } from "@/components/ui/typography";
import { startSession } from "@/lib/auth/session";
import { ROUTES, safeRedirectPath } from "@/lib/routes";

// TODO(krok 3): walidacja i POST /auth/login zamiast sesji demonstracyjnej.
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("next"));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    startSession();
    router.push(redirectTo);
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-[400px] flex-col gap-[18px]">
      <DisplayHeading lead="Zaloguj" accent="się." className="mb-2" />
      <Field label="Email" type="email" name="email" autoComplete="email" placeholder="jan@firma.pl" />
      <div className="flex flex-col gap-2">
        <PasswordField label="Hasło" name="password" autoComplete="current-password" />
        <AuthLink href={ROUTES.forgotPassword} className="self-end text-sm font-semibold">
          Nie pamiętasz hasła?
        </AuthLink>
      </div>
      <Button type="submit" variant="dark" size="lg" className="mt-1">
        Zaloguj się{" "}
        <span aria-hidden="true" className="text-fire">
          →
        </span>
      </Button>
      <AuthSwitch question="Nie masz konta?" href={ROUTES.register} action="Zarejestruj się" />
    </form>
  );
}
