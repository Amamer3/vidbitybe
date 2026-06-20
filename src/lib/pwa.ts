export const PWA_DISMISS_KEY = "vidbitye-pwa-install-dismissed";

export const PWA_DISMISS_DAYS = 7;

export type InstallPlatform = "android" | "ios" | "desktop" | null;

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

export function isStandaloneMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true
  );
}

export function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

export function isAndroidDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Android/.test(navigator.userAgent);
}

export function getInstallPlatform(hasNativePrompt: boolean): InstallPlatform {
  if (isIOSDevice()) {
    return "ios";
  }

  if (hasNativePrompt) {
    return isAndroidDevice() ? "android" : "desktop";
  }

  if (isAndroidDevice()) {
    return "android";
  }

  return null;
}

export function wasInstallPromptDismissed(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const dismissedAt = window.localStorage.getItem(PWA_DISMISS_KEY);
  if (!dismissedAt) {
    return false;
  }

  const elapsedMs = Date.now() - Number(dismissedAt);
  return elapsedMs < PWA_DISMISS_DAYS * 24 * 60 * 60 * 1000;
}

export function dismissInstallPrompt(): void {
  window.localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
}
