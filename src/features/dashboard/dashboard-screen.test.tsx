// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { DashboardScreen } from "@/features/dashboard/dashboard-screen";
import { OrganizationProvider } from "@/features/organizations/organization-context";
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

describe("DashboardScreen", () => {
  it("renders totals from project and task pagination metadata", async () => {
    server.use(
      http.get(`${apiBaseURL}/organizations/org-1/projects`, () =>
        HttpResponse.json({
          data: [],
          pagination: { page: 1, page_size: 5, total: 4, total_pages: 1 },
        }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/tasks`, () =>
        HttpResponse.json({
          data: [],
          pagination: { page: 1, page_size: 5, total: 13, total_pages: 3 },
        }),
      ),
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

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <OrganizationProvider organization={organization}>
          <DashboardScreen />
        </OrganizationProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("4")).toBeVisible();
    expect(await screen.findByText("13")).toBeVisible();
  });
});
