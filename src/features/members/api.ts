import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiClient } from "@/lib/api/axios";
import { queryKeys } from "@/lib/query/query-keys";
import type { ApiResponse } from "@/types/api-envelope";
import type { components } from "@/types/api";

export type Member = components["schemas"]["Member"];
export type AssignRoleRequest = components["schemas"]["AssignRoleRequest"];

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

export function useAssignMemberRole(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      membershipId,
      roleId,
    }: {
      membershipId: string;
      roleId: string;
    }) => {
      const response = await apiClient.patch<ApiResponse<Member>>(
        `/organizations/${encodeURIComponent(orgId)}/members/${encodeURIComponent(membershipId)}/role`,
        { role_id: roleId } satisfies AssignRoleRequest,
      );
      return response.data.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.members(orgId) }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.organization(orgId),
        }),
      ]);
    },
  });
}
