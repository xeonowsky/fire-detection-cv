"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field, SelectField, TextareaField } from "@/components/ui/field";

const CONTACT_TOPICS = [
  "Pytanie o działanie",
  "Problem z analizą",
  "Dane osobowe",
  "Współpraca",
  "Inne",
] as const;

// TODO(krok 2): wysyłka wiadomości przez API.
export function ContactForm() {
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSent(true);
  };

  if (isSent) {
    return <MessageSent onReset={() => setIsSent(false)} />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-[18px] border border-line bg-white p-7"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Imię" name="name" autoComplete="name" required />
        <Field label="Email" type="email" name="email" autoComplete="email" required />
      </div>
      <SelectField label="Temat" name="topic" options={CONTACT_TOPICS} />
      <TextareaField label="Wiadomość" name="message" rows={6} required />
      <Button type="submit" size="lg" className="self-start">
        Wyślij wiadomość <span aria-hidden="true">→</span>
      </Button>
    </form>
  );
}

function MessageSent({ onReset }: { onReset: () => void }) {
  return (
    <div role="status" className="flex flex-col gap-3 rounded-[18px] bg-ink p-8 text-cream">
      <span className="font-mono text-sm font-semibold text-fire">● wiadomość wysłana</span>
      <h2 className="text-3xl font-extrabold tracking-[-0.03em]">Dzięki, odezwiemy się.</h2>
      <p className="text-muted-dark">Odpowiadamy zwykle w ciągu 2 dni roboczych.</p>
      <Button variant="light" className="mt-2 self-start" onClick={onReset}>
        Wyślij kolejną wiadomość
      </Button>
    </div>
  );
}
