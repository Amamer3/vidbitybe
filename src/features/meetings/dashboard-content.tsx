"use client";

import { useEffect, useState } from "react";
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

export function DashboardContent() {
  const user = useAuthStore((s) => s.user);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMeetings() {
      try {
        const data = await meetingsService.list();
        setMeetings(data.meetings ?? []);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to load meetings.");
      } finally {
        setIsLoading(false);
      }
    }

    loadMeetings();
  }, []);

  const upcoming = meetings.filter((m) => m.status === "scheduled" || m.status === "live");
  const recent = meetings.filter((m) => m.status === "ended");

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && <Alert variant="destructive">{error}</Alert>}

      <InstantMeetingHero />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="order-2 space-y-8 lg:order-none lg:col-span-2">
          <section>
            <h2 className="mb-4 text-xl font-semibold">Upcoming & live</h2>
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground">
                No upcoming meetings. Use the instant meeting card above or schedule one for later.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {upcoming.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} currentUserId={user?.id} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold">Recent</h2>
            {recent.length === 0 ? (
              <p className="text-muted-foreground">No recent meetings.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {recent.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} currentUserId={user?.id} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="order-1 lg:order-none">
          <Card>
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
