"use client";

import { useEffect, useMemo, useState } from "react";
import { Track } from "livekit-client";
import {
  useSpeakingParticipants,
  useTracks,
  useIsSpeaking,
  VideoTrack,
  AudioTrack,
} from "@livekit/components-react";
import { MicOff, Pin, PinOff } from "lucide-react";
import { useUiStore } from "@/store/ui";
import { cn } from "@/lib/utils";

// ─── Participant tile ────────────────────────────────────────────────────────

function ParticipantTile({
  trackRef,
  name,
  isLocal,
  isMuted,
  fillContainer,
  showLabel = true,
  onClick,
  isPinned,
}: {
  trackRef: ReturnType<typeof useTracks>[number];
  name: string;
  isLocal: boolean;
  isMuted: boolean;
  fillContainer?: boolean;
  showLabel?: boolean;
  onClick?: () => void;
  isPinned?: boolean;
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
      onClick={onClick}
      className={cn(
        "relative overflow-hidden bg-zinc-900",
        fillContainer ? "h-full min-h-0 w-full rounded-xl" : "aspect-video w-full rounded-xl",
        isSpeaking && !isScreenShare && "ring-2 ring-emerald-400 ring-offset-1 ring-offset-zinc-950",
        onClick && "cursor-pointer",
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
        <div className="flex h-full min-h-[4rem] items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-xl font-semibold text-primary sm:h-20 sm:w-20 sm:text-2xl",
              isSpeaking && "ring-2 ring-emerald-400",
            )}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}

      {showLabel && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-5 sm:px-3 sm:pb-3">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs font-medium text-white sm:text-sm">
              {name}
              {isLocal ? " (You)" : ""}
            </span>
            <div className="flex shrink-0 items-center gap-1">
              {isPinned && <Pin className="h-3 w-3 text-yellow-300" />}
              {isMuted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-200">
                  <MicOff className="h-2.5 w-2.5" />
                  Muted
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Audio renderer helper ───────────────────────────────────────────────────

function AudioTracks({ tracks }: { tracks: ReturnType<typeof useTracks> }) {
  return (
    <>
      {tracks
        .filter((t) => t.publication?.track)
        .map((trackRef) => (
          <AudioTrack
            key={trackRef.publication!.trackSid}
            trackRef={trackRef as Parameters<typeof AudioTrack>[0]["trackRef"]}
          />
        ))}
    </>
  );
}

// ─── Grid layout ─────────────────────────────────────────────────────────────

function GridLayout({ cameraTracks }: { cameraTracks: ReturnType<typeof useTracks> }) {
  const count = cameraTracks.length;
  const isSingle = count <= 1;

  const gridClass = useMemo(() => {
    if (count <= 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    if (count <= 4) return "grid-cols-2";
    if (count <= 9) return "grid-cols-3";
    return "grid-cols-4";
  }, [count]);

  if (count === 0) {
    return (
      <div className="flex h-full min-h-[16rem] items-center justify-center rounded-xl bg-zinc-900">
        <p className="text-sm text-zinc-500">Waiting for participants…</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "h-full w-full",
        isSingle
          ? "flex items-center justify-center"
          : cn("grid gap-2 sm:gap-3", gridClass, count > 9 && "auto-rows-min overflow-y-auto"),
      )}
    >
      {cameraTracks.map((trackRef) => {
        const p = trackRef.participant;
        if (!trackRef.publication && trackRef.source !== Track.Source.Camera) return null;
        const name = p.name || p.identity || (p.isLocal ? "You" : "Guest");
        return (
          <ParticipantTile
            key={`${p.identity}-${trackRef.source}-${trackRef.publication?.trackSid ?? "ph"}`}
            trackRef={trackRef}
            name={name}
            isLocal={p.isLocal}
            isMuted={!p.isMicrophoneEnabled}
            fillContainer={isSingle}
            showLabel={!isSingle || !p.isLocal}
          />
        );
      })}
    </div>
  );
}

// ─── Speaker layout ───────────────────────────────────────────────────────────

function SpeakerLayout({ cameraTracks }: { cameraTracks: ReturnType<typeof useTracks> }) {
  const activeSpeakers = useSpeakingParticipants();
  const [pinnedIdentity, setPinnedIdentity] = useState<string | null>(null);

  if (cameraTracks.length === 0) {
    return (
      <div className="flex h-full min-h-[16rem] items-center justify-center rounded-xl bg-zinc-900">
        <p className="text-sm text-zinc-500">Waiting for participants…</p>
      </div>
    );
  }

  // Single participant: full viewport, no strip needed
  if (cameraTracks.length === 1) {
    const trackRef = cameraTracks[0]!;
    const p = trackRef.participant;
    const name = p.name || p.identity || (p.isLocal ? "You" : "Guest");
    return (
      <div className="h-full w-full">
        <ParticipantTile
          trackRef={trackRef}
          name={name}
          isLocal={p.isLocal}
          isMuted={!p.isMicrophoneEnabled}
          fillContainer
          showLabel={!p.isLocal}
        />
      </div>
    );
  }

  // Resolve featured: pinned → active speaker → first track
  const featuredIdentity =
    pinnedIdentity ??
    activeSpeakers.find((s) => cameraTracks.some((t) => t.participant.identity === s.identity))
      ?.identity ??
    cameraTracks[0]!.participant.identity;

  const featuredTrack =
    cameraTracks.find((t) => t.participant.identity === featuredIdentity) ?? cameraTracks[0]!;
  const stripTracks = cameraTracks.filter(
    (t) => t.participant.identity !== featuredTrack.participant.identity,
  );

  const fp = featuredTrack.participant;
  const featuredName = fp.name || fp.identity || (fp.isLocal ? "You" : "Guest");

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      {/* Featured / spotlight tile */}
      <div className="min-h-0 flex-1">
        <ParticipantTile
          trackRef={featuredTrack}
          name={featuredName}
          isLocal={fp.isLocal}
          isMuted={!fp.isMicrophoneEnabled}
          fillContainer
          isPinned={!!pinnedIdentity}
          onClick={pinnedIdentity ? () => setPinnedIdentity(null) : undefined}
        />
      </div>

      {/* Thumbnail strip */}
      {stripTracks.length > 0 && (
        <div className="flex h-24 shrink-0 gap-2 overflow-x-auto pb-1 sm:h-28">
          {stripTracks.map((trackRef) => {
            const p = trackRef.participant;
            if (!trackRef.publication && trackRef.source !== Track.Source.Camera) return null;
            const name = p.name || p.identity || (p.isLocal ? "You" : "Guest");
            const isFeatured = p.identity === featuredIdentity;
            return (
              <div
                key={`${p.identity}-${trackRef.source}-${trackRef.publication?.trackSid ?? "ph"}`}
                className="aspect-video h-full shrink-0"
              >
                <ParticipantTile
                  trackRef={trackRef}
                  name={name}
                  isLocal={p.isLocal}
                  isMuted={!p.isMicrophoneEnabled}
                  fillContainer
                  onClick={isFeatured ? undefined : () => setPinnedIdentity(p.identity)}
                />
              </div>
            );
          })}
        </div>
      )}

      {pinnedIdentity && (
        <button
          type="button"
          onClick={() => setPinnedIdentity(null)}
          className="absolute left-1/2 top-14 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-zinc-800/90 px-3 py-1.5 text-xs text-zinc-300 backdrop-blur-sm hover:bg-zinc-700 sm:top-16"
        >
          <PinOff className="h-3 w-3" />
          Unpin
        </button>
      )}
    </div>
  );
}

// ─── Mobile breakpoint detection ─────────────────────────────────────────────

function useIsMobileScreen() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

// ─── Mobile PiP (FaceTime-style) — only for 2 participants on small screens ──

function MobilePiPLayout({ cameraTracks }: { cameraTracks: ReturnType<typeof useTracks> }) {
  const [swapped, setSwapped] = useState(false);

  const localTrack = cameraTracks.find((t) => t.participant.isLocal);
  const remoteTrack = cameraTracks.find((t) => !t.participant.isLocal);

  // If we can't identify both sides clearly, fall back to speaker view
  if (!localTrack || !remoteTrack) {
    return <SpeakerLayout cameraTracks={cameraTracks} />;
  }

  // Default: other person is full screen, you are the PiP (like FaceTime)
  const fullTrack = swapped ? localTrack : remoteTrack;
  const pipTrack = swapped ? remoteTrack : localTrack;

  const fullP = fullTrack.participant;
  const pipP = pipTrack.participant;
  const fullName = fullP.name || fullP.identity || "Guest";
  const pipName = pipP.name || pipP.identity || (pipP.isLocal ? "You" : "Guest");

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Full-screen background tile — covers the entire call area */}
      <div className="absolute inset-0">
        <ParticipantTile
          trackRef={fullTrack}
          name={fullName}
          isLocal={fullP.isLocal}
          isMuted={!fullP.isMicrophoneEnabled}
          fillContainer
        />
      </div>

      {/* Floating PiP tile — tap to swap */}
      <div
        className="absolute bottom-4 right-3 z-10 h-40 w-28 cursor-pointer overflow-hidden rounded-2xl border border-white/20 shadow-2xl transition-transform active:scale-95"
        onClick={() => setSwapped((s) => !s)}
        role="button"
        aria-label="Tap to swap participants"
      >
        <ParticipantTile
          trackRef={pipTrack}
          name={pipName}
          isLocal={pipP.isLocal}
          isMuted={!pipP.isMicrophoneEnabled}
          fillContainer
          showLabel={false}
        />
        {/* Muted badge — label is hidden so we show this inline */}
        {!pipP.isMicrophoneEnabled && (
          <div className="absolute bottom-2 left-2 z-10 rounded-full bg-black/60 p-1">
            <MicOff className="h-3 w-3 text-red-400" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function VideoGrid() {
  const { layoutMode } = useUiStore();
  const isMobile = useIsMobileScreen();

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const audioTracks = useTracks(
    [{ source: Track.Source.Microphone, withPlaceholder: false }],
    { onlySubscribed: true },
  );

  const visibleTracks = tracks.filter(
    (t) => t.publication || t.source === Track.Source.Camera,
  );

  const screenShareTracks = visibleTracks.filter((t) => t.source === Track.Source.ScreenShare);
  const cameraTracks = visibleTracks.filter((t) => t.source === Track.Source.Camera);
  const hasScreenShare = screenShareTracks.length > 0;

  // Mobile 2-person PiP: fires before all other layout logic
  const showMobilePiP =
    isMobile && !hasScreenShare && cameraTracks.length === 2;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <AudioTracks tracks={audioTracks} />

      {showMobilePiP ? (
        <MobilePiPLayout cameraTracks={cameraTracks} />
      ) : hasScreenShare ? (
        // Screen-share always gets spotlight regardless of layout mode
        <div className="flex h-full min-h-0 flex-1 flex-col gap-2 p-3 pt-14 sm:p-4 sm:pt-16">
          <div className="min-h-0 flex-1">
            {screenShareTracks.map((trackRef) => {
              const p = trackRef.participant;
              const name = p.name || p.identity || (p.isLocal ? "You" : "Guest");
              return (
                <ParticipantTile
                  key={`${p.identity}-ss-${trackRef.publication?.trackSid ?? "ss"}`}
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
            <div className="flex h-24 shrink-0 gap-2 overflow-x-auto pb-1 sm:h-28">
              {cameraTracks.map((trackRef) => {
                const p = trackRef.participant;
                if (!trackRef.publication && trackRef.source !== Track.Source.Camera) return null;
                const name = p.name || p.identity || (p.isLocal ? "You" : "Guest");
                return (
                  <div
                    key={`${p.identity}-cam-${trackRef.publication?.trackSid ?? "ph"}`}
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
      ) : layoutMode === "speaker" ? (
        <div className="relative flex h-full min-h-0 flex-1 flex-col p-3 pt-14 sm:p-4 sm:pt-16">
          <SpeakerLayout cameraTracks={cameraTracks} />
        </div>
      ) : (
        <div
          className={cn(
            "flex h-full min-h-0 flex-1",
            cameraTracks.length <= 1
              ? "items-center justify-center px-4 py-16 sm:px-8"
              : "p-3 pt-14 sm:p-4 sm:pt-16",
          )}
        >
          <GridLayout cameraTracks={cameraTracks} />
        </div>
      )}
    </div>
  );
}
