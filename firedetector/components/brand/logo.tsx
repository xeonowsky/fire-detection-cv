import Link from "next/link";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

type LogoProps = {
  href?: string;
  tone?: "light" | "dark";
  className?: string;
};

export function FlameIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 2c1 3 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .2 1.8 1 3 2.5 3.5C12 8 11 5 12 2z" />
    </svg>
  );
}

export function Logo({ href = ROUTES.home, tone = "light", className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2.5 no-underline",
        tone === "light" ? "text-ink" : "text-cream",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg",
          tone === "light" ? "bg-ink text-fire" : "bg-fire text-ink",
        )}
      >
        <FlameIcon className="size-[18px]" />
      </span>
      <span className="text-[19px] tracking-tight">
        <span className="font-normal">fire</span>
        <span className="font-extrabold">Detector</span>
      </span>
    </Link>
  );
}
