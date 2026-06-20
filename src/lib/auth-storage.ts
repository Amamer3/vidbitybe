const REFRESH_TOKEN_KEY = "vidbitye_refresh_token";

export const authStorage = {
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken(token: string) {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch {
      // Quota or privacy mode — session still works until reload
    }
  },

  clearRefreshToken() {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};
