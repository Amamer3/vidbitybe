"use client";

import { useState } from "react";
import { Check, Copy, Shield, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMeetingJoinUrl } from "@/lib/meeting-url";
import { toast } from "@/lib/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";

interface MeetingReadyCardProps {
  meetingCode: string;
  userEmail?: string;
  onClose: () => void;
}

export function MeetingReadyCard({ meetingCode, userEmail, onClose }: MeetingReadyCardProps) {
  const meetingLink = getMeetingJoinUrl(meetingCode);
  const { copied, copy } = useCopyToClipboard();
  const [sharing, setSharing] = useState(false);

  const copyLink = async () => {
    const didCopy = await copy(meetingLink);
    if (didCopy) {
      toast.copied("Meeting link copied");
    } else {
      toast.error("Could not copy link");
    }
  };

  const addOthers = async () => {
    if (typeof navigator.share === "function") {
      setSharing(true);
      try {
        await navigator.share({
          title: "Join my VidBitye meeting",
          text: "Join my meeting on VidBitye",
          url: meetingLink,
        });
        toast.shared();
      } catch (err) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          await copyLink();
        }
      } finally {
        setSharing(false);
      }
      return;
    }

    await copyLink();
  };

  return (
    <div className="pointer-events-auto w-[min(100vw-2rem,22rem)] rounded-xl bg-white p-4 text-zinc-900 shadow-2xl sm:w-80">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="text-sm font-medium text-zinc-800">Your meeting&apos;s ready</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Button
        className="mb-3 h-10 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
        onClick={() => void addOthers()}
        disabled={sharing}
      >
        <UserPlus className="h-4 w-4" />
        Add others
      </Button>

      <p className="mb-2 text-xs leading-relaxed text-zinc-600">
        Or share this meeting link with others you want in the meeting
      </p>

      <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
        <span className="min-w-0 flex-1 truncate font-mono text-xs text-zinc-700">
          {meetingLink.replace(/^https?:\/\//, "")}
        </span>
        <button
          type="button"
          onClick={() => void copyLink()}
          className="shrink-0 rounded-md p-1.5 text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
          aria-label="Copy meeting link"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-3 flex items-start gap-2 text-xs text-zinc-500">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>People who use this meeting link must sign in before they can join.</p>
      </div>

      {userEmail ? (
        <p className="mt-3 truncate text-[11px] text-zinc-400">Joined as {userEmail}</p>
      ) : null}
    </div>
  );
}
