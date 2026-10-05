import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/axios";
import { organizationRolesQueryOptions } from "@/features/permissions/api";
import type { OrganizationRole } from "@/features/permissions/api";
import { queryKeys } from "@/lib/query/query-keys";
import type { ApiResponse } from "@/types/api-envelope";
import type { components } from "@/types/api";

export type RoleRequest = components["schemas"]["RoleRequest"];

const rolePath = (orgId: string, roleId: string) =>
  `/organizations/${encodeURIComponent(orgId)}/roles/${encodeURIComponent(roleId)}`;

export { organizationRolesQueryOptions };
export type { OrganizationRole };

export function useCreateRole(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RoleRequest) => {
      const response = await apiClient.post<ApiResponse<OrganizationRole>>(
        `/organizations/${encodeURIComponent(orgId)}/roles`,
        input,
      );
      return response.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.roles(orgId) }),
  });
}

export function useUpdateRole(orgId: string, roleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RoleRequest) => {
      const response = await apiClient.patch<ApiResponse<OrganizationRole>>(
        rolePath(orgId, roleId),
        input,
      );
      return response.data.data;
    },
    onSuccess: async (role) => {
      queryClient.setQueryData<OrganizationRole[]>(
        queryKeys.roles(orgId),
        (roles) =>
          roles?.map((current) => (current.id === role.id ? role : current)),
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.roles(orgId) });
    },
  });
}

export function useDeleteRole(orgId: string, roleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete(rolePath(orgId, roleId)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.roles(orgId) }),
  });
}
