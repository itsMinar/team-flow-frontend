import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/axios";
import { queryKeys } from "@/lib/query/query-keys";
import type { ApiResponse } from "@/types/api-envelope";
import type { components } from "@/types/api";

export type Member = components["schemas"]["Member"];

export function membersQueryOptions(orgId: string) {
  return queryOptions({
    queryKey: queryKeys.members(orgId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Member[]>>(
        `/organizations/${encodeURIComponent(orgId)}/members`,
      );
      return response.data.data;
    },
  });
}

export function useMembers(orgId: string) {
  return useQuery(membersQueryOptions(orgId));
}
