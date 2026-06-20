import { normalizeMeetingCode } from "@/lib/meeting-mapper";

export function getMeetingJoinPath(code: string): string {
  return `/meeting/${normalizeMeetingCode(code)}`;
}

export function getMeetingJoinUrl(code: string, origin?: string): string {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "";

  return `${base.replace(/\/$/, "")}${getMeetingJoinPath(code)}`;
}
