"use client";

import { Download, Share, SquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export function InstallPrompt() {
  const { canInstallNatively, dismiss, install, isVisible, platform } = usePwaInstall();

  if (!isVisible || !platform) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-safe sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-w-sm sm:px-0"
      role="dialog"
      aria-labelledby="pwa-install-title"
      aria-describedby="pwa-install-description"
    >
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="relative space-y-2 pb-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8"
            onClick={dismiss}
            aria-label="Dismiss install prompt"
          >
            <X />
          </Button>
          <CardTitle id="pwa-install-title" className="pr-10 text-lg">
            Install VidBitye
          </CardTitle>
          <CardDescription id="pwa-install-description">
            Add VidBitye to your home screen for quick access to meetings.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3 pb-4 text-sm text-muted-foreground">
          {platform === "ios" ? (
            <ol className="space-y-2">
              <li className="flex items-start gap-2">
                <Share className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>
                  Tap the <strong className="text-foreground">Share</strong> button in Safari.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <SquarePlus className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>
                  Choose <strong className="text-foreground">Add to Home Screen</strong>.
                </span>
              </li>
            </ol>
          ) : platform === "android" ? (
            <p>
              {canInstallNatively
                ? "Install the app for faster launches, full-screen meetings, and home screen access."
                : "Open your browser menu and choose Install app or Add to Home screen."}
            </p>
          ) : platform === "desktop" ? (
            <p>
              Install VidBitye on this device for quick access from your desktop or taskbar.
            </p>
          ) : (
            <p>Use your browser&apos;s install option to add VidBitye as an app on this device.</p>
          )}
        </CardContent>

        <CardFooter className="gap-2 pb-4">
          {canInstallNatively ? (
            <Button type="button" className="flex-1" onClick={() => void install()}>
              <Download />
              Install app
            </Button>
          ) : null}
          <Button type="button" variant="outline" className="flex-1" onClick={dismiss}>
            Not now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
