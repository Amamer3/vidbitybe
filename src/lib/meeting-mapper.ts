import type { Meeting, MeetingStatus } from "@/types/meeting";
import type { User } from "@/types/user";

/** Raw meeting shape returned by the NestJS API */
export interface ApiMeeting {
  id: string;
  title: string;
  meetingCode?: string;
  code?: string;
  status: string;
  hostId: string;
  host?: User;
  scheduledFor?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  isHost?: boolean;
}

export function normalizeMeetingStatus(status: string): MeetingStatus {
  switch (status.toUpperCase()) {
    case "ACTIVE":
      return "live";
    case "ENDED":
      return "ended";
    default:
      return "scheduled";
  }
}

export function mapMeeting(raw: ApiMeeting): Meeting {
  const code = (raw.code ?? raw.meetingCode ?? "").toLowerCase();

  return {
    id: raw.id,
    code,
    title: raw.title,
    status: normalizeMeetingStatus(raw.status),
    hostId: raw.hostId,
    host: raw.host,
    scheduledFor: raw.scheduledFor ?? null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function normalizeMeetingCode(code: string): string {
  return code.trim().toLowerCase();
}
