"use client";

import { create } from "zustand";
import type { User } from "@/types/user";
import { authStorage } from "@/lib/auth-storage";
import { getTokenExpiryMs } from "@/lib/jwt";
import { REFRESH_BUFFER_MS } from "@/lib/constants";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  refreshTimerId: ReturnType<typeof setTimeout> | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setInitialized: (value: boolean) => void;
  scheduleRefresh: () => void;
  clearRefreshTimer: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,
  refreshTimerId: null,

  setAuth: (user, accessToken, refreshToken) => {
    authStorage.setRefreshToken(refreshToken);
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
    get().scheduleRefresh();
  },

  setTokens: (accessToken, refreshToken) => {
    authStorage.setRefreshToken(refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
    get().scheduleRefresh();
  },

  setUser: (user) => set({ user }),

  logout: () => {
    get().clearRefreshTimer();
    authStorage.clearRefreshToken();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  setInitialized: (value) => set({ isInitialized: value }),

  clearRefreshTimer: () => {
    const { refreshTimerId } = get();
    if (refreshTimerId) {
      clearTimeout(refreshTimerId);
      set({ refreshTimerId: null });
    }
  },

  scheduleRefresh: () => {
    get().clearRefreshTimer();
    const { accessToken } = get();
    if (!accessToken) return;

    const expiryMs = getTokenExpiryMs(accessToken);
    const delay =
      expiryMs !== null
        ? Math.max(expiryMs - Date.now() - REFRESH_BUFFER_MS, 5_000)
        : 14 * 60 * 1000;

    const timerId = setTimeout(async () => {
      const refreshToken = get().refreshToken ?? authStorage.getRefreshToken();
      if (!refreshToken) return;

      try {
        const { apiClient } = await import("@/lib/api-client");
        const data = await apiClient<{ accessToken: string; refreshToken: string }>(
          "/auth/refresh",
          {
            method: "POST",
            body: { refreshToken },
            auth: false,
            skipRefresh: true,
          },
        );
        get().setTokens(data.accessToken, data.refreshToken);
      } catch {
        get().logout();
      }
    }, delay);

    set({ refreshTimerId: timerId });
  },
}));
