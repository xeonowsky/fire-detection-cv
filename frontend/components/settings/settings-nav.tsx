export const SETTINGS_SECTIONS = [
  { id: "profil", label: "Profil" },
  { id: "bezpieczenstwo", label: "Bezpieczeństwo" },
  { id: "powiadomienia", label: "Powiadomienia" },
  { id: "analiza", label: "Preferencje analizy" },
  { id: "prywatnosc", label: "Dane i prywatność" },
  { id: "konto", label: "Usuwanie konta" },
] as const;

export function SettingsNav() {
  return (
    <nav aria-label="Sekcje ustawień" className="lg:sticky lg:top-6 lg:self-start">
      <ol className="flex list-none flex-wrap gap-1 p-0 lg:flex-col">
        {SETTINGS_SECTIONS.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="flex gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-body no-underline hover:bg-white hover:text-ink"
            >
              <span className="font-mono text-fire-strong">{String(index + 1).padStart(2, "0")}</span>
              {section.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
