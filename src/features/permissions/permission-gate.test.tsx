// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { OrganizationProvider } from "@/features/organizations/organization-context";
import { PermissionGate } from "@/features/permissions/permission-gate";
import type { Organization } from "@/features/organizations/api";
import { apiBaseURL } from "@/lib/api/axios";
import { server } from "@/test/server";

const organization: Organization = {
  id: "org-1",
  name: "Northstar Studio",
  slug: "northstar",
  status: "active",
  role: "Owner",
  created_at: "2026-10-02T00:00:00Z",
  updated_at: "2026-10-02T00:00:00Z",
};

function renderGate() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider organization={organization}>
        <PermissionGate permission="projects.create">
          <button type="button">Create project</button>
        </PermissionGate>
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}

describe("PermissionGate", () => {
  it("shows a mutation when the active role grants it", async () => {
    server.use(
      http.get(`${apiBaseURL}/organizations/org-1/roles`, () =>
        HttpResponse.json({
          data: [
            {
              id: "role-1",
              organization_id: "org-1",
              name: "Owner",
              is_system: true,
              permissions: ["projects.create"],
              created_at: "2026-10-02T00:00:00Z",
              updated_at: "2026-10-02T00:00:00Z",
            },
          ],
        }),
      ),
    );

    renderGate();
    expect(
      await screen.findByRole("button", { name: "Create project" }),
    ).toBeVisible();
  });

  it("fails closed when the active role lacks the permission", async () => {
    server.use(
      http.get(`${apiBaseURL}/organizations/org-1/roles`, () =>
        HttpResponse.json({
          data: [
            {
              id: "role-1",
              organization_id: "org-1",
              name: "Owner",
              is_system: true,
              permissions: ["projects.read"],
              created_at: "2026-10-02T00:00:00Z",
              updated_at: "2026-10-02T00:00:00Z",
            },
          ],
        }),
      ),
    );

    renderGate();
    expect(
      await screen.queryByRole("button", { name: "Create project" }),
    ).toBeNull();
  });
});
