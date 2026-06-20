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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUiStore } from "@/store/ui";
import { meetingsService } from "@/services/meetings";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface CallControlsProps {
  meetingId: string;
  isHost: boolean;
}

function ControlButton({
  active,
  destructive,
  label,
  onClick,
  disabled,
  badge,
  children,
}: {
  active?: boolean;
  destructive?: boolean;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: number;
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
            "h-12 w-12 rounded-full border-0 shadow-none sm:h-14 sm:w-14",
            destructive
              ? "bg-red-600 text-white hover:bg-red-500"
              : active
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-zinc-700 text-white hover:bg-zinc-600",
          )}
        >
          <span className="relative">
            {children}
            {badge != null && badge > 0 ? (
              <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                {badge > 99 ? "99+" : badge}
              </span>
            ) : null}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

export function CallControls({ meetingId, isHost }: CallControlsProps) {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const participantCount = useParticipants().length;
  const { chatOpen, participantsOpen, unreadChatCount, setChatOpen, setParticipantsOpen, clearUnread } =
    useUiStore();

  const [isLeaving, setIsLeaving] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [endDialogOpen, setEndDialogOpen] = useState(false);

  const micEnabled = localParticipant.isMicrophoneEnabled;
  const camEnabled = localParticipant.isCameraEnabled;
  const screenSharing = localParticipant.isScreenShareEnabled;

  const handleToggleParticipants = () => {
    const opening = !participantsOpen;
    if (opening && window.innerWidth < 1024) setChatOpen(false);
    setParticipantsOpen(opening);
  };

  const handleToggleChat = () => {
    const opening = !chatOpen;
    if (opening && window.innerWidth < 1024) setParticipantsOpen(false);
    if (opening) clearUnread();
    setChatOpen(opening);
  };

  const toggleMic = async () => {
    try {
      await localParticipant.setMicrophoneEnabled(!micEnabled);
    } catch {
      toast.error("Could not toggle microphone");
    }
  };

  const toggleCam = async () => {
    try {
      await localParticipant.setCameraEnabled(!camEnabled);
    } catch {
      toast.error("Could not toggle camera");
    }
  };

  const toggleScreenShare = async () => {
    try {
      await localParticipant.setScreenShareEnabled(!screenSharing, { audio: true });
    } catch {
      toast.error("Could not toggle screen share");
    }
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await meetingsService.leave(meetingId);
    } catch {
      // proceed regardless
    }
    toast.info("Left meeting");
    room.disconnect();
  };

  const handleEndMeeting = async () => {
    setEndDialogOpen(false);
    setIsEnding(true);
    try {
      await meetingsService.end(meetingId);
      toast.success("Meeting ended for everyone");
      room.disconnect();
    } catch {
      toast.error("Could not end meeting");
      setIsEnding(false);
    }
  };

  return (
    <>
      <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End meeting for everyone?</DialogTitle>
            <DialogDescription>
              This will disconnect all participants and close the meeting. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEndDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleEndMeeting()}>
              End for all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TooltipProvider delayDuration={300}>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-safe pt-8">
          <div className="pointer-events-auto flex max-w-full flex-wrap items-center justify-center gap-2 sm:gap-3">
            <ControlButton
              label={micEnabled ? "Mute microphone" : "Unmute microphone"}
              destructive={!micEnabled}
              onClick={() => void toggleMic()}
            >
              {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </ControlButton>

            <ControlButton
              label={camEnabled ? "Turn off camera" : "Turn on camera"}
              destructive={!camEnabled}
              onClick={() => void toggleCam()}
            >
              {camEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </ControlButton>

            <ControlButton
              label={screenSharing ? "Stop sharing" : "Share screen"}
              active={screenSharing}
              onClick={() => void toggleScreenShare()}
            >
              <MonitorUp className="h-5 w-5" />
            </ControlButton>

            <div className="mx-1 hidden h-10 w-px bg-zinc-700 sm:block" />

            <ControlButton
              label="Participants"
              active={participantsOpen}
              badge={participantCount}
              onClick={handleToggleParticipants}
            >
              <Users className="h-5 w-5" />
            </ControlButton>

            <ControlButton
              label="Chat"
              active={chatOpen}
              badge={unreadChatCount}
              onClick={handleToggleChat}
            >
              <MessageSquare className="h-5 w-5" />
            </ControlButton>

            <div className="mx-1 hidden h-10 w-px bg-zinc-700 sm:block" />

            <ControlButton
              label="Leave meeting"
              destructive
              onClick={() => void handleLeave()}
              disabled={isLeaving}
            >
              <PhoneOff className="h-5 w-5" />
            </ControlButton>

            {isHost && (
              <Button
                variant="destructive"
                size="sm"
                disabled={isEnding}
                onClick={() => setEndDialogOpen(true)}
                className="h-12 rounded-full bg-red-600 px-4 hover:bg-red-500 sm:h-14"
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
    </>
  );
}
