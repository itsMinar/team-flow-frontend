// @vitest-environment jsdom

import { InvitationListScreen } from "@/features/invitations/invitation-list-screen";
import type { Organization } from "@/features/organizations/api";
import { OrganizationProvider } from "@/features/organizations/organization-context";
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

const organization: Organization = {
  id: "org-1",
  name: "Northstar Studio",
  slug: "northstar",
  status: "active",
  role: "Owner",
  created_at: "2026-10-02T00:00:00Z",
  updated_at: "2026-10-02T00:00:00Z",
};

const { routerReplace } = vi.hoisted(() => ({ routerReplace: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/orgs/org-1/invitations",
  useRouter: () => ({ replace: routerReplace }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("InvitationListScreen", () => {
  beforeEach(() => routerReplace.mockReset());

  it("sends an invite without receiving or displaying a token", async () => {
    const rows: Array<Record<string, unknown>> = [];
    let sentEmail = "";
    let sentRoleId = "";
    server.use(
      http.get(`${apiBaseURL}/organizations/org-1/invitations`, () =>
        HttpResponse.json({
          data: rows,
          pagination: {
            page: 1,
            page_size: 20,
            total: rows.length,
            total_pages: rows.length ? 1 : 0,
          },
        }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/roles`, () =>
        HttpResponse.json({
          data: [
            {
              id: "11111111-1111-4111-8111-111111111111",
              organization_id: "org-1",
              name: "Member",
              is_system: true,
              permissions: [],
              created_at: "2026-10-02T00:00:00Z",
              updated_at: "2026-10-02T00:00:00Z",
            },
            {
              id: "22222222-2222-4222-8222-222222222222",
              organization_id: "org-1",
              name: "Owner",
              is_system: true,
              permissions: ["members.read", "members.manage", "roles.read"],
              created_at: "2026-10-02T00:00:00Z",
              updated_at: "2026-10-02T00:00:00Z",
            },
          ],
        }),
      ),
      http.post(
        `${apiBaseURL}/organizations/org-1/invitations`,
        async ({ request }) => {
          const body = (await request.json()) as {
            email: string;
            role_id: string;
          };
          sentEmail = body.email;
          sentRoleId = body.role_id;
          const invitation = {
            id: "invitation-1",
            organization_id: "org-1",
            email: body.email,
            role_id: body.role_id,
            role_name: "Member",
            status: "pending",
            invited_by: "user-1",
            expires_at: "2026-10-12T00:00:00Z",
            created_at: "2026-10-05T00:00:00Z",
            updated_at: "2026-10-05T00:00:00Z",
          };
          rows.push(invitation);
          return HttpResponse.json({ data: invitation }, { status: 201 });
        },
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
        <OrganizationProvider organization={organization}>
          <InvitationListScreen />
        </OrganizationProvider>
      </QueryClientProvider>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Invite teammate" }),
    );
    const dialog = await screen.findByRole("dialog", {
      name: "Invite a teammate",
    });
    fireEvent.change(within(dialog).getByLabelText("Email address"), {
      target: { value: "grace@example.com" },
    });
    fireEvent.change(within(dialog).getByLabelText("Organization role"), {
      target: { value: "11111111-1111-4111-8111-111111111111" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Send invitation" }),
    );

    await waitFor(() => expect(sentEmail).toBe("grace@example.com"));
    expect(sentRoleId).toBe("11111111-1111-4111-8111-111111111111");
    expect(await screen.findByText("grace@example.com")).toBeVisible();
    expect(screen.queryByText(/token/i)).toBeNull();
  });
});
