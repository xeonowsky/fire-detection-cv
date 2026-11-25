import { API_URL, ApiError, NETWORK_ERROR, errorMessage } from "@/lib/api/client";
import type { Analysis } from "@/lib/api/types";

type UploadOptions = {
  token: string;
  file: File;
  name?: string;
  /** Postęp wysyłania 0–1. */
  onProgress?: (ratio: number) => void;
  signal?: AbortSignal;
};

/** Wysyła film na POST /analyses. XMLHttpRequest zamiast fetch, bo tylko on raportuje postęp wysyłania. */
export function uploadVideo({ token, file, name, onProgress, signal }: UploadOptions): Promise<Analysis> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_URL}/analyses`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onload = () => {
      let payload: unknown = null;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        // Odpowiedź bez JSON-a obsługuje errorMessage.
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(payload as Analysis);
      else reject(new ApiError(xhr.status, errorMessage(xhr.status, payload)));
    };
    xhr.onerror = () => reject(new ApiError(0, NETWORK_ERROR));
    xhr.onabort = () => reject(new DOMException("Wysyłanie anulowane.", "AbortError"));
    signal?.addEventListener("abort", () => xhr.abort(), { once: true });

    const form = new FormData();
    form.append("file", file);
    if (name) form.append("name", name);
    xhr.send(form);
  });
}
