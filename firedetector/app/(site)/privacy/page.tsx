import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, MissingInfo } from "@/components/site/legal-page";
import { DisplayHeading } from "@/components/ui/typography";
import { ROUTES } from "@/lib/routes";

export const metadata: Metadata = { title: "Polityka prywatności" };

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Prywatność"
      title={<DisplayHeading lead="Polityka" accent="prywatności." />}
      updated="22.11.2026"
      intro={
        <p>
          Jakie dane zbieramy, po co i jak długo je trzymamy. Nagrania mogą przedstawiać ludzi, dlatego
          traktujemy je jak dane osobowe. Wersja robocza, do weryfikacji przed publikacją.
        </p>
      }
      sections={[
        {
          id: "administrator",
          title: "Administrator danych",
          body: (
            <p>
              Administratorem danych jest <MissingInfo>nazwa i adres administratora</MissingInfo>. W sprawach
              danych osobowych napisz przez <Link href={ROUTES.contact}>formularz kontaktowy</Link>.
            </p>
          ),
        },
        {
          id: "dane",
          title: "Jakie dane przetwarzamy",
          body: (
            <ul>
              <li>Dane konta: imię, adres email i zaszyfrowane (hashowane) hasło.</li>
              <li>Przesłane nagrania wideo oraz wygenerowane z nich klatki i wyniki analizy.</li>
              <li>Dane techniczne niezbędne do działania serwisu, np. ciasteczko sesji.</li>
            </ul>
          ),
        },
        {
          id: "cel",
          title: "Cel przetwarzania",
          body: (
            <ul>
              <li>Prowadzenie konta i logowanie.</li>
              <li>Wykonanie analizy nagrania i udostępnienie wyniku wyłącznie właścicielowi konta.</li>
              <li>Zapewnienie bezpieczeństwa i poprawnego działania serwisu.</li>
            </ul>
          ),
        },
        {
          id: "przechowywanie",
          title: "Jak długo przechowujemy dane",
          body: (
            <ul>
              <li>
                Nagrania i wyniki: <MissingInfo>okres przechowywania, np. 30 dni</MissingInfo> od analizy albo
                do ich usunięcia przez użytkownika.
              </li>
              <li>Dane konta: do czasu usunięcia konta.</li>
              <li>Po usunięciu konta usuwamy również wszystkie nagrania i wyniki z nim związane.</li>
            </ul>
          ),
        },
        {
          id: "odbiorcy",
          title: "Odbiorcy danych",
          body: (
            <p>
              Nie sprzedajemy danych. Korzystamy z dostawców hostingu i przechowywania plików, którzy
              przetwarzają dane w naszym imieniu: <MissingInfo>lista dostawców</MissingInfo>.
            </p>
          ),
        },
        {
          id: "prawa",
          title: "Twoje prawa",
          body: (
            <ul>
              <li>Dostęp do danych, ich sprostowanie i usunięcie.</li>
              <li>Ograniczenie przetwarzania, przeniesienie danych i sprzeciw.</li>
              <li>Skarga do Prezesa Urzędu Ochrony Danych Osobowych.</li>
            </ul>
          ),
        },
        {
          id: "cookies",
          title: "Ciasteczka",
          body: (
            <p>
              Używamy wyłącznie ciasteczek niezbędnych do logowania i utrzymania sesji. Nie stosujemy
              ciasteczek reklamowych ani analitycznych.
            </p>
          ),
        },
      ]}
    />
  );
}
