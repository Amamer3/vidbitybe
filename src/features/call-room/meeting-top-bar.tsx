"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Meeting } from "@/types/meeting";

interface MeetingTopBarProps {
  meeting: Meeting;
  isHost: boolean;
}

export function MeetingTopBar({ meeting, isHost }: MeetingTopBarProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(meeting.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-800/80 bg-zinc-950/90 px-3 py-2.5 backdrop-blur-md sm:gap-4 sm:px-6 sm:py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="shrink-0 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <Link href="/dashboard" aria-label="Back to dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>

        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold text-zinc-100 sm:text-lg">
            {meeting.title}
          </h1>
          <button
            type="button"
            onClick={() => void copyCode()}
            className="group mt-0.5 flex items-center gap-1.5 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
          >
            <span className="font-mono">{meeting.code}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy code"}</span>
          </button>
        </div>
      </div>

      {isHost && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300 sm:gap-1.5 sm:px-3 sm:py-1 sm:text-xs">
          <Crown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="hidden min-[380px]:inline">Host</span>
        </span>
      )}
    </header>
  );
}
