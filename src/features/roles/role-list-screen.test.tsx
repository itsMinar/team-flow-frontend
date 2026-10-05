// @vitest-environment jsdom

import type { Organization } from "@/features/organizations/api";
import { OrganizationProvider } from "@/features/organizations/organization-context";
import { RoleListScreen } from "@/features/roles/role-list-screen";
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

describe("RoleListScreen", () => {
  it("creates a custom role with the selected permission keys", async () => {
    const roleRows: Array<Record<string, unknown>> = [
      {
        id: "role-owner",
        organization_id: "org-1",
        name: "Owner",
        is_system: true,
        permissions: ["roles.read", "roles.manage"],
        created_at: "2026-10-02T00:00:00Z",
        updated_at: "2026-10-02T00:00:00Z",
      },
    ];
    let createdPermissions: string[] = [];

    server.use(
      http.get(`${apiBaseURL}/organizations/org-1/roles`, () =>
        HttpResponse.json({ data: roleRows }),
      ),
      http.post(
        `${apiBaseURL}/organizations/org-1/roles`,
        async ({ request }) => {
          const body = (await request.json()) as {
            name: string;
            description?: string;
            permissions: string[];
          };
          createdPermissions = body.permissions;
          const role = {
            id: "role-planner",
            organization_id: "org-1",
            name: body.name,
            description: body.description,
            is_system: false,
            permissions: body.permissions,
            created_at: "2026-10-02T00:00:00Z",
            updated_at: "2026-10-02T00:00:00Z",
          };
          roleRows.push(role);
          return HttpResponse.json({ data: role }, { status: 201 });
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
          <RoleListScreen />
        </OrganizationProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("System role")).toBeVisible();
    fireEvent.click(await screen.findByRole("button", { name: "Create role" }));
    const dialog = await screen.findByRole("dialog", {
      name: "Create custom role",
    });
    fireEvent.change(within(dialog).getByLabelText("Role name"), {
      target: { value: "Planner" },
    });
    fireEvent.click(within(dialog).getByLabelText("Read projects"));
    fireEvent.click(within(dialog).getByLabelText("Create projects"));
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create role" }),
    );

    await waitFor(() =>
      expect(createdPermissions).toEqual(["projects.read", "projects.create"]),
    );
    expect(
      await screen.findByRole("heading", { name: "Planner" }),
    ).toBeVisible();
  });
});
