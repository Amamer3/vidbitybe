"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Info } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { Meeting } from "@/types/meeting";

interface MeetingTopBarProps {
  meeting: Meeting;
}

function formatClock(date: Date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function MeetingTopBar({ meeting }: MeetingTopBarProps) {
  const user = useAuthStore((s) => s.user);
  const [time, setTime] = useState(() => formatClock(new Date()));

  useEffect(() => {
    function tick() {
      setTime(formatClock(new Date()));
    }

    // Sync the first tick to the next real minute boundary so the display
    // never lags behind the system clock by more than a second.
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    let intervalId: number | null = null;

    const timeoutId = window.setTimeout(() => {
      tick();
      intervalId = window.setInterval(tick, 60_000);
    }, msToNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  return (
    <TooltipProvider>
      <header className="absolute inset-x-0 top-0 z-30 flex h-12 items-center justify-between px-4 pt-safe sm:px-6">
        <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-300 sm:gap-3">
          <span className="shrink-0 tabular-nums">{time}</span>
          <span className="hidden text-zinc-600 sm:inline">|</span>
          <span className="truncate font-mono text-xs sm:text-sm">{meeting.code}</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="shrink-0 rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
                aria-label={`Meeting info: ${meeting.title}`}
              >
                <Info className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-xs">
              {meeting.title}
            </TooltipContent>
          </Tooltip>
        </div>

        <Link
          href="/settings"
          className="shrink-0 rounded-full outline-none ring-primary transition-opacity hover:opacity-90 focus-visible:ring-2"
          aria-label="Account settings"
        >
          <Avatar className="h-8 w-8 border border-zinc-700 sm:h-9 sm:w-9">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {user ? getInitials(user.firstName, user.lastName) : "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
      </header>
    </TooltipProvider>
  );
}
