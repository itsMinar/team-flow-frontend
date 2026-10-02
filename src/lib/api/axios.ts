"use client";

import { useAuthStore } from "@/lib/api/auth-store";
import { tokenService } from "@/lib/api/token-service";
import { clearQueryCache } from "@/lib/query/query-client";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/api-envelope";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

type AuthSession = components["schemas"]["AuthSession"];
type RetryableConfig = InternalAxiosRequestConfig & { _authRetry?: boolean };

const apiOrigin = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

export const apiBaseURL = `${apiOrigin}/api/v1`;

const refreshClient = axios.create({
  baseURL: apiBaseURL,
  timeout: 15_000,
  adapter: "fetch",
});
export const apiClient = axios.create({
  baseURL: apiBaseURL,
  timeout: 15_000,
  adapter: "fetch",
  headers: { Accept: "application/json" },
});

let refreshInFlight: Promise<string> | undefined;

function requestRefresh(): Promise<string> {
  const refreshToken = tokenService.getRefreshToken();
  if (!refreshToken)
    return Promise.reject(new Error("No refresh token available"));

  return refreshClient
    .post<ApiResponse<AuthSession>>("/auth/refresh", {
      refresh_token: refreshToken,
    })
    .then(({ data }) => {
      useAuthStore.getState().setSession(data.data);
      return data.data.access_token;
    });
}

function refreshAccessToken(): Promise<string> {
  if (!refreshInFlight) {
    refreshInFlight = requestRefresh().finally(() => {
      refreshInFlight = undefined;
    });
  }

  return refreshInFlight;
}

function isAuthEndpoint(url: string | undefined): boolean {
  return /(?:^|\/)auth\/(?:login|register|refresh|logout|logout-all)(?:\?|$)/.test(
    url ?? "",
  );
}

function emitRateLimit(retryAfter: unknown): void {
  if (typeof window === "undefined") return;

  let retryAfterSeconds: number | undefined;
  if (typeof retryAfter === "string") {
    const seconds = Number(retryAfter);
    const timestamp = Date.parse(retryAfter);

    if (Number.isFinite(seconds) && seconds >= 0) {
      retryAfterSeconds = Math.ceil(seconds);
    } else if (Number.isFinite(timestamp)) {
      retryAfterSeconds = Math.max(
        0,
        Math.ceil((timestamp - Date.now()) / 1000),
      );
    }
  }

  window.dispatchEvent(
    new CustomEvent("teamflow:rate-limit", { detail: { retryAfterSeconds } }),
  );
}

export function clearClientSession(): void {
  useAuthStore.getState().clearSession();
  clearQueryCache();
}

function endSession(): void {
  clearClientSession();

  if (typeof window === "undefined" || window.location.pathname === "/login") {
    return;
  }

  const next = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?next=${encodeURIComponent(next)}`);
}

export async function restoreSession(): Promise<boolean> {
  if (useAuthStore.getState().accessToken) return true;
  if (!tokenService.getRefreshToken()) {
    useAuthStore.getState().setStatus("unauthenticated");
    return false;
  }

  try {
    await refreshAccessToken();
    return true;
  } catch {
    endSession();
    return false;
  }
}

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<unknown>) => {
    if (error.response?.status === 429) {
      emitRateLimit(error.response.headers["retry-after"]);
    }

    const request = error.config as RetryableConfig | undefined;
    if (
      error.response?.status !== 401 ||
      !request ||
      request._authRetry ||
      isAuthEndpoint(request.url)
    ) {
      return Promise.reject(error);
    }

    request._authRetry = true;

    try {
      const accessToken = await refreshAccessToken();
      request.headers.set("Authorization", `Bearer ${accessToken}`);
      return await apiClient.request(request);
    } catch {
      endSession();
      return Promise.reject(error);
    }
  },
);
