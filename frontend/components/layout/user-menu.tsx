"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { endSession } from "@/lib/auth/session";
import { ROUTES } from "@/lib/routes";

const avatarClass =
  "flex size-[38px] items-center justify-center rounded-full border border-line-dark bg-surface-dark font-mono text-[12.5px] font-semibold text-cream no-underline";

export function UserMenu({ initials, name }: { initials: string; name: string }) {
  const router = useRouter();

  const logout = () => {
    endSession();
    router.replace(ROUTES.login);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={ROUTES.settings}
        aria-label={`Konto: ${name}`}
        title={name}
        className={`${avatarClass} hover:border-fire`}
      >
        {initials || "?"}
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

export function UserMenuFallback() {
  return <span aria-hidden="true" className={`${avatarClass} animate-pulse`} />;
}
