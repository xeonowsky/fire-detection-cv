import { History, MessageCircle, Settings, Upload, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { ROUTES } from "@/lib/routes";

type Action = { href: string; label: string; hint: string; icon: LucideIcon };

const actions: Action[] = [
  { href: ROUTES.newAnalysis, label: "Nowa analiza", hint: "wgraj nagranie", icon: Upload },
  { href: ROUTES.analyses, label: "Historia", hint: "wszystkie wyniki", icon: History },
  { href: ROUTES.settings, label: "Ustawienia konta", hint: "profil, hasło, powiadomienia", icon: Settings },
  { href: ROUTES.contact, label: "Pomoc", hint: "napisz do nas", icon: MessageCircle },
];

export function QuickActions() {
  return (
    <Panel title="Szybkie akcje" tone="dark">
      <ul className="flex list-none flex-col gap-1 p-0">
        {actions.map(({ href, label, hint, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-cream no-underline transition-colors hover:bg-[#1c1b1a]"
            >
              <span className="flex size-10 items-center justify-center rounded-lg border border-line-dark text-fire">
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold">{label}</span>
                <span className="text-xs text-muted-dark">{hint}</span>
              </span>
              <span aria-hidden="true" className="ml-auto text-fire">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
