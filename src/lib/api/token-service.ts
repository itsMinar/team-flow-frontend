const refreshTokenKey = "teamflow.refreshToken";
let memoryRefreshToken: string | null = null;

export const tokenService = {
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return memoryRefreshToken;

    try {
      return (
        window.sessionStorage.getItem(refreshTokenKey) ?? memoryRefreshToken
      );
    } catch {
      return memoryRefreshToken;
    }
  },

  setRefreshToken(token: string): void {
    memoryRefreshToken = token;

    if (typeof window === "undefined") return;

    try {
      window.sessionStorage.setItem(refreshTokenKey, token);
    } catch {
      memoryRefreshToken = token;
    }
  },

  clearRefreshToken(): void {
    memoryRefreshToken = null;

    if (typeof window === "undefined") return;

    try {
      window.sessionStorage.removeItem(refreshTokenKey);
    } catch {
      memoryRefreshToken = null;
    }
  },
};
