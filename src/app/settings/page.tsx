import { AppPageLayout } from "@/components/layout/app-page-layout";
import { SettingsForm } from "@/features/settings/settings-form";

export default function SettingsPage() {
  return (
    <AppPageLayout title="Settings" description="Manage your account preferences">
      <SettingsForm />
    </AppPageLayout>
  );
}
