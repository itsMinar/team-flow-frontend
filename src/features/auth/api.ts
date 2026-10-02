import { apiClient, clearClientSession } from "@/lib/api/axios";
import { tokenService } from "@/lib/api/token-service";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/api-envelope";

type AuthSession = components["schemas"]["AuthSession"];
type LoginRequest = components["schemas"]["LoginRequest"];
type RegisterRequest = components["schemas"]["RegisterRequest"];
type User = components["schemas"]["User"];

export const authApi = {
  async login(input: LoginRequest): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession>>(
      "/auth/login",
      input,
    );
    return response.data.data;
  },

  async register(input: RegisterRequest): Promise<AuthSession> {
    const response = await apiClient.post<ApiResponse<AuthSession>>(
      "/auth/register",
      input,
    );
    return response.data.data;
  },

  async currentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>("/auth/me");
    return response.data.data;
  },

  async logout(): Promise<void> {
    const refreshToken = tokenService.getRefreshToken();

    try {
      if (refreshToken) {
        await apiClient.post<ApiResponse<unknown>>("/auth/logout", {
          refresh_token: refreshToken,
        });
      }
    } finally {
      clearClientSession();
    }
  },

  async logoutAll(): Promise<void> {
    try {
      await apiClient.post<ApiResponse<unknown>>("/auth/logout-all");
    } finally {
      clearClientSession();
    }
  },
};
