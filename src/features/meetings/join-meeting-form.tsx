"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { getMeetingJoinPath } from "@/lib/meeting-url";
import { toast } from "@/lib/toast";
import { meetingsService } from "@/services/meetings";
import { ApiError } from "@/types/api";

export function JoinMeetingForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Enter a meeting code");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await meetingsService.getByCodeOrId(trimmed);
      router.push(getMeetingJoinPath(trimmed));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Meeting not found.");
      toast.error(err instanceof ApiError ? err.message : "Meeting not found.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-3">
      {error && <Alert variant="destructive">{error}</Alert>}
      <div className="space-y-2">
        <Label htmlFor="meetingCode">Meeting code</Label>
        <Input
          id="meetingCode"
          placeholder="abc-defg-hij"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
      <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
        {isLoading ? <Spinner size="sm" /> : "Join meeting"}
      </Button>
    </form>
  );
}
