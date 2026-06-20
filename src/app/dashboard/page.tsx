import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { ProtectedRoute } from "@/components/providers/auth-provider";
import { AppHeader } from "@/components/layout/app-header";
import { DashboardContent } from "@/features/meetings/dashboard-content";
import { StartInstantMeetingButton } from "@/features/meetings/start-instant-meeting-button";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppHeader />
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Start instantly or manage your meetings</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <StartInstantMeetingButton className="w-full sm:w-auto" />
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/meetings/new">
                <CalendarPlus className="h-4 w-4" />
                Schedule meeting
              </Link>
            </Button>
          </div>
        </div>
        <DashboardContent />
      </main>
    </ProtectedRoute>
  );
}
