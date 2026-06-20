"use client";

import { authStorage } from "@/lib/auth-storage";
import { API_URL } from "@/lib/constants";
import { ApiError, type ApiRequestOptions } from "@/types/api";
import { useAuthStore } from "@/store/auth";

let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  const token = refreshToken ?? authStorage.getRefreshToken();

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ refreshToken: token }),
    });

    if (!response.ok) {
      logout();
      return false;
    }

    const data = (await response.json()) as {
      accessToken: string;
      refreshToken: string;
    };
    setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    logout();
    return false;
  }
}

async function refreshOnce(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = attemptRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, auth = true, skipRefresh = false, headers, ...rest } = options;

  const requestHeaders: HeadersInit = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...headers,
  };

  if (auth) {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      (requestHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && auth && !skipRefresh) {
    const refreshed = await refreshOnce();
    if (refreshed) {
      return apiClient<T>(path, { ...options, skipRefresh: true });
    }
    throw new ApiError("Unauthorized", 401);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data as { message?: string })?.message ??
      (Array.isArray((data as { message?: string[] })?.message)
        ? (data as { message: string[] }).message.join(", ")
        : `Request failed with status ${response.status}`);
    throw new ApiError(message, response.status, data);
  }

  return data as T;
}
