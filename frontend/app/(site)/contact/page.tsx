import type { Metadata } from "next";
import { Mail, MessageSquare, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { EmergencyNotice } from "@/components/site/emergency-notice";
import { MissingInfo } from "@/components/site/legal-page";
import { DisplayHeading, Eyebrow } from "@/components/ui/typography";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Kontakt" };

export default function ContactPage() {
  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-8 pt-10 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex flex-col gap-6">
        <Eyebrow>Kontakt</Eyebrow>
        <DisplayHeading lead="Napisz" accent="do nas." />
        <p className="max-w-[460px] text-lg leading-relaxed text-body">
          Masz pytanie o działanie aplikacji, problem z analizą albo sprawę dotyczącą danych? Zostaw
          wiadomość, odpowiemy mailowo.
        </p>

        <ul className="flex list-none flex-col gap-3 p-0">
          <ContactItem icon={Mail} label="Email">
            <MissingInfo>adres email zespołu</MissingInfo>
          </ContactItem>
          <ContactItem icon={MessageSquare} label="Czas odpowiedzi">
            do 2 dni roboczych
          </ContactItem>
        </ul>

        <EmergencyNotice title="To nie jest numer alarmowy." />
      </div>

      <ContactForm />
    </div>
  );
}

function ContactItem({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex items-center gap-4 rounded-2xl border border-line bg-white p-4">
      <span className="flex size-11 items-center justify-center rounded-xl bg-ink text-fire">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <div className="font-mono text-xs text-muted uppercase">{label}</div>
        <div className="font-semibold">{children}</div>
      </div>
    </li>
  );
}
