"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type BeforeInstallPromptEvent,
  dismissInstallPrompt,
  getInstallPlatform,
  isIOSDevice,
  isStandaloneMode,
  wasInstallPromptDismissed,
} from "@/lib/pwa";

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<ReturnType<typeof getInstallPlatform>>(null);

  useEffect(() => {
    if (isStandaloneMode() || wasInstallPromptDismissed()) {
      return;
    }

    let hasNativePrompt = false;
    let showTimer: number | undefined;

    const revealPrompt = () => {
      const nextPlatform = getInstallPlatform(hasNativePrompt);
      if (!nextPlatform) {
        return;
      }

      setPlatform(nextPlatform);
      setIsVisible(true);
    };

    const scheduleReveal = (delayMs: number) => {
      window.clearTimeout(showTimer);
      showTimer = window.setTimeout(revealPrompt, delayMs);
    };

    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      hasNativePrompt = true;
      setDeferredPrompt(event);
      scheduleReveal(800);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    scheduleReveal(isIOSDevice() ? 1500 : 3500);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    dismissInstallPrompt();
    setIsVisible(false);
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setIsVisible(false);
    }

    setDeferredPrompt(null);
  }, [deferredPrompt]);

  return {
    dismiss,
    install,
    isVisible,
    platform,
    canInstallNatively: Boolean(deferredPrompt),
  };
}
