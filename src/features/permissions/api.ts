import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/axios";
import { queryKeys } from "@/lib/query/query-keys";
import type { ApiResponse } from "@/types/api-envelope";
import type { components } from "@/types/api";

export type OrganizationRole = components["schemas"]["Role"];

export function organizationRolesQueryOptions(orgId: string) {
  return queryOptions({
    queryKey: queryKeys.roles(orgId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<OrganizationRole[]>>(
        `/organizations/${encodeURIComponent(orgId)}/roles`,
      );
      return response.data.data;
    },
  });
}

export function useOrganizationRoles(orgId: string) {
  return useQuery(organizationRolesQueryOptions(orgId));
}
