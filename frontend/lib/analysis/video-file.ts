import { ANALYSIS_LIMITS } from "@/lib/site";

const BYTES_PER_MB = 1024 * 1024;

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot).toLowerCase();
}

/** Te same reguły co w API; sprawdzamy wcześniej, żeby nie wysyłać na próżno dużego pliku. */
export function validateVideoFile(file: File): string | null {
  const extensions: readonly string[] = ANALYSIS_LIMITS.acceptedExtensions;
  if (!extensions.includes(fileExtension(file.name))) {
    return `Nieobsługiwany format. Dozwolone: ${ANALYSIS_LIMITS.acceptedFormats.join(", ")}.`;
  }
  if (file.size > ANALYSIS_LIMITS.maxFileMegabytes * BYTES_PER_MB) {
    return `Plik jest większy niż ${ANALYSIS_LIMITS.maxFileMegabytes} MB.`;
  }
  return null;
}

export function durationError(seconds: number | null): string | null {
  if (seconds !== null && seconds > ANALYSIS_LIMITS.maxDurationSeconds) {
    return `Film trwa za długo. Maksymalna długość to ${ANALYSIS_LIMITS.maxDurationLabel} min.`;
  }
  return null;
}

/** Odtwarzanie w przeglądarce: MP4 i MOV tak, AVI zwykle nie. */
export function canPreview(file: File): boolean {
  return fileExtension(file.name) !== ".avi";
}

/** Długość filmu z metadanych; null, gdy przeglądarka nie potrafi go odczytać (np. AVI) — wtedy sprawdzi API. */
export function readVideoDuration(url: string, timeoutMs = 5000): Promise<number | null> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const finish = (value: number | null) => {
      clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    video.preload = "metadata";
    video.onloadedmetadata = () => finish(Number.isFinite(video.duration) ? video.duration : null);
    video.onerror = () => finish(null);
    video.src = url;
  });
}

export function formatFileSize(bytes: number): string {
  const megabytes = bytes / BYTES_PER_MB;
  return megabytes >= 1 ? `${megabytes.toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
