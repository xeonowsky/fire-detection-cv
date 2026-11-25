"use client";

import Link from "next/link";
import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { NavLink } from "@/lib/navigation";

type MobileMenuProps = {
  links: NavLink[];
  /** Przyciski konta renderowane na serwerze (zależą od sesji). */
  actions: ReactNode;
};

/** Hamburger + menu na cały ekran, widoczne tylko poniżej breakpointu md. */
export function MobileMenu({ links, actions }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  // Blokada scrolla strony + Escape
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Po poszerzeniu okna do desktopu menu zamyka się samo
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Klik w dowolny link w menu (także w kotwicę na tej samej stronie) zamyka menu
  const closeOnLink = (e: MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("a")) setOpen(false);
  };

  const reveal = (delay: number) => ({
    style: { transitionDelay: open ? `${delay}ms` : "0ms" },
    className: cn(
      "transition-[opacity,translate] duration-500 ease-out",
      open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
    ),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Zamknij menu" : "Otwórz menu"}
        className="relative z-50 -mr-2 flex size-11 items-center justify-center rounded-full text-ink focus-visible:ring-4 focus-visible:ring-fire/30 focus-visible:outline-none md:hidden"
      >
        <span
          className={cn(
            "absolute h-0.5 w-6 rounded-full bg-current transition-transform duration-300",
            open ? "rotate-45" : "-translate-y-[7px]",
          )}
        />
        <span
          className={cn(
            "absolute h-0.5 w-6 rounded-full bg-current transition-opacity duration-200",
            open ? "opacity-0" : "opacity-100",
          )}
        />
        <span
          className={cn(
            "absolute h-0.5 w-6 rounded-full bg-current transition-transform duration-300",
            open ? "-rotate-45" : "translate-y-[7px]",
          )}
        />
      </button>

      <div
        id="mobile-menu"
        aria-hidden={!open}
        onClick={closeOnLink}
        className={cn(
          "fixed inset-0 z-40 flex flex-col overflow-y-auto bg-paper px-5 pt-28 pb-8 transition-[opacity,visibility] duration-300 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <nav aria-label="Menu mobilne" className="flex flex-col">
          {links.map((link, i) => {
            const r = reveal(80 + i * 60);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={r.style}
                className={cn(
                  "group flex items-baseline gap-4 border-b border-line py-5 text-ink no-underline",
                  r.className,
                )}
              >
                <span className="font-mono text-xs text-fire-strong">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-4xl font-semibold tracking-tight group-hover:text-fire-strong">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div
          style={reveal(80 + links.length * 60).style}
          className={cn("mt-auto flex flex-col gap-3 pt-10", reveal(0).className)}
        >
          {actions}
        </div>
      </div>
    </>
  );
}
