"use client";

import { ChevronDown, Mic, MicOff, Video, VideoOff } from "lucide-react";
import {
  createLocalAudioTrack,
  createLocalVideoTrack,
  type LocalAudioTrack,
  type LocalVideoTrack,
  VideoPresets,
} from "livekit-client";
import type { LocalUserChoices } from "@livekit/components-core";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn, getInitials } from "@/lib/utils";

interface DeviceSelectPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: MediaDeviceInfo[];
  onChange: (deviceId: string) => void;
  disabled?: boolean;
}

function DeviceSelectPill({
  icon,
  label,
  value,
  options,
  onChange,
  disabled,
}: DeviceSelectPillProps) {
  const selected = options.find((d) => d.deviceId === value);

  return (
    <label
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm",
        disabled && "opacity-60",
      )}
    >
      <span className="shrink-0 text-zinc-500">{icon}</span>
      <span className="sr-only">{label}</span>
      <select
        className="min-w-0 flex-1 truncate bg-transparent text-sm outline-none"
        value={value}
        disabled={disabled || options.length === 0}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
      >
        {options.length === 0 ? (
          <option value="">{label} unavailable</option>
        ) : (
          options.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `${label} ${device.deviceId.slice(0, 6)}`}
            </option>
          ))
        )}
      </select>
      <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
      {selected && !selected.label ? null : (
        <span className="sr-only">{selected?.label ?? label}</span>
      )}
    </label>
  );
}

interface PreJoinLobbyProps {
  meetingTitle: string;
  meetingCode: string;
  displayName: string;
  firstName: string;
  lastName: string;
  isHost: boolean;
  joinError?: string | null;
  isJoining?: boolean;
  onJoin: (choices: LocalUserChoices, speakerDeviceId: string) => void;
}

