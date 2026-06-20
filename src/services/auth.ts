import { apiClient } from "@/lib/api-client";
import type {
  ForgotPasswordPayload,
  LoginPayload,
  LoginResponse,
  RefreshResponse,
  RegisterPayload,
  ResetPasswordPayload,
} from "@/types/auth";
import type { User } from "@/types/user";

export const authService = {
  register(payload: RegisterPayload) {
    return apiClient<{ user: User }>("/auth/register", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  login(payload: LoginPayload) {
    return apiClient<LoginResponse>("/auth/login", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  refresh(refreshToken: string) {
    return apiClient<RefreshResponse>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
      auth: false,
      skipRefresh: true,
    });
  },

  logout(refreshToken: string) {
    return apiClient<void>("/auth/logout", {
      method: "POST",
      body: { refreshToken },
      auth: false,
      skipRefresh: true,
    });
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return apiClient<void>("/auth/forgot-password", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },

  resetPassword(payload: ResetPasswordPayload) {
    return apiClient<void>("/auth/reset-password", {
      method: "POST",
      body: payload,
      auth: false,
    });
  },
};
