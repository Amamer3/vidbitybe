"use client";

import { useMemo } from "react";
import { Track } from "livekit-client";
import {
  useParticipants,
  useTracks,
  useIsSpeaking,
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
  showLabel = true,
}: {
  trackRef: ReturnType<typeof useTracks>[number];
  name: string;
  isLocal: boolean;
  isMuted: boolean;
  fillContainer?: boolean;
  showLabel?: boolean;
}) {
  const isScreenShare = trackRef.source === Track.Source.ScreenShare;
  const isCamera = trackRef.source === Track.Source.Camera;
  const mirrorLocalCamera = isLocal && isCamera && !isScreenShare;
  const isSpeaking = useIsSpeaking(trackRef.participant);

  const hasVideoTrack =
    trackRef.publication !== undefined &&
    trackRef.publication.kind === Track.Kind.Video &&
    !trackRef.publication.isMuted;

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-zinc-900",
        fillContainer ? "h-full min-h-0 w-full rounded-xl" : "aspect-video w-full rounded-xl",
        isSpeaking && !isScreenShare && "ring-2 ring-emerald-400 ring-offset-1 ring-offset-zinc-950",
      )}
    >
      {hasVideoTrack ? (
        <VideoTrack
          trackRef={trackRef as Parameters<typeof VideoTrack>[0]["trackRef"]}
          className={cn(
            "h-full w-full",
            isScreenShare ? "bg-zinc-950 object-contain" : "object-cover",
            mirrorLocalCamera && "[transform:rotateY(180deg)]",
          )}
        />
      ) : (
        <div className="flex h-full min-h-[12rem] items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-2xl font-semibold text-primary sm:h-24 sm:w-24 sm:text-3xl",
              isSpeaking && "ring-2 ring-emerald-400",
            )}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {showLabel ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-6">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-medium text-white">
              {name}
              {isLocal ? " (You)" : ""}
            </span>
            {isMuted ? (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-200">
                <MicOff className="h-3 w-3" />
                Muted
              </span>
            ) : null}
          </div>
        </div>
      ) : null}
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

  const screenShareTracks = visibleTracks.filter(
    (t) => t.source === Track.Source.ScreenShare,
  );
  const cameraTracks = visibleTracks.filter(
    (t) => t.source === Track.Source.Camera,
  );
  const hasScreenShare = screenShareTracks.length > 0;

  const participantCount = Math.max(cameraTracks.length, participants.length, 1);
  const isSingleParticipant = !hasScreenShare && participantCount === 1;

  const gridClass = useMemo(() => {
    if (participantCount === 1) return "grid-cols-1 grid-rows-1";
    if (participantCount === 2) return "grid-cols-1 sm:grid-cols-2";
    if (participantCount <= 4) return "grid-cols-1 sm:grid-cols-2";
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

      {hasScreenShare ? (
        // Spotlight layout: screen share dominates, cameras as a strip below
        <div className="flex h-full min-h-0 flex-1 flex-col gap-2 p-3 pt-14 sm:p-4 sm:pt-16">
          <div className="min-h-0 flex-1">
            {screenShareTracks.map((trackRef) => {
              const p = trackRef.participant;
              const name = p.name || p.identity || (p.isLocal ? "You" : "Guest");
              return (
                <ParticipantTile
                  key={`${p.identity}-${trackRef.source}-${trackRef.publication?.trackSid ?? "ss"}`}
                  trackRef={trackRef}
                  name={name}
                  isLocal={p.isLocal}
                  isMuted={!p.isMicrophoneEnabled}
                  fillContainer
                />
              );
            })}
          </div>

          {cameraTracks.length > 0 && (
            <div className="flex h-28 shrink-0 gap-2 overflow-x-auto">
              {cameraTracks.map((trackRef) => {
                const p = trackRef.participant;
                if (!trackRef.publication && trackRef.source !== Track.Source.Camera) return null;
                const name = p.name || p.identity || (p.isLocal ? "You" : "Guest");
                return (
                  <div
                    key={`${p.identity}-${trackRef.source}-${trackRef.publication?.trackSid ?? "cam"}`}
                    className="aspect-video h-full shrink-0"
                  >
                    <ParticipantTile
                      trackRef={trackRef}
                      name={name}
                      isLocal={p.isLocal}
                      isMuted={!p.isMicrophoneEnabled}
                      fillContainer
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        // Standard grid layout
        <div
          className={cn(
            "flex h-full min-h-0 flex-1",
            isSingleParticipant
              ? "items-center justify-center px-4 py-16 sm:px-8"
              : "p-3 pt-14 sm:p-4 sm:pt-16",
          )}
        >
          <div
            className={cn(
              "h-full w-full",
              isSingleParticipant ? "max-h-full max-w-5xl" : "",
              !isSingleParticipant && cn("grid min-h-0 flex-1 gap-2 sm:gap-3", gridClass),
            )}
          >
            {visibleTracks.length === 0 ? (
              <div className="flex h-full min-h-[16rem] items-center justify-center rounded-xl bg-zinc-900">
                <p className="text-sm text-zinc-500">Waiting for participants...</p>
              </div>
            ) : (
              cameraTracks.map((trackRef) => {
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
                    showLabel={!isSingleParticipant || !participant.isLocal}
                  />
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
