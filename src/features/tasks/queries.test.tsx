// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { useUpdateTask } from "@/features/tasks/queries";
import type { Task } from "@/features/tasks/api";
import { queryKeys } from "@/lib/query/query-keys";
import { apiBaseURL } from "@/lib/api/axios";
import { server } from "@/test/server";

const initialTask: Task = {
  id: "task-1",
  organization_id: "org-1",
  project_id: "project-1",
  title: "Review launch plan",
  description: null,
  status: "in_progress",
  priority: "high",
  assignee_id: null,
  due_date: null,
  created_by: "user-1",
  created_at: "2026-10-02T00:00:00Z",
  updated_at: "2026-10-02T00:00:00Z",
};

describe("task optimistic update", () => {
  it("rolls back status in detail and list caches after a failed update", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const filters = {
      page: 1,
      page_size: 20,
      sort: "updated_at",
      order: "desc",
    };
    const detailKey = queryKeys.task("org-1", "task-1");
    const listKey = queryKeys.taskList("org-1", filters);
    queryClient.setQueryData(detailKey, initialTask);
    queryClient.setQueryData(listKey, {
      data: [initialTask],
      pagination: { page: 1, page_size: 20, total: 1, total_pages: 1 },
    });

    server.use(
      http.patch(`${apiBaseURL}/organizations/org-1/tasks/task-1`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json(
          { error: { code: "FORBIDDEN", message: "Not allowed" } },
          { status: 403 },
        );
      }),
    );

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useUpdateTask("org-1", "task-1"), {
      wrapper,
    });

    let mutation: Promise<Task> | undefined;
    act(() => {
      mutation = result.current.mutateAsync({ status: "done" });
    });

    await waitFor(() => {
      expect(queryClient.getQueryData<Task>(detailKey)?.status).toBe("done");
      expect(
        queryClient.getQueryData<{ data: Task[] }>(listKey)?.data[0]?.status,
      ).toBe("done");
    });
    await mutation?.catch(() => undefined);

    expect(queryClient.getQueryData<Task>(detailKey)?.status).toBe(
      "in_progress",
    );
    expect(
      queryClient.getQueryData<{ data: Task[] }>(listKey)?.data[0]?.status,
    ).toBe("in_progress");
  });
});
