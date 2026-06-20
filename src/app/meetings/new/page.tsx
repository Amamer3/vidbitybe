import { AppPageLayout } from "@/components/layout/app-page-layout";
import { CreateMeetingForm } from "@/features/meetings/create-meeting-form";

export default function NewMeetingPage() {
  return (
    <AppPageLayout
      title="New meeting"
      description="Schedule or start an instant meeting"
    >
      <CreateMeetingForm />
    </AppPageLayout>
  );
}
