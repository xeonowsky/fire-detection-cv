"use client";

import { useState } from "react";
import { FormFooter } from "@/components/settings/form-footer";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { Switch } from "@/components/ui/switch";
import { useFlash } from "@/hooks/use-flash";

const OPTIONS = [
  {
    key: "fireDetected",
    label: "Wykryto pożar",
    description: "Email natychmiast po analizie, w której model wykrył ogień.",
  },
  { key: "analysisDone", label: "Analiza zakończona", description: "Email po każdej zakończonej analizie." },
  {
    key: "analysisFailed",
    label: "Błąd analizy",
    description: "Email, gdy nagrania nie udało się przeanalizować.",
  },
  {
    key: "productNews",
    label: "Nowości w aplikacji",
    description: "Raz na jakiś czas informacja o nowych funkcjach.",
  },
] as const;

type NotificationKey = (typeof OPTIONS)[number]["key"];

const DEFAULTS: Record<NotificationKey, boolean> = {
  fireDetected: true,
  analysisDone: false,
  analysisFailed: true,
  productNews: false,
};

export function NotificationsSection() {
  const [settings, setSettings] = useState(DEFAULTS);
  const { message, flash } = useFlash();

  const toggle = (key: NotificationKey, value: boolean) => setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <Panel
      id="powiadomienia"
      title="Powiadomienia"
      description="Wybierz, o czym chcesz dostawać wiadomości email."
    >
      <div className="flex flex-col divide-y divide-line">
        {OPTIONS.map((option) => (
          <div key={option.key} className="py-4 first:pt-0">
            <Switch
              label={option.label}
              description={option.description}
              checked={settings[option.key]}
              onChange={(value) => toggle(option.key, value)}
            />
          </div>
        ))}
      </div>
      <FormFooter message={message}>
        {/* TODO(krok 3): zapis preferencji w API */}
        <Button variant="dark" onClick={() => flash("Zapisano ustawienia powiadomień")}>
          Zapisz powiadomienia
        </Button>
      </FormFooter>
    </Panel>
  );
}
