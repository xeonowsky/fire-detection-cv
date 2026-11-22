import { ArrowRight, Film, Flame, Gauge, Upload, type LucideIcon } from "lucide-react";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/cn";
import { ANALYSIS_LIMITS } from "@/lib/site";

type Step = {
  n: string;
  title: string;
  text: string;
  meta: string;
  icon: LucideIcon;
  highlight?: boolean;
};

const steps: Step[] = [
  {
    n: "01",
    title: "Wgrywasz film",
    text: "Przeciągasz nagranie z kamery lub telefonu. Postęp wysyłania widzisz na bieżąco.",
    meta: `${ANALYSIS_LIMITS.acceptedFormats.join(" · ")} · do ${ANALYSIS_LIMITS.maxDurationLabel}`,
    icon: Upload,
  },
  {
    n: "02",
    title: "Analiza klatek",
    text: "Nagranie trafia do kolejki, a model sprawdza je klatka po klatce w tle.",
    meta: "status odświeża się sam",
    icon: Film,
  },
  {
    n: "03",
    title: "Wykrycie ognia i dymu",
    text: "Każdy wykryty obiekt dostaje ramkę, pewność i dokładny moment w filmie.",
    meta: "ogień · dym · pewność %",
    icon: Flame,
  },
  {
    n: "04",
    title: "Werdykt i ocena zagrożenia",
    text: "Dostajesz poziom zagrożenia i odtwarzacz, w którym detekcje pojawiają się na obrazie.",
    meta: `wynik w ciągu ${ANALYSIS_LIMITS.maxProcessingMinutes} minut`,
    icon: Gauge,
    highlight: true,
  },
];

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon;
  return (
    <Spotlight
      className="flex-1 rounded-[18px]"
      borderColor={step.highlight ? "#ff5b14" : "#2a2826"}
      glowColor={step.highlight ? "rgb(255 255 255 / 0.9)" : "rgb(255 91 20)"}
    >
      <div
        className={cn(
          "flex h-full flex-col gap-4 rounded-[17px] p-6",
          step.highlight ? "bg-fire text-ink" : "bg-[rgb(6_6_6/0.93)] text-cream",
        )}
      >
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "font-mono text-[34px] font-bold tracking-[-0.04em]",
              step.highlight ? "text-ink" : "text-fire",
            )}
          >
            {step.n}
          </span>
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-xl",
              step.highlight ? "bg-ink text-fire" : "border border-line-dark text-fire",
            )}
          >
            <Icon className="size-5" aria-hidden="true" strokeWidth={2} />
          </span>
        </div>
        <h3 className="text-lg leading-snug font-bold">{step.title}</h3>
        <p
          className={cn("text-[15px] leading-relaxed", step.highlight ? "text-[#2a1406]" : "text-muted-dark")}
        >
          {step.text}
        </p>
        <span
          className={cn(
            "mt-auto self-start rounded-full px-3 py-1 font-mono text-xs font-semibold",
            step.highlight ? "bg-ink text-fire" : "bg-[#1c1b1a] text-cream",
          )}
        >
          {step.meta}
        </span>
      </div>
    </Spotlight>
  );
}

function Connector() {
  return (
    <div aria-hidden="true" className="flex shrink-0 items-center justify-center lg:w-10">
      <span className="flex size-9 items-center justify-center rounded-full border border-line-dark bg-ink text-fire">
        <ArrowRight className="size-4 rotate-90 lg:rotate-0" strokeWidth={2.5} />
      </span>
    </div>
  );
}

export function ProcessPath() {
  return (
    <ol className="flex list-none flex-col gap-3 p-0 lg:flex-row lg:items-stretch lg:gap-0">
      {steps.map((step, i) => (
        <li key={step.n} className="contents">
          <div className="flex lg:flex-1">
            <StepCard step={step} />
          </div>
          {i < steps.length - 1 ? <Connector /> : null}
        </li>
      ))}
    </ol>
  );
}
