import { Suspense } from "react";
import { Logo } from "@/components/brand/logo";
import { MainNav, MainNavFallback } from "@/components/layout/main-nav";
import { UserMenu, UserMenuFallback } from "@/components/layout/user-menu";
import { getCurrentUser } from "@/lib/api/server";
import { ROUTES } from "@/lib/routes";
import { initialsOf } from "@/lib/user";

export function TopBar() {
  return (
    <header className="border-b border-[#1a1a1a] bg-ink text-cream">
      <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-7 px-8 py-3.5">
        <Logo href={ROUTES.dashboard} tone="dark" />
        <Suspense fallback={<MainNavFallback />}>
          <MainNav />
        </Suspense>
        <Suspense fallback={<UserMenuFallback />}>
          <CurrentUserMenu />
        </Suspense>
      </div>
    </header>
  );
}

async function CurrentUserMenu() {
  const user = await getCurrentUser();
  return <UserMenu initials={initialsOf(user.name)} name={user.name} />;
}
