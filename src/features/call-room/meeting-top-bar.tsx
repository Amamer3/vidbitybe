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
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-800/80 bg-zinc-950/90 px-4 py-3 backdrop-blur-md sm:px-6">
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
          <h1 className="truncate text-base font-semibold text-zinc-100 sm:text-lg">
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
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
          <Crown className="h-3.5 w-3.5" />
          Host
        </span>
      )}
    </header>
  );
}
