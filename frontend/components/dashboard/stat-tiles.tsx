import { Spotlight } from "@/components/ui/spotlight";
import type { AnalysisStats } from "@/lib/analysis/stats";
import { cn } from "@/lib/cn";

type Tile = { label: string; value: number; hint: string; accent?: boolean };

export function StatTiles({ stats }: { stats: AnalysisStats }) {
  const tiles: Tile[] = [
    { label: "analizy", value: stats.total, hint: "wszystkie nagrania" },
    { label: "pożary", value: stats.fires, hint: "wykryty ogień", accent: true },
    { label: "tylko dym", value: stats.smokeOnly, hint: "do weryfikacji" },
    { label: "w toku", value: stats.inProgress, hint: "trwa analiza" },
  ];

  return (
    <Spotlight className="rounded-[20px]" borderColor="#1c1b1a">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[19px] lg:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="flex flex-col gap-1 bg-[rgb(6_6_6/0.93)] p-6 text-cream">
            <dt className="font-mono text-[12.5px] text-muted-dark">{tile.label}</dt>
            <dd
              className={cn(
                "text-[44px] leading-none font-extrabold tracking-[-0.04em]",
                tile.accent && "text-fire",
              )}
            >
              {tile.value}
            </dd>
            <dd className="text-sm text-muted-dark">{tile.hint}</dd>
          </div>
        ))}
      </dl>
    </Spotlight>
  );
}
