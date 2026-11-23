"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

type SwitchProps = {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export function Switch({ label, description, checked, onChange, disabled }: SwitchProps) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        {description ? <p className="text-sm text-body">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:ring-4 focus-visible:ring-fire/30 focus-visible:outline-none disabled:opacity-50",
          checked ? "bg-ink" : "bg-line",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 size-5 rounded-full transition-transform",
            checked ? "translate-x-5 bg-fire" : "bg-white",
          )}
        />
      </button>
    </div>
  );
}
