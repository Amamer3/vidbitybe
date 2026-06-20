import { ProtectedRoute } from "@/components/providers/auth-provider";
import { MeetingRoom } from "@/features/call-room/meeting-room";

interface MeetingPageProps {
  params: Promise<{ code: string }>;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { code } = await params;

  return (
    <ProtectedRoute>
      <MeetingRoom meetingCode={code} />
    </ProtectedRoute>
  );
}
