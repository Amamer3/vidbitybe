import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { AppPageLayout } from "@/components/layout/app-page-layout";
import { DashboardContent } from "@/features/meetings/dashboard-content";
import { StartInstantMeetingButton } from "@/features/meetings/start-instant-meeting-button";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <AppPageLayout
      title="Dashboard"
      description="Start instantly or manage your meetings"
      actionsClassName="hidden md:flex md:flex-row md:items-center md:gap-2"
      actions={
        <>
          <StartInstantMeetingButton className="w-full sm:w-auto" />
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/meetings/new">
              <CalendarPlus className="h-4 w-4" />
              Schedule meeting
            </Link>
          </Button>
        </>
      }
    >
      <DashboardContent />
    </AppPageLayout>
  );
}
