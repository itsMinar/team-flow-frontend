// @vitest-environment jsdom

import { InvitationAcceptScreen } from "@/features/invitations/invitation-accept-screen";
import { useAuthStore } from "@/lib/api/auth-store";
import { apiBaseURL } from "@/lib/api/axios";
import { server } from "@/test/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { routerReplace } = vi.hoisted(() => ({ routerReplace: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: routerReplace }),
}));

const invitationToken = "x".repeat(43);

describe("InvitationAcceptScreen", () => {
  beforeEach(() => {
    routerReplace.mockReset();
    useAuthStore.getState().clearSession();
    useAuthStore.getState().setStatus("unauthenticated");
    sessionStorage.clear();
  });

  it("previews by path, accepts by body, and does not display or store the invite token", async () => {
    let tokenUsedInAccept = false;
    server.use(
      http.get(`${apiBaseURL}/invitations/${invitationToken}`, () =>
        HttpResponse.json({
          data: {
            organization_id: "org-1",
            organization_name: "Northstar Studio",
            email: "grace@example.com",
            role_name: "Member",
            status: "pending",
            expires_at: "2026-10-22T00:00:00Z",
            account_exists: false,
          },
        }),
      ),
      http.post(`${apiBaseURL}/invitations/accept`, async ({ request }) => {
        const body = (await request.json()) as { token?: string };
        tokenUsedInAccept = body.token === invitationToken;
        return HttpResponse.json(
          {
            data: {
              access_token: "test-access-token",
              refresh_token: "test-refresh-token",
              token_type: "Bearer",
              expires_in: 900,
              organization: { id: "org-1", name: "Northstar Studio" },
              role: "Member",
              user: {
                id: "user-2",
                email: "grace@example.com",
                first_name: "Grace",
                last_name: "Hopper",
                status: "active",
                created_at: "2026-10-05T00:00:00Z",
              },
            },
          },
          { status: 201 },
        );
      }),
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <InvitationAcceptScreen token={invitationToken} />
      </QueryClientProvider>,
    );

    fireEvent.change(await screen.findByLabelText("First name"), {
      target: { value: "Grace" },
    });
    fireEvent.change(screen.getByLabelText("Last name"), {
      target: { value: "Hopper" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "Abcdefg1" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Create account and join" }),
    );

    await waitFor(() =>
      expect(routerReplace).toHaveBeenCalledWith("/orgs/org-1/dashboard"),
    );
    expect(tokenUsedInAccept).toBe(true);
    expect(document.body.textContent).not.toContain(invitationToken);
    expect(sessionStorage.getItem("teamflow.refreshToken")).toBe(
      "test-refresh-token",
    );
    expect(sessionStorage.getItem("teamflow.refreshToken")).not.toContain(
      invitationToken,
    );
    expect(queryClient.getQueryCache().findAll()).toHaveLength(0);
    expect(useAuthStore.getState().status).toBe("authenticated");
  });
});
