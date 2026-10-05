// @vitest-environment jsdom

import type { Organization } from "@/features/organizations/api";
import { OrganizationProvider } from "@/features/organizations/organization-context";
import { TeamDetailScreen } from "@/features/teams/team-detail-screen";
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

const organization: Organization = {
  id: "org-1",
  name: "Northstar Studio",
  slug: "northstar",
  status: "active",
  role: "Manager",
  created_at: "2026-10-02T00:00:00Z",
  updated_at: "2026-10-02T00:00:00Z",
};

const candidate = {
  membership_id: "membership-1",
  user_id: "user-2",
  email: "grace@example.com",
  first_name: "Grace",
  last_name: "Hopper",
  role: "Member",
  status: "active",
  joined_at: "2026-10-02T00:00:00Z",
};

function renderTeam() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider organization={organization}>
        <TeamDetailScreen teamId="team-1" />
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}

describe("TeamDetailScreen", () => {
  beforeEach(() => routerReplace.mockReset());

  it("adds an active organization member when teams.manage is granted", async () => {
    let teamMembers: Array<typeof candidate & { id: string }> = [];
    let addedUserId = "";

    server.use(
      http.get(`${apiBaseURL}/organizations/org-1/teams/team-1`, () =>
        HttpResponse.json({
          data: {
            id: "team-1",
            organization_id: "org-1",
            name: "Platform",
            description: "Core systems",
            created_by: "user-1",
            created_at: "2026-10-02T00:00:00Z",
            updated_at: "2026-10-02T00:00:00Z",
          },
        }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/teams/team-1/members`, () =>
        HttpResponse.json({ data: teamMembers }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/members`, () =>
        HttpResponse.json({ data: [candidate] }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/roles`, () =>
        HttpResponse.json({
          data: [
            {
              id: "role-manager",
              organization_id: "org-1",
              name: "Manager",
              is_system: true,
              permissions: ["teams.read", "teams.manage"],
              created_at: "2026-10-02T00:00:00Z",
              updated_at: "2026-10-02T00:00:00Z",
            },
          ],
        }),
      ),
      http.post(
        `${apiBaseURL}/organizations/org-1/teams/team-1/members`,
        async ({ request }) => {
          const body = (await request.json()) as { user_id?: string };
          addedUserId = body.user_id ?? "";
          teamMembers = [{ ...candidate, id: "team-member-1" }];
          return HttpResponse.json({ data: teamMembers[0] }, { status: 201 });
        },
      ),
    );

    renderTeam();
    fireEvent.click(await screen.findByRole("button", { name: "Add member" }));
    fireEvent.change(await screen.findByLabelText("Member"), {
      target: { value: "user-2" },
    });
    const dialog = screen.getByRole("dialog", { name: "Add team member" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Add member" }));

    await waitFor(() => expect(addedUserId).toBe("user-2"));
    expect(await screen.findByText("Grace Hopper")).toBeVisible();
  });
});
