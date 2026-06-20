"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DisconnectReason, RoomEvent } from "livekit-client";
import { LiveKitRoom, RoomAudioRenderer, useRoomContext } from "@livekit/components-react";
import type { LocalUserChoices } from "@livekit/components-core";
import "@livekit/components-styles";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { VideoGrid } from "@/features/call-room/video-grid";
import { CallControls } from "@/features/call-room/call-controls";
import { ParticipantList } from "@/features/call-room/participant-list";
import { ChatPanel } from "@/features/call-room/chat-panel";
import { MeetingTopBar } from "@/features/call-room/meeting-top-bar";
import { MeetingReadyCard } from "@/features/call-room/meeting-ready-card";
import { PreJoinLobby } from "@/features/call-room/pre-join-lobby";
import { meetingsService } from "@/services/meetings";
import { useAuthStore } from "@/store/auth";
import { useUiStore } from "@/store/ui";
import type { Meeting } from "@/types/meeting";
import { ApiError } from "@/types/api";
import { API_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MeetingRoomProps {
  meetingCode: string;
}

function ReconnectingOverlay() {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70 backdrop-blur-sm">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-white">Reconnecting…</p>
    </div>
  );
}

function RoomContent({
  meeting,
  speakerDeviceId,
  onLeave,
}: {
  meeting: Meeting;
  speakerDeviceId: string;
  onLeave: () => void;
}) {
  const room = useRoomContext();
  const user = useAuthStore((s) => s.user);
  const { chatOpen, participantsOpen } = useUiStore();
  const isHost = user?.id === meeting.hostId;
  const sidePanelOpen = participantsOpen || chatOpen;
  const [readyCardOpen, setReadyCardOpen] = useState(isHost);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Apply the speaker output device chosen in the lobby
  useEffect(() => {
    if (!speakerDeviceId) return;
    room.switchActiveDevice("audiooutput", speakerDeviceId).catch(() => {});
  }, [room, speakerDeviceId]);

  // Handle reconnection events and distinguish intentional disconnects
  useEffect(() => {
    const handleReconnecting = () => setIsReconnecting(true);
    const handleReconnected = () => setIsReconnecting(false);
    const handleDisconnected = (reason?: DisconnectReason) => {
      setIsReconnecting(false);
      if (reason !== DisconnectReason.CLIENT_INITIATED) {
        // LiveKit exhausted its reconnect retries — inform the user
        const { toast } = require("@/lib/toast") as typeof import("@/lib/toast");
        toast.error("Connection lost. Returning to dashboard.");
      }
      onLeave();
    };

    room.on(RoomEvent.Reconnecting, handleReconnecting);
    room.on(RoomEvent.Reconnected, handleReconnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    return () => {
      room.off(RoomEvent.Reconnecting, handleReconnecting);
      room.off(RoomEvent.Reconnected, handleReconnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room, onLeave]);

  // Fire the leave API when the user closes the tab or navigates away
  useEffect(() => {
    const handleBeforeUnload = () => {
      const token = useAuthStore.getState().accessToken;
      fetch(`${API_URL}/meetings/${meeting.code}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        keepalive: true,
      });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [meeting.code]);

  return (
    <div className="meeting-room relative flex h-dvh flex-col overflow-hidden bg-[#202124]">
      {isReconnecting && <ReconnectingOverlay />}

      <MeetingTopBar meeting={meeting} />

      <div className="relative flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 flex-col pb-24 sm:pb-28">
            <VideoGrid />
            <CallControls meetingId={meeting.code} isHost={isHost} />
          </div>

          {readyCardOpen && isHost ? (
            <div className="pointer-events-none absolute bottom-24 left-3 z-20 sm:bottom-28 sm:left-5">
              <MeetingReadyCard
                meetingCode={meeting.code}
                userEmail={user?.email}
                onClose={() => setReadyCardOpen(false)}
              />
            </div>
          ) : null}
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
            participantsOpen
              ? "translate-x-0"
              : "translate-x-full lg:w-0 lg:overflow-hidden lg:opacity-0",
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
            chatOpen
              ? "translate-x-0"
              : "translate-x-full lg:w-0 lg:overflow-hidden lg:opacity-0",
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
  const [userChoices, setUserChoices] = useState<LocalUserChoices | null>(null);
  const [speakerDeviceId, setSpeakerDeviceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  // Reset chat messages when leaving the room
  const clearChatMessages = useUiStore((s) => s.clearChatMessages);
  const clearUiPanels = useRef(() => {
    useUiStore.getState().setChatOpen(false);
    useUiStore.getState().setParticipantsOpen(false);
    useUiStore.getState().clearChatMessages();
  });

  // Fetch only the meeting metadata here; the LiveKit token is fetched at join
  // time in handlePreJoin so it cannot expire while the user sits in the lobby.
  useEffect(() => {
    async function prepareMeeting() {
      try {
        const { meeting: meetingData } = await meetingsService.getByCodeOrId(meetingCode);

        if (meetingData.status === "ended") {
          throw new ApiError("This meeting has ended.", 400);
        }

        setMeeting(meetingData);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load meeting.");
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      void prepareMeeting();
    }
  }, [meetingCode, user]);

  const handlePreJoin = async (choices: LocalUserChoices, selectedSpeakerId: string) => {
    if (!meeting || !user) return;

    setIsJoining(true);
    setError(null);

    try {
      const isHost = user.id === meeting.hostId;

      // Guests cannot join a meeting the host hasn't started yet
      if (!isHost && meeting.status === "scheduled") {
        setError("The host hasn't started this meeting yet. Please try again shortly.");
        return;
      }

      // Host starts the meeting on first join
      if (isHost && meeting.status === "scheduled") {
        const { meeting: started } = await meetingsService.start(meeting.code);
        setMeeting(started);
      }

      // Fetch the LiveKit token only now — prevents expiry during lobby wait
      const tokenData = await meetingsService.getToken(meeting.code);
      setToken(tokenData.livekitToken);
      setLivekitUrl(tokenData.livekitUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || "");

      setSpeakerDeviceId(selectedSpeakerId);
      setUserChoices(choices);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to join meeting.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = () => {
    clearUiPanels.current();
    router.push("/dashboard");
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`.trim() || user.email
    : "Guest";

  if (isLoading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-zinc-500">Preparing meeting…</p>
      </div>
    );
  }

  if (error && !userChoices) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white p-4 sm:p-6">
        <Alert variant="destructive" className="max-w-lg">
          {error}
        </Alert>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white p-4 sm:p-6">
        <Alert variant="destructive" className="max-w-lg">
          Unable to load meeting.
        </Alert>
      </div>
    );
  }

  if (!userChoices) {
    return (
      <PreJoinLobby
        meetingTitle={meeting.title}
        meetingCode={meeting.code}
        displayName={displayName}
        firstName={user?.firstName ?? "U"}
        lastName={user?.lastName ?? ""}
        isHost={user?.id === meeting.hostId}
        joinError={error}
        isJoining={isJoining}
        onJoin={(choices, spkId) => void handlePreJoin(choices, spkId)}
      />
    );
  }

  // Show a connecting spinner while the token is being fetched after lobby submit
  if (!token || !livekitUrl) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-zinc-500">Connecting…</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={livekitUrl}
      connect={true}
      audio={
        userChoices.audioEnabled
          ? { deviceId: userChoices.audioDeviceId || undefined }
          : false
      }
      video={
        userChoices.videoEnabled
          ? { deviceId: userChoices.videoDeviceId || undefined }
          : false
      }
      data-lk-theme="default"
      className="h-dvh"
    >
      <RoomContent
        meeting={meeting}
        speakerDeviceId={speakerDeviceId}
        onLeave={handleLeave}
      />
    </LiveKitRoom>
  );
}
