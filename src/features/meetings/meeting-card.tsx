"use client";

import Link from "next/link";
import { Calendar, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Meeting } from "@/types/meeting";
import { formatDate } from "@/lib/utils";

interface MeetingCardProps {
  meeting: Meeting;
  currentUserId?: string;
}

const statusColors: Record<Meeting["status"], string> = {
  scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  live: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  ended: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export function MeetingCard({ meeting, currentUserId }: MeetingCardProps) {
  const isHost = currentUserId === meeting.hostId;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="truncate text-base sm:text-lg">{meeting.title}</CardTitle>
            <CardDescription className="mt-1 truncate font-mono text-xs">
              {meeting.code}
            </CardDescription>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize sm:px-2.5 sm:text-xs ${statusColors[meeting.status]}`}
          >
            {meeting.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {meeting.scheduledFor && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatDate(meeting.scheduledFor)}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isHost ? "You are the host" : "Participant"}
        </div>
        <Button asChild className="w-full" variant={meeting.status === "live" ? "default" : "outline"}>
          <Link href={`/meeting/${meeting.code}`}>
            <Video className="h-4 w-4" />
            {meeting.status === "ended" ? "View" : "Join"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
