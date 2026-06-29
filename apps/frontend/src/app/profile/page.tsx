import { AppShell } from "@/components/layout/app-shell";
import { ProfileManager } from "@/components/modules/profile-manager";
import { getProfileOverview } from "@/lib/api";

export default async function ProfilePage() {
  const overview = await getProfileOverview();

  return (
    <AppShell eyebrow="Account" title="Profile">
      <ProfileManager initialOverview={overview} />
    </AppShell>
  );
}
