import { apiClient } from "@/lib/api-client";
import type { User, UpdateProfilePayload } from "@/types/user";

export const usersService = {
  getMe() {
    return apiClient<{ user: User }>("/users/me");
  },

  updateMe(payload: UpdateProfilePayload) {
    return apiClient<{ user: User }>("/users/me", {
      method: "PATCH",
      body: payload,
    });
  },
};
