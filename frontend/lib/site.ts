export const SITE = {
  name: "fireDetector",
  title: "fireDetector — ocena pożaru z nagrania",
  description:
    "Inteligentna analiza nagrań wideo, która wykrywa ogień i dym, ocenia skalę zagrożenia i pokazuje dokładnie, gdzie i kiedy się pojawiło.",
  tagline: "Nowoczesne narzędzie do oceny zagrożenia pożarowego na podstawie nagrań.",
  copyrightYear: 2026,
  version: "0.1",
  emergencyNumbers: ["112", "998"],
} as const;

// Limity ze specyfikacji: film do 4:30 min, wynik w ciągu 2 min.
export const ANALYSIS_LIMITS = {
  maxDurationSeconds: 270,
  maxDurationLabel: "4:30",
  maxProcessingMinutes: 2,
  maxFileMegabytes: 1024,
  acceptedFormats: ["MP4", "MOV", "AVI"],
  acceptedExtensions: [".mp4", ".mov", ".avi"],
} as const;
