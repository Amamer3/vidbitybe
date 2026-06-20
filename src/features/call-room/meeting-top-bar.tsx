"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Crown, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { copied, copy, resetCopied } = useCopyToClipboard();
  const copyToastIdRef = useRef<string | number | undefined>(undefined);

  const clearCopyFeedback = () => {
    resetCopied();
    if (copyToastIdRef.current !== undefined) {
      toast.dismiss(copyToastIdRef.current);
      copyToastIdRef.current = undefined;
    }
  };

  const copyLink = async () => {
    if (copied) {
      clearCopyFeedback();
      return;
    }

    const didCopy = await copy(meetingLink);
    if (didCopy) {
      copyToastIdRef.current = toast.copied("Meeting link copied", () => {
        resetCopied();
        copyToastIdRef.current = undefined;
      });
    } else {
      toast.error("Could not copy link");
    }
  };

  const shareLink = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: meeting.title,
          text: `Join my VidBitye meeting: ${meeting.title}`,
          url: meetingLink,
        });
        toast.shared();
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
      }
    }

    const didCopy = await copy(meetingLink);
    if (didCopy) {
      copyToastIdRef.current = toast.copied("Meeting link copied", () => {
        resetCopied();
        copyToastIdRef.current = undefined;
      });
    } else {
      toast.error("Could not share link");
    }
  };

  return (
    <header className="shrink-0 border-b border-[var(--meeting-border)] bg-[var(--meeting-surface)]/95 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="mt-0.5 shrink-0 text-[var(--meeting-muted)] hover:bg-[var(--meeting-surface-elevated)] hover:text-[var(--meeting-foreground)]"
          >
            <Link href="/dashboard" aria-label="Back to dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-base font-semibold sm:text-lg">{meeting.title}</h1>
              {isHost ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                  <Crown className="h-3 w-3" />
                  Host
                </span>
              ) : null}
            </div>

            <div className="rounded-xl border border-[var(--meeting-border)] bg-[var(--meeting-bg)] p-3 sm:p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[var(--meeting-muted)]">
                <Link2 className="h-3.5 w-3.5" />
                Invite link
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  readOnly
                  value={meetingLink}
                  aria-label="Meeting invite link"
                  className="h-10 border-[var(--meeting-border)] bg-[var(--meeting-surface)] font-mono text-xs text-[var(--meeting-foreground)] sm:text-sm"
                  onFocus={(event) => event.currentTarget.select()}
                />

                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1 sm:flex-none"
                    onClick={() => void copyLink()}
                    aria-pressed={copied}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 border-[var(--meeting-border)] bg-transparent text-[var(--meeting-foreground)] hover:bg-[var(--meeting-surface-elevated)] sm:flex-none"
                    onClick={() => void shareLink()}
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              {isHost ? (
                <p className="mt-2 text-xs text-[var(--meeting-muted)]">
                  Send this link to invite people to the call.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
