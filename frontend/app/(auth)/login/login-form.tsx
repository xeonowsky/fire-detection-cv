"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AuthLink, AuthSwitch } from "@/components/auth/auth-link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { PasswordField } from "@/components/ui/password-field";
import { DisplayHeading } from "@/components/ui/typography";
import { authApi, toErrorMessage } from "@/lib/api/client";
import { startSession } from "@/lib/auth/session";
import { ROUTES, safeRedirectPath } from "@/lib/routes";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirectPath(searchParams.get("next"));
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    setPending(true);
    try {
      const { access_token } = await authApi.login(String(form.get("email")), String(form.get("password")));
      startSession(access_token);
      router.replace(redirectTo);
      router.refresh();
    } catch (loginError) {
      setError(toErrorMessage(loginError));
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-[400px] flex-col gap-[18px]">
      <DisplayHeading lead="Zaloguj" accent="się." className="mb-2" />
      <FormError message={error} />
      <Field
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="jan@firma.pl"
        required
      />
      <div className="flex flex-col gap-2">
        <PasswordField label="Hasło" name="password" autoComplete="current-password" required />
        <AuthLink href={ROUTES.forgotPassword} className="self-end text-sm font-semibold">
          Nie pamiętasz hasła?
        </AuthLink>
      </div>
      <Button type="submit" variant="dark" size="lg" className="mt-1" disabled={pending}>
        {pending ? "Logowanie…" : "Zaloguj się"}{" "}
        <span aria-hidden="true" className="text-fire">
          →
        </span>
      </Button>
      <AuthSwitch question="Nie masz konta?" href={ROUTES.register} action="Zarejestruj się" />
    </form>
  );
}
