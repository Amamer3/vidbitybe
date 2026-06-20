"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { cn } from "@/lib/utils";

interface MarketingHeaderProps {
  className?: string;
  variant?: "default" | "transparent";
}

export function MarketingHeader({
  className,
  variant = "default",
}: MarketingHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  useBodyScrollLock(menuOpen);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur-md pt-safe",
        variant === "transparent"
          ? "border-transparent bg-background/70"
          : "border-border/60 bg-background/80",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight transition-opacity hover:opacity-80 sm:gap-2.5"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm sm:h-9 sm:w-9">
            <Video className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <span className="text-sm sm:text-base">VidBitye</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How it works
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/register">Get started</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] md:hidden"
            onClick={closeMenu}
          />
          <nav className="absolute inset-x-0 top-full z-50 border-b bg-background/95 px-4 py-4 shadow-lg backdrop-blur-md md:hidden">
            <div className="flex flex-col gap-1">
              <a
                href="#features"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                How it works
              </a>
              <div className="mt-2 flex flex-col gap-2 border-t pt-3">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/login" onClick={closeMenu}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild className="w-full sm:hidden">
                  <Link href="/register" onClick={closeMenu}>
                    Get started
                  </Link>
                </Button>
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
