import { ROUTES } from "@/lib/routes";

export type NavLink = { href: string; label: string };

export const APP_NAV: NavLink[] = [
  { href: ROUTES.dashboard, label: "Pulpit" },
  { href: ROUTES.newAnalysis, label: "Nowa analiza" },
  { href: ROUTES.analyses, label: "Historia" },
];

export const SITE_NAV: NavLink[] = [
  { href: ROUTES.howItWorks, label: "Jak to działa" },
  { href: ROUTES.contact, label: "Kontakt" },
];

export const LEGAL_LINKS: NavLink[] = [
  { href: ROUTES.terms, label: "Regulamin" },
  { href: ROUTES.privacy, label: "Polityka prywatności" },
  { href: ROUTES.contact, label: "Kontakt" },
];

export const FOOTER_COLUMNS: { title: string; links: NavLink[] }[] = [
  {
    title: "Produkt",
    links: [
      { href: ROUTES.howItWorks, label: "Jak to działa" },
      { href: ROUTES.newAnalysis, label: "Nowa analiza" },
      { href: ROUTES.analyses, label: "Historia analiz" },
    ],
  },
  {
    title: "Konto",
    links: [
      { href: ROUTES.login, label: "Zaloguj się" },
      { href: ROUTES.register, label: "Załóż konto" },
      { href: ROUTES.settings, label: "Ustawienia" },
    ],
  },
  { title: "Informacje", links: LEGAL_LINKS },
];
