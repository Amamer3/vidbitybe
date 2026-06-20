"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings, Video } from "lucide-react";
import { StartInstantMeetingButton } from "@/features/meetings/start-instant-meeting-button";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { authService } from "@/services/auth";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // proceed with local logout
    } finally {
      logout();
      router.push("/login");
    }
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Video className="h-6 w-6 text-primary" />
          <span>VidBitye</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <Link
            href="/dashboard"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/meetings/new"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname.startsWith("/meetings") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            New Meeting
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <StartInstantMeetingButton size="sm" className="hidden md:inline-flex">
            Instant
          </StartInstantMeetingButton>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
