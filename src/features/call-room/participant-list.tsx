"use client";

import { useState } from "react";
import { useParticipants } from "@livekit/components-react";
import { MicOff, UserMinus, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert } from "@/components/ui/alert";
import { meetingsService } from "@/services/meetings";
import { useUiStore } from "@/store/ui";
import { ApiError } from "@/types/api";
import { cn } from "@/lib/utils";

interface ParticipantListProps {
  meetingId: string;
  isHost: boolean;
}

export function ParticipantList({ meetingId, isHost }: ParticipantListProps) {
  const participants = useParticipants();
  const { toggleParticipants } = useUiStore();
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleMute = async (identity: string) => {
    setError(null);
    setLoadingId(identity);
    try {
      await meetingsService.muteParticipant(meetingId, identity);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to mute participant.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleRemove = async (identity: string) => {
    setError(null);
    setLoadingId(identity);
    try {
      await meetingsService.removeParticipant(meetingId, identity);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to remove participant.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <aside className="flex h-full w-full flex-col border-l border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div>
          <h3 className="font-semibold text-zinc-100">Participants</h3>
          <p className="text-xs text-zinc-500">{participants.length} in call</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleParticipants}
          className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 lg:hidden"
          aria-label="Close participants panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {error && <Alert variant="destructive">{error}</Alert>}

        {participants.map((p) => {
          const name = p.name || p.identity;
          const isMuted = !p.isMicrophoneEnabled;

          return (
            <div
              key={p.identity}
              className="flex items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-9 w-9 ring-2 ring-zinc-800">
                  <AvatarFallback className="bg-primary/20 text-xs text-primary">
                    {name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-100">
                    {name}
                    {p.isLocal ? " (You)" : ""}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      isMuted ? "text-red-400" : "text-emerald-400",
                    )}
                  >
                    {isMuted ? "Muted" : "Active"}
                  </p>
                </div>
              </div>

              {isHost && !p.isLocal && (
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                    disabled={loadingId === p.identity}
                    onClick={() => handleMute(p.identity)}
                    title="Mute participant"
                  >
                    <VolumeX className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    disabled={loadingId === p.identity}
                    onClick={() => handleRemove(p.identity)}
                    title="Remove participant"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {isMuted && (!isHost || p.isLocal) && (
                <MicOff className="h-4 w-4 shrink-0 text-zinc-500" />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
