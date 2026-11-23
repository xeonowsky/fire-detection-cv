import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EyebrowProps = {
  children: ReactNode;
  tone?: "muted" | "fire" | "dark";
  className?: string;
};

const eyebrowTones = {
  muted: "text-muted",
  fire: "text-fire-strong",
  dark: "text-muted-dark",
} as const;

export function Eyebrow({ children, tone = "muted", className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "font-mono text-[12.5px] font-semibold tracking-[0.08em] uppercase",
        eyebrowTones[tone],
        className,
      )}
    >
      / {children}
    </span>
  );
}

type DisplayHeadingProps = {
  lead: ReactNode;
  accent: ReactNode;
  as?: "h1" | "h2";
  size?: "md" | "lg" | "xl";
  breakBeforeAccent?: boolean;
  className?: string;
};

const headingSizes = {
  md: "text-[44px] leading-[1.02]",
  lg: "text-[56px] leading-[0.98]",
  xl: "text-[64px] leading-[0.98] sm:text-[84px]",
} as const;

export function DisplayHeading({
  lead,
  accent,
  as: Tag = "h1",
  size = "lg",
  breakBeforeAccent = false,
  className,
}: DisplayHeadingProps) {
  return (
    <Tag className={cn("font-extrabold tracking-[-0.05em]", headingSizes[size], className)}>
      {lead}
      {breakBeforeAccent ? <br /> : " "}
      <span className="text-fire">{accent}</span>
    </Tag>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "self-start rounded-full bg-ink px-3 py-1.5 font-mono text-[12.5px] font-medium text-fire",
        className,
      )}
    >
      ● {children}
    </span>
  );
}
