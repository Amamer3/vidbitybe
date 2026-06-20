import type { User } from "./user";

export type MeetingStatus = "scheduled" | "live" | "ended";

export interface Meeting {
  id: string;
  code: string;
  title: string;
  scheduledFor?: string | null;
  status: MeetingStatus;
  hostId: string;
  host?: User;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMeetingPayload {
  title: string;
  scheduledFor?: string;
}

/** POST /meetings/instant — optional title; backend may auto-generate if omitted */
export interface CreateInstantMeetingPayload {
  title?: string;
}

export interface MeetingTokenResponse {
  livekitToken: string;
  livekitUrl: string;
}
