"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FormFooter } from "@/components/settings/form-footer";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { useFlash } from "@/hooks/use-flash";
import { withSession } from "@/lib/api/browser";
import { toErrorMessage, usersApi } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { initialsOf } from "@/lib/user";

export function ProfileSection({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { message, flash } = useFlash();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const saved = await withSession((token) =>
        usersApi.update(token, { name: name.trim(), email: email.trim() }),
      );
      setName(saved.name);
      setEmail(saved.email);
      flash("Zapisano zmiany w profilu");
      // Odświeża dane z serwera: inicjały w pasku i imię na pulpicie.
      router.refresh();
    } catch (saveError) {
      setError(toErrorMessage(saveError));
    } finally {
      setPending(false);
    }
  };

  return (
    <Panel id="profil" title="Profil" description="Imię widoczne w aplikacji i adres email do logowania.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-full bg-ink font-mono text-xl font-bold text-fire">
            {initialsOf(name) || "?"}
          </span>
          <div>
            <p className="font-extrabold">{name || "Bez imienia"}</p>
            <p className="text-sm text-body">{email}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Imię" name="name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Field
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <FormFooter message={message} error={error}>
          <Button type="submit" variant="dark" disabled={pending}>
            Zapisz profil
          </Button>
        </FormFooter>
      </form>
    </Panel>
  );
}
