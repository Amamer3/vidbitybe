"use client";

import Link from "next/link";
import { CalendarPlus, Copy, Share2, Video, Zap } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { useStartInstantMeeting } from "@/hooks/use-start-instant-meeting";
import { useAuthStore } from "@/store/auth";

export function InstantMeetingHero() {
  const user = useAuthStore((s) => s.user);
  const { startInstant, isStarting, error, clearError } = useStartInstantMeeting();
  const [title, setTitle] = useState("");

  const placeholder = user?.firstName
    ? `${user.firstName}'s meeting`
    : "Instant meeting";

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (error) clearError();
  };

  const handleStart = () => {
    startInstant(title || undefined);
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.07] via-background to-background shadow-sm">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-primary/5 blur-2xl"
      />

      <CardContent className="relative p-4 sm:p-8">
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr,minmax(0,22rem)] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              One click to go live
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold tracking-tight sm:text-3xl">
                Start an instant meeting
              </h2>
              <p className="max-w-xl text-muted-foreground">
                Create a room and jump in immediately. Share the meeting code with your team once
                you&apos;re in the call.
              </p>
            </div>

            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Video className="h-4 w-4 shrink-0 text-primary" />
                Video ready instantly
              </li>
              <li className="flex items-center gap-2">
                <Share2 className="h-4 w-4 shrink-0 text-primary" />
                Share code after join
              </li>
              <li className="flex items-center gap-2">
                <Copy className="h-4 w-4 shrink-0 text-primary" />
                No scheduling needed
              </li>
            </ul>
          </div>

          <div className="rounded-xl border bg-card/80 p-5 shadow-sm backdrop-blur-sm">
            <div className="space-y-4">
              {error && <Alert variant="destructive">{error}</Alert>}

              <div className="space-y-2">
                <Label htmlFor="instant-meeting-title">Meeting title</Label>
                <Input
                  id="instant-meeting-title"
                  placeholder={placeholder}
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isStarting) handleStart();
                  }}
                  disabled={isStarting}
                />
                <p className="text-xs text-muted-foreground">
                  Optional — a default name is used if left blank.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={isStarting}
                onClick={handleStart}
              >
                {isStarting ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Start instant meeting
                  </>
                )}
              </Button>

              <Button variant="outline" className="w-full" asChild disabled={isStarting}>
                <Link href="/meetings/new">
                  <CalendarPlus className="h-4 w-4" />
                  Schedule for later
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
