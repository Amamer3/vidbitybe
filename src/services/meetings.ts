import { apiClient } from "@/lib/api-client";
import {
  mapMeeting,
  normalizeMeetingCode,
  type ApiMeeting,
} from "@/lib/meeting-mapper";
import type {
  CreateInstantMeetingPayload,
  CreateMeetingPayload,
  Meeting,
  MeetingTokenResponse,
} from "@/types/meeting";

function mapMeetingResponse(data: { meeting: ApiMeeting }) {
  return { meeting: mapMeeting(data.meeting) };
}

function mapMeetingsResponse(data: { meetings: ApiMeeting[] }) {
  return { meetings: data.meetings.map(mapMeeting) };
}

export const meetingsService = {
  create(payload: CreateMeetingPayload) {
    return apiClient<{ meeting: ApiMeeting }>("/meetings", {
      method: "POST",
      body: payload,
    }).then(mapMeetingResponse);
  },

  createInstant(payload: CreateInstantMeetingPayload = {}) {
    return apiClient<{ meeting: ApiMeeting }>("/meetings/instant", {
      method: "POST",
      body: payload,
    }).then(mapMeetingResponse);
  },

  list() {
    return apiClient<{ meetings: ApiMeeting[] }>("/meetings").then(
      mapMeetingsResponse,
    );
  },

  /** Lookup by database id or shareable meeting code (e.g. abc-defg-hij) */
  getByCodeOrId(idOrCode: string) {
    const identifier = normalizeMeetingCode(idOrCode);
    return apiClient<{ meeting: ApiMeeting }>(`/meetings/${identifier}`).then(
      mapMeetingResponse,
    );
  },

  /** @deprecated Use getByCodeOrId — kept for call sites passing codes */
  getById(idOrCode: string) {
    return this.getByCodeOrId(idOrCode);
  },

  getToken(idOrCode: string) {
    const identifier = normalizeMeetingCode(idOrCode);
    return apiClient<MeetingTokenResponse>(`/meetings/${identifier}/token`, {
      method: "POST",
    });
  },

  start(idOrCode: string) {
    const identifier = normalizeMeetingCode(idOrCode);
    return apiClient<{ meeting: ApiMeeting }>(`/meetings/${identifier}/start`, {
      method: "POST",
    }).then(mapMeetingResponse);
  },

  end(idOrCode: string) {
    const identifier = normalizeMeetingCode(idOrCode);
    return apiClient<{ meeting: ApiMeeting }>(`/meetings/${identifier}/end`, {
      method: "POST",
    }).then(mapMeetingResponse);
  },

  leave(idOrCode: string) {
    const identifier = normalizeMeetingCode(idOrCode);
    return apiClient<void>(`/meetings/${identifier}/leave`, {
      method: "POST",
    });
  },

  muteParticipant(meetingIdOrCode: string, participantIdentity: string, muted = true) {
    const identifier = normalizeMeetingCode(meetingIdOrCode);
    return apiClient<void>(
      `/meetings/${identifier}/participants/${participantIdentity}/mute`,
      { method: "POST", body: { muted } },
    );
  },

  removeParticipant(meetingIdOrCode: string, participantIdentity: string) {
    const identifier = normalizeMeetingCode(meetingIdOrCode);
    return apiClient<void>(
      `/meetings/${identifier}/participants/${participantIdentity}/remove`,
      { method: "POST" },
    );
  },
};
