import { ProtectedRoute } from "@/components/providers/auth-provider";
import { AppHeader } from "@/components/layout/app-header";
import { SettingsForm } from "@/features/settings/settings-form";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <AppHeader />
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences</p>
        </div>
        <SettingsForm />
      </main>
    </ProtectedRoute>
  );
}
