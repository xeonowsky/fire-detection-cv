import type { ReactNode } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-paper">
      <TopBar />
      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-6 px-8 pt-7 pb-14">
        {children}
      </main>
      <Footer variant="compact" />
    </div>
  );
}
