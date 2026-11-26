import { cn } from "@/lib/cn";

type ProgressBarProps = {
  /** 0–100 */
  value: number;
  label: string;
  tone?: "fire" | "ink";
  className?: string;
};

export function ProgressBar({ value, label, tone = "fire", className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      className={cn("h-3 w-full overflow-hidden rounded-full bg-line", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-300 ease-out",
          tone === "fire" ? "bg-fire" : "bg-ink",
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
