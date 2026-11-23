import { ButtonLink } from "@/components/ui/button";
import { DisplayHeading } from "@/components/ui/typography";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 bg-ink px-8 py-24 text-center text-cream">
      <span className="font-mono text-sm text-fire">404</span>
      <DisplayHeading lead="Tu nic się" accent="nie pali." size="md" />
      <p className="max-w-md text-muted-dark">Ta strona nie istnieje albo została przeniesiona.</p>
      <ButtonLink href={ROUTES.home}>Wróć na stronę główną</ButtonLink>
    </main>
  );
}
