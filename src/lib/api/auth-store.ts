import { tokenService } from "@/lib/api/token-service";
import type { components } from "@/types/api";
import { create } from "zustand";

type AuthSession = components["schemas"]["AuthSession"];
type User = components["schemas"]["User"];
export type AuthStatus = "restoring" | "authenticated" | "unauthenticated";

type AuthState = {
  accessToken: string | null;
  user: User | null;
  status: AuthStatus;
  setSession: (session: AuthSession) => void;
  setStatus: (status: AuthStatus) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  status: "restoring",
  setSession: (session) => {
    tokenService.setRefreshToken(session.refresh_token);
    set({
      accessToken: session.access_token,
      user: session.user,
      status: "authenticated",
    });
  },
  setStatus: (status) => set({ status }),
  clearSession: () => {
    tokenService.clearRefreshToken();
    set({ accessToken: null, user: null, status: "unauthenticated" });
  },
}));
