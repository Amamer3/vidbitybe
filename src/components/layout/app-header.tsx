"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Settings, Video, X } from "lucide-react";
import { StartInstantMeetingButton } from "@/features/meetings/start-instant-meeting-button";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { authService } from "@/services/auth";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const closeMenu = () => setMenuOpen(false);
  useBodyScrollLock(menuOpen);

  if (!user) return null;

  const navLinkClass = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/90 pt-safe shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/75">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 sm:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link href="/dashboard" className="flex min-w-0 items-center gap-2 font-semibold">
            <Video className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
            <span className="truncate text-sm sm:text-base">VidBitye</span>
          </Link>
        </div>

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

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <StartInstantMeetingButton size="sm" className="hidden md:inline-flex">
            Instant
          </StartInstantMeetingButton>
          <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
            <Link href="/settings" aria-label="Settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <Button variant="outline" size="sm" onClick={handleLogout} className="px-2 sm:px-3">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] sm:hidden"
            onClick={closeMenu}
          />
          <nav className="absolute inset-x-0 top-full z-50 border-b border-border/70 bg-card/95 px-4 py-4 shadow-lg backdrop-blur-md sm:hidden">
            <div className="flex flex-col gap-1">
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className={navLinkClass(pathname === "/dashboard")}
              >
                Dashboard
              </Link>
              <Link
                href="/meetings/new"
                onClick={closeMenu}
                className={navLinkClass(pathname.startsWith("/meetings"))}
              >
                New Meeting
              </Link>
              <Link
                href="/settings"
                onClick={closeMenu}
                className={navLinkClass(pathname === "/settings")}
              >
                Settings
              </Link>
              <div className="mt-2 border-t pt-3">
                <StartInstantMeetingButton className="w-full">
                  Start instant meeting
                </StartInstantMeetingButton>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
