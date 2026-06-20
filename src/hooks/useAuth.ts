"use client";

import { useAuthStore } from "@/store/auth";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const logout = useAuthStore((s) => s.logout);
  const setAuth = useAuthStore((s) => s.setAuth);

  return {
    user,
    isAuthenticated,
    isInitialized,
    logout,
    setAuth,
  };
}
