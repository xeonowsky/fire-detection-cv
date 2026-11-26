/** Błąd całego formularza, np. odpowiedź serwera. Nic nie renderuje, gdy brak błędu. */
export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-xl border-2 border-fire-strong bg-fire-soft px-4 py-3 text-sm font-semibold text-fire-deep"
    >
      {message}
    </p>
  );
}
