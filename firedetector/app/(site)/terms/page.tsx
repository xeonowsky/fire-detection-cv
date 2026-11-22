import type { Metadata } from "next";
import Link from "next/link";
import { EmergencyNotice } from "@/components/site/emergency-notice";
import { LegalPage, MissingInfo } from "@/components/site/legal-page";
import { DisplayHeading } from "@/components/ui/typography";
import { ROUTES } from "@/lib/routes";
import { ANALYSIS_LIMITS } from "@/lib/site";

export const metadata: Metadata = { title: "Regulamin" };

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Regulamin"
      title={<DisplayHeading lead="Regulamin" accent="serwisu." />}
      updated="22.11.2026"
      intro={
        <p>
          Zasady korzystania z fireDetector: kto może założyć konto, jakie nagrania można przesyłać i jak
          interpretować wyniki analizy. Wersja robocza, do weryfikacji przed publikacją.
        </p>
      }
      sections={[
        {
          id: "postanowienia",
          title: "Postanowienia ogólne",
          body: (
            <>
              <p>
                Serwis fireDetector służy do analizy nagrań wideo pod kątem obecności ognia i dymu oraz do
                orientacyjnej oceny zagrożenia pożarowego.
              </p>
              <p>
                Usługodawcą jest <MissingInfo>nazwa i adres usługodawcy</MissingInfo>. Kontakt:{" "}
                <Link href={ROUTES.contact}>formularz kontaktowy</Link>.
              </p>
            </>
          ),
        },
        {
          id: "konto",
          title: "Konto użytkownika",
          body: (
            <ul>
              <li>Do korzystania z analizy potrzebne jest konto założone adresem email i hasłem.</li>
              <li>Użytkownik odpowiada za poufność swojego hasła i działania wykonane na koncie.</li>
              <li>
                Konto można w każdej chwili usunąć w ustawieniach; razem z nim usuwane są nagrania i wyniki.
              </li>
            </ul>
          ),
        },
        {
          id: "nagrania",
          title: "Przesyłane nagrania",
          body: (
            <ul>
              <li>
                Obsługiwane formaty: {ANALYSIS_LIMITS.acceptedFormats.join(", ")}. Maksymalna długość
                nagrania: {ANALYSIS_LIMITS.maxDurationLabel} min.
              </li>
              <li>
                Użytkownik przesyła wyłącznie nagrania, do których ma prawa, i nie narusza nimi praw osób
                trzecich.
              </li>
              <li>Zabronione jest przesyłanie treści niezgodnych z prawem.</li>
            </ul>
          ),
        },
        {
          id: "wyniki",
          title: "Charakter wyników analizy",
          body: (
            <>
              <p>
                Wynik analizy jest generowany automatycznie przez model uczenia maszynowego i ma charakter
                pomocniczy. Może zawierać błędy, w tym fałszywe alarmy i pominięte detekcje.
              </p>
              <EmergencyNotice title="fireDetector nie zastępuje systemów przeciwpożarowych ani służb ratunkowych." />
            </>
          ),
        },
        {
          id: "odpowiedzialnosc",
          title: "Odpowiedzialność",
          body: (
            <p>
              Usługodawca dokłada starań, aby serwis działał poprawnie, ale nie odpowiada za decyzje podjęte
              wyłącznie na podstawie wyniku analizy.{" "}
              <MissingInfo>zakres odpowiedzialności do uzgodnienia</MissingInfo>
            </p>
          ),
        },
        {
          id: "zmiany",
          title: "Zmiany regulaminu",
          body: (
            <p>
              O zmianach regulaminu informujemy zalogowanych użytkowników z wyprzedzeniem co najmniej{" "}
              <MissingInfo>liczba dni</MissingInfo> dni. Aktualna wersja jest zawsze dostępna na tej stronie.
            </p>
          ),
        },
      ]}
    />
  );
}
