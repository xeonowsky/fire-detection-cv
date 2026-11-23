import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { SiteHeader } from "@/components/site/site-header";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
