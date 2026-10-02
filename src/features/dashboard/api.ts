import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/axios";
import { queryKeys } from "@/lib/query/query-keys";
import type { Paginated } from "@/types/api-envelope";
import type { components } from "@/types/api";

type Project = components["schemas"]["Project"];
type Task = components["schemas"]["Task"];

export function dashboardQueryOptions(orgId: string) {
  return queryOptions({
    queryKey: queryKeys.dashboard(orgId),
    queryFn: async () => {
      const [projects, tasks] = await Promise.all([
        apiClient.get<Paginated<Project>>(
          `/organizations/${encodeURIComponent(orgId)}/projects`,
          {
            params: {
              page: 1,
              page_size: 5,
              sort: "updated_at",
              order: "desc",
            },
          },
        ),
        apiClient.get<Paginated<Task>>(
          `/organizations/${encodeURIComponent(orgId)}/tasks`,
          {
            params: {
              page: 1,
              page_size: 5,
              sort: "updated_at",
              order: "desc",
            },
          },
        ),
      ]);

      return {
        projectCount: projects.data.pagination.total,
        taskCount: tasks.data.pagination.total,
        recentProjects: projects.data.data,
        recentTasks: tasks.data.data,
      };
    },
  });
}

export function useDashboardOverview(orgId: string) {
  return useQuery(dashboardQueryOptions(orgId));
}
