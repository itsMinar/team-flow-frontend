// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProjectListScreen } from "@/features/projects/project-list-screen";
import { OrganizationProvider } from "@/features/organizations/organization-context";
import type { Organization } from "@/features/organizations/api";
import { apiBaseURL } from "@/lib/api/axios";
import { useAuthStore } from "@/lib/api/auth-store";
import { server } from "@/test/server";

const { routerReplace } = vi.hoisted(() => ({ routerReplace: vi.fn() }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/orgs/org-1/projects",
  useRouter: () => ({ replace: routerReplace }),
  useSearchParams: () => new URLSearchParams(),
}));

const organization: Organization = {
  id: "org-1",
  name: "Northstar Studio",
  slug: "northstar",
  status: "active",
  role: "Owner",
  created_at: "2026-10-02T00:00:00Z",
  updated_at: "2026-10-02T00:00:00Z",
};

function renderProjects() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider organization={organization}>
        <ProjectListScreen />
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}

function project(id: string, name: string) {
  return {
    id,
    organization_id: "org-1",
    name,
    description: null,
    status: "planning",
    priority: "medium",
    created_by: "user-1",
    created_at: "2026-10-02T00:00:00Z",
    updated_at: "2026-10-02T00:00:00Z",
  };
}

describe("ProjectListScreen", () => {
  beforeEach(() => {
    routerReplace.mockReset();
    useAuthStore.getState().clearSession();
    useAuthStore.getState().setStatus("authenticated");
  });

  it("shows projects and creates a project when the active role permits it", async () => {
    let createdName = "";
    server.use(
      http.get(`${apiBaseURL}/organizations/org-1/roles`, () =>
        HttpResponse.json({
          data: [
            {
              id: "role-1",
              organization_id: "org-1",
              name: "Owner",
              is_system: true,
              permissions: ["projects.read", "projects.create"],
              created_at: "2026-10-02T00:00:00Z",
              updated_at: "2026-10-02T00:00:00Z",
            },
          ],
        }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/teams`, () =>
        HttpResponse.json({ data: [] }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/projects`, () =>
        HttpResponse.json({
          data: [project("project-1", "Platform refresh")],
          pagination: { page: 1, page_size: 20, total: 1, total_pages: 1 },
        }),
      ),
      http.post(
        `${apiBaseURL}/organizations/org-1/projects`,
        async ({ request }) => {
          const body = (await request.json()) as { name?: string };
          createdName = body.name ?? "";
          return HttpResponse.json(
            { data: project("project-2", createdName) },
            { status: 201 },
          );
        },
      ),
    );

    renderProjects();
    expect(
      await screen.findByRole("link", { name: "Platform refresh" }),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "New project" }));
    expect(
      await screen.findByRole("dialog", { name: "Create project" }),
    ).toBeVisible();
    fireEvent.change(screen.getByLabelText("Project name"), {
      target: { value: "Orchard refresh" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create project" }));

    await waitFor(() => expect(createdName).toBe("Orchard refresh"));
  });
});