export function PreJoinLobby({
  meetingTitle,
  meetingCode,
  displayName,
  firstName,
  lastName,
  isHost,
  joinError,
  isJoining,
  onJoin,
}: PreJoinLobbyProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioDeviceId, setAudioDeviceId] = useState("");
  const [videoDeviceId, setVideoDeviceId] = useState("");
  const [speakerDeviceId, setSpeakerDeviceId] = useState("");
  const [devicesReady, setDevicesReady] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
  const [previewVideoTrack, setPreviewVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [previewAudioTrack, setPreviewAudioTrack] = useState<LocalAudioTrack | null>(null);

  // Request permissions and enumerate devices before creating preview tracks.
  useEffect(() => {
    let cancelled = false;

    async function initDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach((track) => track.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;

        const mics = devices.filter((d) => d.kind === "audioinput");
        const cams = devices.filter((d) => d.kind === "videoinput");
        const speakers = devices.filter((d) => d.kind === "audiooutput");

        setAudioInputs(mics);
        setVideoInputs(cams);
        setAudioOutputs(speakers);
        setAudioDeviceId(mics[0]?.deviceId ?? "");
        setVideoDeviceId(cams[0]?.deviceId ?? "");
        setSpeakerDeviceId(speakers[0]?.deviceId ?? "");
        setDevicesReady(true);
      } catch (err) {
        if (!cancelled) {
          setMediaError(
            err instanceof Error
              ? err.message
              : "Could not access camera or microphone. Check browser permissions.",
          );
        }
      }
    }

    void initDevices();

    return () => {
      cancelled = true;
    };
  }, []);

  // Camera preview track.
  useEffect(() => {
    if (!devicesReady || !videoEnabled) {
      setPreviewVideoTrack((current) => {
        current?.stop();
        return null;
      });
      return;
    }

    let cancelled = false;
    let createdTrack: LocalVideoTrack | undefined;

    async function startPreview() {
      try {
        const track = await createLocalVideoTrack({
          deviceId: videoDeviceId ? { exact: videoDeviceId } : undefined,
          resolution: VideoPresets.h720.resolution,
        });

        if (cancelled) {
          track.stop();
          return;
        }

        createdTrack = track;
        setPreviewVideoTrack(track);
        setMediaError(null);
      } catch (err) {
        if (!cancelled) {
          setPreviewVideoTrack(null);
          setMediaError(
            err instanceof Error ? err.message : "Could not start camera preview.",
          );
        }
      }
    }

    void startPreview();

    return () => {
      cancelled = true;
      createdTrack?.stop();
      setPreviewVideoTrack((current) => {
        if (current && current !== createdTrack) {
          current.stop();
        }
        return null;
      });
    };
  }, [devicesReady, videoEnabled, videoDeviceId]);

  // Microphone preview track (keeps the selected mic active before join).
  useEffect(() => {
    if (!devicesReady || !audioEnabled) {
      setPreviewAudioTrack((current) => {
        current?.stop();
        return null;
      });
      return;
    }

    let cancelled = false;
    let createdTrack: LocalAudioTrack | undefined;

    async function startAudio() {
      try {
        const track = await createLocalAudioTrack({
          deviceId: audioDeviceId ? { exact: audioDeviceId } : undefined,
        });

        if (cancelled) {
          track.stop();
          return;
        }

        createdTrack = track;
        setPreviewAudioTrack(track);
      } catch {
        if (!cancelled) {
          setPreviewAudioTrack(null);
        }
      }
    }

    void startAudio();

    return () => {
      cancelled = true;
      createdTrack?.stop();
      setPreviewAudioTrack((current) => {
        if (current && current !== createdTrack) {
          current.stop();
        }
        return null;
      });
    };
  }, [devicesReady, audioEnabled, audioDeviceId]);

  // Attach preview video to the <video> element.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !previewVideoTrack) return;

    previewVideoTrack.attach(el);
    void el.play().catch(() => {
      // Autoplay may be blocked until user interaction; preview still works after gesture.
    });

    return () => {
      previewVideoTrack.detach(el);
    };
  }, [previewVideoTrack]);

  const handleJoin = () => {
    previewVideoTrack?.stop();
    previewAudioTrack?.stop();
    setPreviewVideoTrack(null);
    setPreviewAudioTrack(null);

    onJoin(
      {
        username: displayName,
        audioEnabled,
        videoEnabled,
        audioDeviceId,
        videoDeviceId,
      },
      speakerDeviceId,
    );
  };

  const statusText = isHost
    ? "You're the first to join — others can use your meeting code"
    : "No one else is here";

  const showVideoPreview = videoEnabled && devicesReady;

  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <header className="flex h-14 items-center justify-between border-b border-zinc-100 px-4 sm:px-6">
        <Link href="/dashboard" className="text-sm font-medium text-primary hover:underline">
          Back
        </Link>
        <span className="truncate font-mono text-xs text-zinc-500 sm:text-sm">{meetingCode}</span>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-4 py-8 lg:flex-row lg:items-center lg:gap-16 lg:px-8">
        <div className="w-full max-w-2xl space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-zinc-900 shadow-lg">
            {showVideoPreview ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={cn(
                  "h-full w-full object-cover [transform:rotateY(180deg)]",
                  !previewVideoTrack && "opacity-0",
                )}
              />
            ) : null}

            {(!showVideoPreview || !previewVideoTrack) && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
                {!devicesReady ? (
                  <p className="text-sm text-zinc-400">Starting camera...</p>
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 text-3xl font-semibold text-primary">
                    {getInitials(firstName, lastName)}
                  </div>
                )}
              </div>
            )}

            <div className="absolute left-4 top-4 z-10 rounded-md bg-black/50 px-2.5 py-1 text-sm font-medium text-white backdrop-blur-sm">
              {displayName}
            </div>

            <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setAudioEnabled((on) => !on)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                  audioEnabled
                    ? "bg-zinc-700/90 text-white hover:bg-zinc-600"
                    : "bg-red-600 text-white hover:bg-red-500",
                )}
                aria-label={audioEnabled ? "Mute microphone" : "Unmute microphone"}
              >
                {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </button>
              <button
                type="button"
                onClick={() => setVideoEnabled((on) => !on)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                  videoEnabled
                    ? "bg-zinc-700/90 text-white hover:bg-zinc-600"
                    : "bg-red-600 text-white hover:bg-red-500",
                )}
                aria-label={videoEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mediaError ? (
            <p className="text-center text-sm text-destructive">{mediaError}</p>
          ) : null}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <DeviceSelectPill
              icon={<Mic className="h-4 w-4" />}
              label="Microphone"
              value={audioDeviceId}
              options={audioInputs}
              onChange={setAudioDeviceId}
              disabled={!devicesReady || !audioEnabled}
            />
            <DeviceSelectPill
              icon={
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              }
              label="Speaker"
              value={speakerDeviceId}
              options={audioOutputs}
              onChange={setSpeakerDeviceId}
              disabled={!devicesReady}
            />
            <DeviceSelectPill
              icon={<Video className="h-4 w-4" />}
              label="Camera"
              value={videoDeviceId}
              options={videoInputs}
              onChange={setVideoDeviceId}
              disabled={!devicesReady || !videoEnabled}
            />
          </div>
        </div>

        <div className="flex w-full max-w-sm flex-col items-center text-center lg:items-start lg:text-left">
          <h1 className="text-3xl font-normal tracking-tight text-zinc-800 sm:text-4xl">
            Ready to join?
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{statusText}</p>
          <p className="mt-1 text-sm font-medium text-zinc-700">{meetingTitle}</p>

          {joinError ? (
            <p className="mt-4 text-sm text-destructive">{joinError}</p>
          ) : null}

          <Button
            size="lg"
            className={cn(
              "h-12 w-full max-w-xs rounded-full bg-primary px-8 text-base hover:bg-primary/90",
              joinError ? "mt-4" : "mt-8",
            )}
            onClick={handleJoin}
            disabled={isJoining || !devicesReady}
          >
            {isJoining ? "Joining..." : "Join now"}
          </Button>

          <p className="mt-6 text-xs text-zinc-400">
            Joining as <span className="text-zinc-600">{displayName}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
