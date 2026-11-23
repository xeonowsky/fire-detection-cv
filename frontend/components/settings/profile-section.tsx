"use client";

import { useState, type FormEvent } from "react";
import { FormFooter } from "@/components/settings/form-footer";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { useFlash } from "@/hooks/use-flash";
import type { User } from "@/lib/api/types";

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfileSection({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const { message, flash } = useFlash();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // TODO(krok 3): PATCH /users/me
    flash("Zapisano zmiany w profilu");
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
        <FormFooter message={message}>
          <Button type="submit" variant="dark">
            Zapisz profil
          </Button>
        </FormFooter>
      </form>
    </Panel>
  );
}
