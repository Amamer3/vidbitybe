"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { VideoGrid } from "@/features/call-room/video-grid";
import { CallControls } from "@/features/call-room/call-controls";
import { ParticipantList } from "@/features/call-room/participant-list";
import { ChatPanel } from "@/features/call-room/chat-panel";
import { MeetingTopBar } from "@/features/call-room/meeting-top-bar";
import { meetingsService } from "@/services/meetings";
import { useAuthStore } from "@/store/auth";
import { useUiStore } from "@/store/ui";
import type { Meeting } from "@/types/meeting";
import { ApiError } from "@/types/api";
import { cn } from "@/lib/utils";

interface MeetingRoomProps {
  meetingCode: string;
}

function RoomContent({
  meeting,
  onLeave,
}: {
  meeting: Meeting;
  onLeave: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const { chatOpen, participantsOpen } = useUiStore();
  const isHost = user?.id === meeting.hostId;
  const sidePanelOpen = participantsOpen || chatOpen;

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      <MeetingTopBar meeting={meeting} isHost={isHost} />

      <div className="relative flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col pb-24 sm:pb-28">
            <div className="flex min-h-0 flex-1 p-2 sm:p-4">
              <VideoGrid />
            </div>
            <CallControls meetingId={meeting.code} isHost={isHost} onLeave={onLeave} />
          </div>
        </div>

        {sidePanelOpen && (
          <button
            type="button"
            aria-label="Close panels"
            className="absolute inset-0 z-10 bg-black/50 lg:hidden"
            onClick={() => {
              if (participantsOpen) useUiStore.getState().setParticipantsOpen(false);
              if (chatOpen) useUiStore.getState().setChatOpen(false);
            }}
          />
        )}

        <div
          className={cn(
            "z-20 flex shrink-0 transition-all duration-300 ease-out",
            "fixed inset-y-0 right-0 w-[min(100vw,20rem)] shadow-2xl lg:relative lg:inset-auto lg:shadow-none",
            participantsOpen ? "translate-x-0" : "translate-x-full lg:w-0 lg:overflow-hidden lg:opacity-0",
          )}
        >
          {participantsOpen && (
            <ParticipantList meetingId={meeting.code} isHost={isHost} />
          )}
        </div>

        <div
          className={cn(
            "z-20 flex shrink-0 transition-all duration-300 ease-out",
            "fixed inset-y-0 right-0 w-[min(100vw,22rem)] shadow-2xl lg:relative lg:inset-auto lg:shadow-none",
            chatOpen ? "translate-x-0" : "translate-x-full lg:w-0 lg:overflow-hidden lg:opacity-0",
          )}
        >
          {chatOpen && <ChatPanel />}
        </div>
      </div>

      <RoomAudioRenderer />
    </div>
  );
}

export function MeetingRoom({ meetingCode }: MeetingRoomProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function joinMeeting() {
      try {
        const { meeting: meetingData } =
          await meetingsService.getByCodeOrId(meetingCode);

        if (meetingData.status === "ended") {
          throw new ApiError("This meeting has ended.", 400);
        }

        setMeeting(meetingData);

        const isHost = user?.id === meetingData.hostId;
        let activeMeeting = meetingData;

        if (isHost && meetingData.status === "scheduled") {
          const { meeting: started } = await meetingsService.start(meetingData.code);
          activeMeeting = started;
          setMeeting(started);
        }

        const tokenData = await meetingsService.getToken(activeMeeting.code);
        setToken(tokenData.livekitToken);
        setLivekitUrl(
          tokenData.livekitUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || "",
        );
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to join meeting.");
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      joinMeeting();
    }
  }, [meetingCode, user]);

  const handleLeave = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-zinc-950">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-zinc-400">Joining meeting...</p>
      </div>
    );
  }

  if (error || !meeting || !token || !livekitUrl) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 p-6">
        <Alert variant="destructive" className="max-w-lg">
          {error ?? "Unable to connect to meeting."}
        </Alert>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      connect={true}
      audio={true}
      video={true}
      onDisconnected={handleLeave}
      data-lk-theme="default"
      className="h-screen"
    >
      <RoomContent meeting={meeting} onLeave={handleLeave} />
    </LiveKitRoom>
  );
}
