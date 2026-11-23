import type { ReactNode } from "react";
import { Footer } from "@/components/layout/footer";
import { SiteHeader } from "@/components/site/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-paper">
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </div>
  );
}
