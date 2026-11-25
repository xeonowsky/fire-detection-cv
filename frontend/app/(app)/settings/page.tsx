import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { PageLoading } from "@/components/layout/page-loading";
import { AnalysisPreferencesSection } from "@/components/settings/analysis-preferences-section";
import { DangerZone } from "@/components/settings/danger-zone";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { PrivacySection } from "@/components/settings/privacy-section";
import { ProfileSection } from "@/components/settings/profile-section";
import { SecuritySection } from "@/components/settings/security-section";
import { SettingsNav } from "@/components/settings/settings-nav";
import { getCurrentUser } from "@/lib/api/server";

export const metadata: Metadata = { title: "Ustawienia konta" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="konto / ustawienia"
        title="Ustawienia konta"
        description="Profil, bezpieczeństwo, powiadomienia i dane."
      />
      <Suspense fallback={<PageLoading />}>
        <SettingsContent />
      </Suspense>
    </>
  );
}

async function SettingsContent() {
  const user = await getCurrentUser();

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <SettingsNav />
      <div className="flex min-w-0 flex-col gap-6">
        <ProfileSection user={user} />
        <SecuritySection />
        <NotificationsSection />
        <AnalysisPreferencesSection />
        <PrivacySection />
        <DangerZone email={user.email} />
      </div>
    </div>
  );
}
