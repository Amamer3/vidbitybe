export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"] as const;

export const PROTECTED_ROUTES = ["/dashboard", "/meetings", "/meeting", "/settings"] as const;

export const REFRESH_BUFFER_MS = 60_000;
