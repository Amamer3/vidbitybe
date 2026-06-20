"use client";

import { useMemo } from "react";
import { Track } from "livekit-client";
import {
  useParticipants,
  useTracks,
  VideoTrack,
  AudioTrack,
} from "@livekit/components-react";
import { MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

function ParticipantTile({
  trackRef,
  name,
  isLocal,
  isMuted,
  fillContainer,
}: {
  trackRef: ReturnType<typeof useTracks>[number];
  name: string;
  isLocal: boolean;
  isMuted: boolean;
  fillContainer?: boolean;
}) {
  const hasVideoTrack =
    trackRef.publication !== undefined &&
    trackRef.publication.kind === Track.Kind.Video &&
    !trackRef.publication.isMuted;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-zinc-900 ring-1 ring-zinc-800/80",
        fillContainer ? "h-full min-h-0 w-full" : "aspect-video w-full",
      )}
    >
      {hasVideoTrack ? (
        <VideoTrack
          trackRef={trackRef as Parameters<typeof VideoTrack>[0]["trackRef"]}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full min-h-[12rem] items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-semibold text-primary ring-4 ring-primary/10 sm:h-24 sm:w-24 sm:text-3xl">
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-8">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-white">
            {name}
            {isLocal ? " (You)" : ""}
          </span>
          {isMuted && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-200">
              <MicOff className="h-3 w-3" />
              Muted
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function VideoGrid() {
  const participants = useParticipants();
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const audioTracks = useTracks([{ source: Track.Source.Microphone, withPlaceholder: false }], {
    onlySubscribed: true,
  });

  const visibleTracks = tracks.filter(
    (trackRef) => trackRef.publication || trackRef.source === Track.Source.Camera,
  );

  const participantCount = Math.max(visibleTracks.length, participants.length, 1);
  const isSingleParticipant = participantCount === 1;

  const gridClass = useMemo(() => {
    if (participantCount === 1) return "grid-cols-1 grid-rows-1";
    if (participantCount === 2) return "grid-cols-1 sm:grid-cols-2";
    if (participantCount <= 4) return "grid-cols-2";
    if (participantCount <= 6) return "grid-cols-2 lg:grid-cols-3";
    return "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  }, [participantCount]);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      {audioTracks
        .filter((t) => t.publication?.track)
        .map((trackRef) => (
          <AudioTrack
            key={trackRef.publication!.trackSid}
            trackRef={trackRef as Parameters<typeof AudioTrack>[0]["trackRef"]}
          />
        ))}

      <div className={cn("grid h-full min-h-0 flex-1 gap-3", gridClass)}>
        {visibleTracks.length === 0 ? (
          <div className="flex h-full min-h-[16rem] items-center justify-center rounded-2xl bg-zinc-900 ring-1 ring-zinc-800/80">
            <p className="text-sm text-zinc-500">Waiting for participants...</p>
          </div>
        ) : (
          visibleTracks.map((trackRef) => {
            const participant = trackRef.participant;
            const name =
              participant.name ||
              participant.identity ||
              (participant.isLocal ? "You" : "Guest");

            if (!trackRef.publication && trackRef.source !== Track.Source.Camera) {
              return null;
            }

            return (
              <ParticipantTile
                key={`${participant.identity}-${trackRef.source}-${trackRef.publication?.trackSid ?? "placeholder"}`}
                trackRef={trackRef}
                name={name}
                isLocal={participant.isLocal}
                isMuted={!participant.isMicrophoneEnabled}
                fillContainer={isSingleParticipant}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
