import { beforeEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { apiBaseURL, apiClient } from "@/lib/api/axios";
import { useAuthStore } from "@/lib/api/auth-store";
import { tokenService } from "@/lib/api/token-service";
import { server } from "@/test/server";
import type { ApiResponse } from "@/types/api-envelope";

describe("API refresh interceptor", () => {
  beforeEach(() => {
    useAuthStore.getState().clearSession();
  });

  it("shares one refresh request and replays concurrent 401s", async () => {
    let refreshRequests = 0;
    tokenService.setRefreshToken("old-refresh-token");

    server.use(
      http.get(`${apiBaseURL}/organizations`, ({ request }) => {
        if (
          request.headers.get("authorization") !== "Bearer fresh-access-token"
        ) {
          return HttpResponse.json(
            { error: { code: "UNAUTHORIZED", message: "Expired" } },
            { status: 401 },
          );
        }

        return HttpResponse.json({ data: [{ id: "org-1" }] });
      }),
      http.post(`${apiBaseURL}/auth/refresh`, () => {
        refreshRequests += 1;
        return HttpResponse.json({
          data: {
            access_token: "fresh-access-token",
            refresh_token: "rotated-refresh-token",
            token_type: "Bearer",
            expires_in: 900,
            user: {},
          },
        });
      }),
    );

    const responses = await Promise.all([
      apiClient.get<ApiResponse<Array<{ id: string }>>>("/organizations"),
      apiClient.get<ApiResponse<Array<{ id: string }>>>("/organizations"),
    ]);

    expect(refreshRequests).toBe(1);
    expect(responses.map((response) => response.data.data)).toEqual([
      [{ id: "org-1" }],
      [{ id: "org-1" }],
    ]);
    expect(useAuthStore.getState().accessToken).toBe("fresh-access-token");
    expect(tokenService.getRefreshToken()).toBe("rotated-refresh-token");
  });
});
