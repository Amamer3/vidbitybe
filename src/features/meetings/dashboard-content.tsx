"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { InstantMeetingHero } from "@/features/meetings/instant-meeting-hero";
import { MeetingCard } from "@/features/meetings/meeting-card";
import { JoinMeetingForm } from "@/features/meetings/join-meeting-form";
import { meetingsService } from "@/services/meetings";
import { useAuthStore } from "@/store/auth";
import type { Meeting } from "@/types/meeting";
import { ApiError } from "@/types/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function DashboardSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-6">
      <div className="mb-4 sm:mb-5">
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function DashboardContent() {
  const user = useAuthStore((s) => s.user);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeetings = useCallback(async () => {
    try {
      const data = await meetingsService.list();
      setMeetings(data.meetings ?? []);
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to load meetings.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  // Refresh the list whenever the user returns to this tab so live/ended
  // status changes are reflected without a full page reload.
  useEffect(() => {
    const handleFocus = () => void loadMeetings();
    const handleVisibility = () => {
      if (!document.hidden) void loadMeetings();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadMeetings]);

  const upcoming = meetings.filter((m) => m.status === "scheduled" || m.status === "live");
  const recent = meetings.filter((m) => m.status === "ended");

  if (isLoading) {
    return (
      <div className="flex justify-center rounded-2xl border border-border/70 bg-card/90 py-20 shadow-sm">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {error && <Alert variant="destructive">{error}</Alert>}

      <InstantMeetingHero />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="order-2 space-y-6 lg:order-none lg:col-span-2">
          <DashboardSection
            title="Upcoming & live"
            description="Meetings you can join now or have scheduled."
          >
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No upcoming meetings. Use the instant meeting card above or schedule one for later.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {upcoming.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} currentUserId={user?.id} />
                ))}
              </div>
            )}
          </DashboardSection>

          <DashboardSection title="Recent" description="Meetings that have already ended.">
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent meetings.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {recent.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} currentUserId={user?.id} />
                ))}
              </div>
            )}
          </DashboardSection>
        </div>

        <div className="order-1 lg:order-none">
          <Card className="border-border/70 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>Join with code</CardTitle>
              <CardDescription>Enter a meeting code to join instantly</CardDescription>
            </CardHeader>
            <CardContent>
              <JoinMeetingForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
