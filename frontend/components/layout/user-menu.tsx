"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { endSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

type UserMenuProps = {
  // TODO(krok 3): inicjały z GET /users/me.
  initials?: string;
};

export function UserMenu({ initials = "KŁ" }: UserMenuProps) {
  const router = useRouter();

  const logout = () => {
    endSession();
    router.push(ROUTES.login);
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={ROUTES.settings}
        aria-label="Konto"
        className="flex size-[38px] items-center justify-center rounded-full border border-line-dark bg-surface-dark font-mono text-[12.5px] font-semibold text-cream no-underline hover:border-fire"
      >
        {initials}
      </Link>
      <button
        type="button"
        onClick={logout}
        className="min-h-9 rounded-full px-3 text-[13px] text-muted-dark transition-colors hover:text-cream"
      >
        Wyloguj
      </button>
    </div>
  );
}
