import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/axios";
import { queryKeys } from "@/lib/query/query-keys";
import type { ApiResponse } from "@/types/api-envelope";
import type { components } from "@/types/api";

export type Team = components["schemas"]["Team"];

export function teamsQueryOptions(orgId: string) {
  return queryOptions({
    queryKey: queryKeys.teams(orgId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Team[]>>(
        `/organizations/${encodeURIComponent(orgId)}/teams`,
      );
      return response.data.data;
    },
  });
}

export function useTeams(orgId: string) {
  return useQuery(teamsQueryOptions(orgId));
}
