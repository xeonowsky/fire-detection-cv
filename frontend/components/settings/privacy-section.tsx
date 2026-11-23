"use client";

import { Download } from "lucide-react";
import { FormFooter } from "@/components/settings/form-footer";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { useFlash } from "@/hooks/use-flash";

const RETENTION_OPTIONS = ["7 dni", "30 dni", "90 dni", "Nie usuwaj automatycznie"] as const;

export function PrivacySection() {
  const { message, flash } = useFlash(4000);

  return (
    <Panel
      id="prywatnosc"
      title="Dane i prywatność"
      description="Nagrania mogą pokazywać ludzi, dlatego możesz zdecydować, jak długo je przechowujemy."
    >
      <div className="max-w-sm">
        <SelectField
          label="Automatyczne usuwanie nagrań"
          name="retention"
          options={RETENTION_OPTIONS}
          defaultValue="30 dni"
          hint="Wyniki analiz zostają, usuwane są tylko pliki wideo."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-paper p-5">
        <div>
          <p className="font-semibold">Eksport danych</p>
          <p className="text-sm text-body">Plik ZIP z danymi konta i wynikami wszystkich analiz (JSON).</p>
        </div>
        <Button variant="outline" onClick={() => flash("Przygotowujemy eksport — link wyślemy emailem")}>
          <Download className="size-4" aria-hidden="true" /> Pobierz moje dane
        </Button>
      </div>

      <FormFooter message={message}>
        {/* TODO(krok 3): zapis w API */}
        <Button variant="dark" onClick={() => flash("Zapisano ustawienia prywatności")}>
          Zapisz ustawienia
        </Button>
      </FormFooter>
    </Panel>
  );
}
