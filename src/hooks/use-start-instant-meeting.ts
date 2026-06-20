"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { meetingsService } from "@/services/meetings";
import { useAuthStore } from "@/store/auth";
import { ApiError } from "@/types/api";

function defaultInstantTitle(firstName?: string | null) {
  if (firstName?.trim()) {
    return `${firstName.trim()}'s meeting`;
  }
  return "Instant meeting";
}

export function useStartInstantMeeting() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startInstant = useCallback(
    async (title?: string) => {
      setIsStarting(true);
      setError(null);

      try {
        const meetingTitle = title?.trim() || defaultInstantTitle(user?.firstName);
        const { meeting } = await meetingsService.createInstant({ title: meetingTitle });
        router.push(`/meeting/${meeting.code}`);
        return;
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Failed to start instant meeting.");
        setIsStarting(false);
      }
    },
    [router, user?.firstName],
  );

  const clearError = useCallback(() => setError(null), []);

  return { startInstant, isStarting, error, clearError };
}
