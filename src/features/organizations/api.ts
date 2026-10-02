import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/axios";
import { queryKeys } from "@/lib/query/query-keys";
import type { ApiResponse } from "@/types/api-envelope";
import type { components } from "@/types/api";

export type Organization = components["schemas"]["Organization"];

export const organizationsQueryOptions = queryOptions({
  queryKey: queryKeys.organizations,
  queryFn: async () => {
    const response =
      await apiClient.get<ApiResponse<Organization[]>>("/organizations");
    return response.data.data;
  },
});

export function organizationQueryOptions(orgId: string) {
  return queryOptions({
    queryKey: queryKeys.organization(orgId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Organization>>(
        `/organizations/${encodeURIComponent(orgId)}`,
      );
      return response.data.data;
    },
  });
}

export function useOrganizations() {
  return useQuery(organizationsQueryOptions);
}

export function useOrganization(orgId: string) {
  return useQuery(organizationQueryOptions(orgId));
}
