import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "fire" | "dark" | "light" | "outline" | "outline-dark" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[background-color,box-shadow,color] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-fire/30 disabled:cursor-not-allowed disabled:bg-line disabled:text-muted disabled:shadow-none";

const variants: Record<Variant, string> = {
  fire: "bg-fire text-ink font-extrabold hover:bg-fire-hover hover:shadow-[0_10px_28px_rgb(255_91_20/0.4)]",
  dark: "bg-ink text-white hover:bg-[#1c1b1a]",
  light: "bg-paper text-ink hover:bg-white",
  outline: "border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-white",
  "outline-dark": "border border-line-dark bg-transparent text-cream hover:border-fire",
  ghost: "bg-transparent text-fire-strong hover:bg-fire-soft",
  danger: "border-2 border-fire-strong bg-fire-soft text-fire-deep hover:bg-fire-strong hover:text-white",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-4 text-[13px]",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-[52px] px-7 text-[15px]",
};

type Common = { variant?: Variant; size?: Size };

export function buttonClasses({ variant = "fire", size = "md" }: Common = {}, className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant,
  size,
  className,
  type = "button",
  ...props
}: Common & ComponentProps<"button">) {
  return <button type={type} className={buttonClasses({ variant, size }, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: Common & ComponentProps<typeof Link>) {
  return <Link className={buttonClasses({ variant, size }, className)} {...props} />;
}
