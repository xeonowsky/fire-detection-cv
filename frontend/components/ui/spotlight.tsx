"use client";

import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type SpotlightProps = {
  children: ReactNode;
  className?: string;
  glowRadius?: number;
  glowColor?: string;
  borderColor?: string;
};

// Ramki to 1px przerwy odsłaniające gradient pod spodem; lekko przezroczyste dzieci dostają subtelny odblask.
// Pozycja kursora trafia do zmiennych CSS zamiast do stanu, więc ruch myszy nie przerysowuje Reacta.
export function Spotlight({
  children,
  className,
  glowRadius = 300,
  glowColor = "rgb(255 91 20)",
  borderColor = "#1c1b1a",
}: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  const setPos = (x: number, y: number) => {
    ref.current?.style.setProperty("--mx", `${x}px`);
    ref.current?.style.setProperty("--my", `${y}px`);
  };

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos(e.clientX - r.left, e.clientY - r.top);
  };

  const style = {
    "--mx": "-9999px",
    "--my": "-9999px",
    background: `radial-gradient(${glowRadius}px circle at var(--mx) var(--my), ${glowColor}, transparent 42%), ${borderColor}`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos(-9999, -9999)}
      className={cn("p-px", className)}
      style={style}
    >
      {children}
    </div>
  );
}
