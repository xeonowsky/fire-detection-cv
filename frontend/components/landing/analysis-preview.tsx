import { Spotlight } from "@/components/ui/spotlight";

export function AnalysisPreview() {
  return (
    <Spotlight className="flex-[1_1_440px] rounded-[18px]" borderColor="#2a2826">
      <div className="flex flex-col gap-3.5 rounded-[17px] bg-[rgb(6_6_6/0.95)] p-5 text-cream">
        <div className="flex justify-between font-mono text-[12.5px]">
          <span className="text-muted-dark">analiza / magazyn-kamera-2.mp4</span>
          <span className="text-fire">● zakończona</span>
        </div>

        <div className="relative aspect-[16/8] overflow-hidden rounded-[10px] bg-[radial-gradient(ellipse_22%_42%_at_44%_64%,rgb(255_120_40/0.6),rgb(255_80_20/0.12)_55%,transparent_75%),linear-gradient(180deg,#161514,#050505)]">
          <div className="absolute top-[46%] left-[34%] h-[40%] w-[20%] animate-firepulse rounded-[5px]">
            <span className="absolute -top-[26px] -left-0.5 rounded-[5px_5px_5px_0] bg-fire px-[7px] py-[3px] font-mono text-[11.5px] font-bold text-ink">
              ogień 91%
            </span>
          </div>
        </div>

        <p className="font-mono text-xs text-muted-dark">
          frame <span className="text-cream">0350</span> → fire[<span className="text-fire">0.91</span>] ·
          smoke[0.74] · risk: <span className="text-fire">HIGH</span>
        </p>
      </div>
    </Spotlight>
  );
}
