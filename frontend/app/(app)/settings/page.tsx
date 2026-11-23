import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { Placeholder } from "@/components/layout/placeholder";

export const metadata: Metadata = { title: "Konto" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Konto" description="Dane, hasło i ustawienia konta." />
      <Placeholder step={6}>Edycja danych, zmiana hasła, usunięcie konta.</Placeholder>
    </>
  );
}
