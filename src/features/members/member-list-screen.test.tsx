// @vitest-environment jsdom

import { MemberListScreen } from "@/features/members/member-list-screen";
import type { Organization } from "@/features/organizations/api";
import { OrganizationProvider } from "@/features/organizations/organization-context";
import { apiBaseURL } from "@/lib/api/axios";
import { server } from "@/test/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

const organization: Organization = {
  id: "org-1",
  name: "Northstar Studio",
  slug: "northstar",
  status: "active",
  role: "Owner",
  created_at: "2026-10-02T00:00:00Z",
  updated_at: "2026-10-02T00:00:00Z",
};

describe("MemberListScreen", () => {
  it("assigns a role using membership ID and role ID", async () => {
    let assignedRoleId = "";
    let memberRole = "Member";
    server.use(
      http.get(`${apiBaseURL}/organizations/org-1/members`, () =>
        HttpResponse.json({
          data: [
            {
              membership_id: "membership-1",
              user_id: "user-1",
              email: "ada@example.com",
              first_name: "Ada",
              last_name: "Lovelace",
              role: memberRole,
              status: "active",
              joined_at: "2026-10-02T00:00:00Z",
            },
          ],
        }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/roles`, () =>
        HttpResponse.json({
          data: [
            {
              id: "role-member",
              organization_id: "org-1",
              name: "Member",
              is_system: true,
              permissions: ["members.read", "roles.read"],
              created_at: "2026-10-02T00:00:00Z",
              updated_at: "2026-10-02T00:00:00Z",
            },
            {
              id: "role-owner",
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
      http.patch(
        `${apiBaseURL}/organizations/org-1/members/membership-1/role`,
        async ({ request }) => {
          const body = (await request.json()) as { role_id?: string };
          assignedRoleId = body.role_id ?? "";
          memberRole = "Owner";
          return HttpResponse.json({ data: { role: memberRole } });
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
          <MemberListScreen />
        </OrganizationProvider>
      </QueryClientProvider>,
    );

    const roleSelect = await screen.findByLabelText("Role for Ada Lovelace");
    fireEvent.change(roleSelect, { target: { value: "role-owner" } });

    await waitFor(() => expect(assignedRoleId).toBe("role-owner"));
    await waitFor(() =>
      expect(screen.getByLabelText("Role for Ada Lovelace")).toHaveValue(
        "role-owner",
      ),
    );
  });
});
