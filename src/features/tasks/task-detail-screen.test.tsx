// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { TaskDetailScreen } from "@/features/tasks/task-detail-screen";
import { OrganizationProvider } from "@/features/organizations/organization-context";
import type { Organization } from "@/features/organizations/api";
import { apiBaseURL } from "@/lib/api/axios";
import { server } from "@/test/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

const organization: Organization = {
  id: "org-1",
  name: "Northstar Studio",
  slug: "northstar",
  status: "active",
  role: "Viewer",
  created_at: "2026-10-02T00:00:00Z",
  updated_at: "2026-10-02T00:00:00Z",
};

const task = {
  id: "task-1",
  organization_id: "org-1",
  project_id: "project-1",
  title: "Review launch plan",
  description: "Confirm the rollout checklist.",
  status: "in_review",
  priority: "high",
  assignee_id: null,
  due_date: "2026-10-22",
  created_by: "user-1",
  created_at: "2026-10-02T00:00:00Z",
  updated_at: "2026-10-03T00:00:00Z",
};

describe("TaskDetailScreen", () => {
  it("renders tenant task details and activity while hiding forbidden mutations", async () => {
    server.use(
      http.get(`${apiBaseURL}/organizations/org-1/tasks/task-1`, () =>
        HttpResponse.json({ data: task }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/tasks/task-1/activity`, () =>
        HttpResponse.json({
          data: [
            {
              id: "activity-1",
              actor_user_id: "user-1",
              action: "task.updated",
              resource_type: "task",
              resource_id: "task-1",
              metadata: {},
              created_at: "2026-10-03T00:00:00Z",
            },
          ],
          pagination: { page: 1, page_size: 20, total: 1, total_pages: 1 },
        }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/roles`, () =>
        HttpResponse.json({
          data: [
            {
              id: "role-1",
              organization_id: "org-1",
              name: "Viewer",
              is_system: true,
              permissions: ["tasks.read"],
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
          <TaskDetailScreen taskId="task-1" />
        </OrganizationProvider>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("heading", { name: "Review launch plan" }),
    ).toBeVisible();
    expect(await screen.findByText("task updated")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Edit task" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Delete task" })).toBeNull();
  });
});
