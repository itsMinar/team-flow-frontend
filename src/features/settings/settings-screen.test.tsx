// @vitest-environment jsdom

import { SettingsScreen } from "@/features/settings/settings-screen";
import { useAuthStore } from "@/lib/api/auth-store";
import { apiBaseURL } from "@/lib/api/axios";
import { server } from "@/test/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { routerReplace } = vi.hoisted(() => ({ routerReplace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace }),
}));

describe("SettingsScreen", () => {
  beforeEach(() => {
    routerReplace.mockReset();
    useAuthStore.getState().setSession({
      access_token: "settings-test-access",
      refresh_token: "settings-test-refresh",
      token_type: "Bearer",
      expires_in: 900,
      user: {
        id: "user-1",
        email: "ada@example.com",
        first_name: "Ada",
        last_name: "Lovelace",
        status: "active",
        created_at: "2026-10-02T00:00:00Z",
      },
    });
  });

  it("loads profile data and clears the session after logout-all", async () => {
    server.use(
      http.get(`${apiBaseURL}/auth/me`, () =>
        HttpResponse.json({
          data: {
            id: "user-1",
            email: "ada@example.com",
            first_name: "Ada",
            last_name: "Lovelace",
            status: "active",
            created_at: "2026-10-02T00:00:00Z",
          },
        }),
      ),
      http.post(`${apiBaseURL}/auth/logout-all`, () =>
        HttpResponse.json({ data: { logged_out: true } }),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsScreen />
      </QueryClientProvider>,
    );

    expect(await screen.findByText("ada@example.com")).toBeVisible();
    fireEvent.click(
      screen.getByRole("button", { name: "Sign out all sessions" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Sign out everywhere?",
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Sign out all sessions" }),
    );

    await waitFor(() => expect(routerReplace).toHaveBeenCalledWith("/login"));
    expect(useAuthStore.getState().status).toBe("unauthenticated");
    expect(sessionStorage.getItem("teamflow.refreshToken")).toBeNull();
  });
});
