"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authStorage } from "@/lib/auth-storage";
import { useAuthStore } from "@/store/auth";
import { authService } from "@/services/auth";
import { usersService } from "@/services/users";
import { AUTH_ROUTES } from "@/lib/constants";
import { Spinner } from "@/components/ui/spinner";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setInitialized, isInitialized, logout } = useAuthStore();

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const refreshToken =
        useAuthStore.getState().refreshToken ?? authStorage.getRefreshToken();

      if (!refreshToken) {
        setInitialized(true);
        return;
      }

      try {
        const tokens = await authService.refresh(refreshToken);
        useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
        const { user } = await usersService.getMe();
        if (!cancelled) {
          setAuth(user, tokens.accessToken, tokens.refreshToken);
        }
      } catch {
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setInitialized(true);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [setAuth, setInitialized, logout]);

  return <>{children}</>;
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) return;

    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    if (!isAuthenticated && !isAuthRoute && pathname !== "/") {
      router.replace("/login");
    } else if (isAuthenticated && isAuthRoute) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitialized, pathname, router]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
