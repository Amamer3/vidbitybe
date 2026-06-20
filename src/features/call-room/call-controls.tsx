"use client";

import { useState } from "react";
import {
  useLocalParticipant,
  useParticipants,
  useRoomContext,
} from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  PhoneOff,
  MessageSquare,
  Users,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUiStore } from "@/store/ui";
import { meetingsService } from "@/services/meetings";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface CallControlsProps {
  meetingId: string;
  isHost: boolean;
  onLeave: () => void;
}

function ControlButton({
  active,
  destructive,
  label,
  onClick,
  disabled,
  children,
}: {
  active?: boolean;
  destructive?: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          disabled={disabled}
          onClick={onClick}
          className={cn(
            "h-10 w-10 rounded-full border-0 shadow-none sm:h-11 sm:w-11",
            destructive
              ? "bg-red-600 text-white hover:bg-red-500"
              : active
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-[var(--meeting-surface-elevated)] text-[var(--meeting-foreground)] hover:bg-[var(--meeting-border)]",
          )}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export function CallControls({ meetingId, isHost, onLeave }: CallControlsProps) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participantCount = useParticipants().length;
  const { chatOpen, participantsOpen, setChatOpen, setParticipantsOpen } = useUiStore();

  const handleToggleParticipants = () => {
    const opening = !participantsOpen;
    if (opening && window.innerWidth < 1024) {
      setChatOpen(false);
    }
    setParticipantsOpen(opening);
  };

  const handleToggleChat = () => {
    const opening = !chatOpen;
    if (opening && window.innerWidth < 1024) {
      setParticipantsOpen(false);
    }
    setChatOpen(opening);
  };
  const [isLeaving, setIsLeaving] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const micEnabled = localParticipant.isMicrophoneEnabled;
  const camEnabled = localParticipant.isCameraEnabled;
  const screenSharing = localParticipant.isScreenShareEnabled;

  const toggleMic = async () => {
    await localParticipant.setMicrophoneEnabled(!micEnabled);
  };

  const toggleCam = async () => {
    await localParticipant.setCameraEnabled(!camEnabled);
  };

  const toggleScreenShare = async () => {
    await localParticipant.setScreenShareEnabled(!screenSharing, { audio: true });
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await meetingsService.leave(meetingId);
    } catch {
      // proceed with disconnect
    } finally {
      room.disconnect();
      toast.info("Left meeting");
      onLeave();
    }
  };

  const handleEndMeeting = async () => {
    if (!isHost) return;
    setIsEnding(true);
    try {
      await meetingsService.end(meetingId);
      room.disconnect();
      toast.success("Meeting ended for everyone");
      onLeave();
    } catch {
      toast.error("Could not end meeting");
      setIsEnding(false);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-2 pb-safe pt-12 sm:px-4 sm:pt-16">
        <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-2xl border border-[var(--meeting-border)] bg-[var(--meeting-surface)]/95 px-2 py-2 shadow-2xl shadow-black/40 backdrop-blur-md sm:gap-3 sm:px-4 sm:py-2.5">
          <ControlButton
            label={micEnabled ? "Mute microphone" : "Unmute microphone"}
            destructive={!micEnabled}
            onClick={toggleMic}
          >
            {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </ControlButton>

          <ControlButton
            label={camEnabled ? "Turn off camera" : "Turn on camera"}
            destructive={!camEnabled}
            onClick={toggleCam}
          >
            {camEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </ControlButton>

          <ControlButton
            label={screenSharing ? "Stop sharing" : "Share screen"}
            active={screenSharing}
            onClick={toggleScreenShare}
          >
            <MonitorUp className="h-5 w-5" />
          </ControlButton>

          <div className="mx-1 hidden h-8 w-px bg-[var(--meeting-border)] sm:block" />

          <ControlButton
            label="Participants"
            active={participantsOpen}
            onClick={handleToggleParticipants}
          >
            <span className="relative">
              <Users className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {participantCount}
              </span>
            </span>
          </ControlButton>

          <ControlButton label="Chat" active={chatOpen} onClick={handleToggleChat}>
            <MessageSquare className="h-5 w-5" />
          </ControlButton>

          <div className="mx-1 hidden h-8 w-px bg-[var(--meeting-border)] sm:block" />

          <ControlButton
            label="Leave meeting"
            destructive
            onClick={handleLeave}
            disabled={isLeaving}
          >
            <PhoneOff className="h-5 w-5" />
          </ControlButton>

          {isHost && (
            <Button
              variant="destructive"
              size="sm"
              disabled={isEnding}
              onClick={handleEndMeeting}
              className="h-10 rounded-full px-3 sm:h-11 sm:px-4"
              aria-label="End meeting for all"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden min-[400px]:inline">
                {isEnding ? "Ending..." : "End for all"}
              </span>
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
