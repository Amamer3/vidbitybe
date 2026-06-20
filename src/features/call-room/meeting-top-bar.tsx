"use client";

import Link from "next/link";
import { ArrowLeft, Check, Copy, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMeetingJoinUrl } from "@/lib/meeting-url";
import { toast } from "@/lib/toast";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import type { Meeting } from "@/types/meeting";

interface MeetingTopBarProps {
  meeting: Meeting;
  isHost: boolean;
}

export function MeetingTopBar({ meeting, isHost }: MeetingTopBarProps) {
  const meetingLink = getMeetingJoinUrl(meeting.code);
  const { copied, copy } = useCopyToClipboard();

  const copyLink = async () => {
    const didCopy = await copy(meetingLink);
    if (didCopy) {
      toast.copied("Meeting link copied");
    } else {
      toast.error("Could not copy link");
    }
  };

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--meeting-border)] bg-[var(--meeting-surface)]/95 px-3 py-2.5 backdrop-blur-md sm:gap-4 sm:px-6 sm:py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="shrink-0 text-[var(--meeting-muted)] hover:bg-[var(--meeting-surface-elevated)] hover:text-[var(--meeting-foreground)]"
        >
          <Link href="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold sm:text-lg">{meeting.title}</h1>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="group mt-0.5 flex items-center gap-1.5 text-xs text-[var(--meeting-muted)] transition-colors hover:text-[var(--meeting-foreground)]"
          >
            <span className="font-mono">{meeting.code}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy link"}</span>
          </button>
        </div>
      </div>

      {isHost ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs">
          <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden min-[380px]:inline">Host</span>
        </span>
      ) : null}
    </header>
  );
}
