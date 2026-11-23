"use client";

import { useState } from "react";
import { FormFooter } from "@/components/settings/form-footer";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/field";
import { Panel } from "@/components/ui/panel";
import { Switch } from "@/components/ui/switch";
import { useFlash } from "@/hooks/use-flash";

const PLAYBACK_SPEEDS = ["0,5×", "1×", "1,5×", "2×"] as const;

export function AnalysisPreferencesSection() {
  const [threshold, setThreshold] = useState(50);
  const [showBoxes, setShowBoxes] = useState(true);
  const [showSmoke, setShowSmoke] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [jumpToFirstDetection, setJumpToFirstDetection] = useState(true);
  const { message, flash } = useFlash();

  return (
    <Panel
      id="analiza"
      title="Preferencje analizy"
      description="Domyślne ustawienia odtwarzacza na ekranie wyniku. Każde możesz zmienić też w trakcie oglądania."
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="threshold" className="font-semibold">
            Domyślny próg pewności
          </label>
          <span className="font-mono font-bold text-fire-strong">{threshold}%</span>
        </div>
        <input
          id="threshold"
          type="range"
          min={10}
          max={95}
          step={5}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full accent-fire"
        />
        <p className="text-sm text-body">Ramki z niższą pewnością nie będą pokazywane na filmie.</p>
      </div>

      <div className="flex flex-col divide-y divide-line">
        <div className="py-4">
          <Switch
            label="Pokazuj ramki detekcji"
            description="Ramki ognia i dymu nałożone na odtwarzany film."
            checked={showBoxes}
            onChange={setShowBoxes}
          />
        </div>
        <div className="py-4">
          <Switch
            label="Pokazuj dym"
            description="Wyłącz, jeśli interesuje Cię tylko ogień."
            checked={showSmoke}
            onChange={setShowSmoke}
          />
        </div>
        <div className="py-4">
          <Switch
            label="Przeskakuj do pierwszej detekcji"
            description="Odtwarzacz startuje od momentu, w którym pojawił się ogień."
            checked={jumpToFirstDetection}
            onChange={setJumpToFirstDetection}
          />
        </div>
        <div className="py-4">
          <Switch
            label="Automatyczne odtwarzanie"
            description="Film rusza sam po otwarciu wyniku."
            checked={autoplay}
            onChange={setAutoplay}
          />
        </div>
      </div>

      <div className="max-w-xs">
        <SelectField
          label="Prędkość odtwarzania"
          name="playbackSpeed"
          options={PLAYBACK_SPEEDS}
          defaultValue="1×"
        />
      </div>

      <FormFooter message={message}>
        {/* TODO(krok 5): odtwarzacz odczytuje te ustawienia */}
        <Button variant="dark" onClick={() => flash("Zapisano preferencje analizy")}>
          Zapisz preferencje
        </Button>
      </FormFooter>
    </Panel>
  );
}
