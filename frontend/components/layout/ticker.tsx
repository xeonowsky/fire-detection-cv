const words = [
  "OGIEŃ 91%",
  "DYM 74%",
  "ZAGROŻENIE: WYSOKIE",
  "00:14 PIERWSZA DETEKCJA",
  "KLATKA 0350",
  "ANALIZA 48 s",
];

export function Ticker({ className = "" }: { className?: string }) {
  const items = [...words, ...words];
  return (
    <div aria-hidden="true" className={`overflow-hidden ${className}`}>
      <div className="flex w-max animate-marquee gap-9 py-4 font-mono text-sm font-semibold tracking-[0.06em] whitespace-nowrap text-fire">
        {items.map((w, i) => (
          <span key={i} className="flex items-center gap-9">
            {w}
            <span>●</span>
          </span>
        ))}
      </div>
    </div>
  );
}
