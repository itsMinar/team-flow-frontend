// @vitest-environment jsdom

import type { Organization } from "@/features/organizations/api";
import { OrganizationProvider } from "@/features/organizations/organization-context";
import { TaskListScreen } from "@/features/tasks/task-list-screen";
import { apiBaseURL } from "@/lib/api/axios";
import { server } from "@/test/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  pathname: "/orgs/org-1/tasks",
  search: "",
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ replace: navigation.replace }),
  useSearchParams: () => new URLSearchParams(navigation.search),
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

function task(status = "in_progress") {
  return {
    id: "task-1",
    organization_id: "org-1",
    project_id: "project-1",
    title: "Review launch plan",
    description: null,
    status,
    priority: "high",
    assignee_id: null,
    due_date: null,
    created_by: "user-1",
    created_at: "2026-10-02T00:00:00Z",
    updated_at: "2026-10-02T00:00:00Z",
  };
}

function renderTaskList() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizationProvider organization={organization}>
        <TaskListScreen />
      </OrganizationProvider>
    </QueryClientProvider>,
  );
}

function addListHandlers(
  status = "in_progress",
  serverStatus?: { value: string },
) {
  server.use(
    http.get(`${apiBaseURL}/organizations/org-1/tasks`, () =>
      HttpResponse.json({
        data: [task(serverStatus?.value ?? status)],
        pagination: { page: 1, page_size: 20, total: 1, total_pages: 1 },
      }),
    ),
    http.get(`${apiBaseURL}/organizations/org-1/members`, () =>
      HttpResponse.json({ data: [] }),
    ),
    http.get(`${apiBaseURL}/organizations/org-1/roles`, () =>
      HttpResponse.json({
        data: [
          {
            id: "role-1",
            organization_id: "org-1",
            name: "Owner",
            is_system: true,
            permissions: ["tasks.read", "tasks.update"],
            created_at: "2026-10-02T00:00:00Z",
            updated_at: "2026-10-02T00:00:00Z",
          },
        ],
      }),
    ),
  );
}

describe("TaskListScreen", () => {
  beforeEach(() => {
    navigation.pathname = "/orgs/org-1/tasks";
    navigation.search = "";
    navigation.replace.mockReset();
  });

  it("submits status changes through the optimistic update hook", async () => {
    let submittedStatus = "";
    const serverStatus = { value: "in_progress" };
    addListHandlers("in_progress", serverStatus);
    server.use(
      http.patch(
        `${apiBaseURL}/organizations/org-1/tasks/task-1`,
        async ({ request }) => {
          const body = (await request.json()) as { status?: string };
          submittedStatus = body.status ?? "";
          serverStatus.value = submittedStatus;
          return HttpResponse.json({ data: task(submittedStatus) });
        },
      ),
    );

    renderTaskList();
    expect(
      await screen.findByRole("link", { name: "Review launch plan" }),
    ).toBeVisible();
    fireEvent.change(
      await screen.findByLabelText("Status for Review launch plan"),
      {
        target: { value: "done" },
      },
    );

    await waitFor(() => expect(submittedStatus).toBe("done"));
    expect(screen.getByLabelText("Status for Review launch plan")).toHaveValue(
      "done",
    );
  });

  it("renders tasks in status columns when board view is in the URL", async () => {
    navigation.search = "view=board";
    addListHandlers();

    renderTaskList();

    expect(
      await screen.findByRole("region", { name: "Tasks grouped by status" }),
    ).toBeVisible();
    expect(
      screen.getByRole("region", { name: "In progress tasks" }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Review launch plan" }),
    ).toBeVisible();
  });
});
