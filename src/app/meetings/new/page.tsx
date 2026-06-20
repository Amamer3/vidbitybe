import { ProtectedRoute } from "@/components/providers/auth-provider";
import { AppHeader } from "@/components/layout/app-header";
import { CreateMeetingForm } from "@/features/meetings/create-meeting-form";

export default function NewMeetingPage() {
  return (
    <ProtectedRoute>
      <AppHeader />
      <main className="mx-auto max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl">New meeting</h1>
          <p className="text-muted-foreground">Schedule or start an instant meeting</p>
        </div>
        <CreateMeetingForm />
      </main>
    </ProtectedRoute>
  );
}
