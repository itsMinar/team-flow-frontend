import { apiClient } from "@/lib/api/axios";
import { queryKeys } from "@/lib/query/query-keys";
import type { components, paths } from "@/types/api";
import type { ApiResponse, Paginated } from "@/types/api-envelope";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export type APIKey = components["schemas"]["APIKey"];
export type CreatedAPIKey = components["schemas"]["CreatedAPIKey"];
export type CreateAPIKeyRequest = components["schemas"]["CreateAPIKeyRequest"];
export type APIKeyListParams = NonNullable<
  paths["/api/v1/organizations/{orgID}/api-keys"]["get"]["parameters"]["query"]
>;

export function apiKeysQueryOptions(orgId: string, params: APIKeyListParams) {
  return queryOptions({
    queryKey: queryKeys.apiKeys(orgId, params),
    queryFn: async () => {
      const response = await apiClient.get<Paginated<APIKey>>(
        `/organizations/${encodeURIComponent(orgId)}/api-keys`,
        { params },
      );
      return response.data;
    },
  });
}

export function useAPIKeys(
  orgId: string,
  params: APIKeyListParams,
  enabled = true,
) {
  return useQuery({ ...apiKeysQueryOptions(orgId, params), enabled });
}

export async function createAPIKey(
  orgId: string,
  input: CreateAPIKeyRequest,
): Promise<CreatedAPIKey> {
  const response = await apiClient.post<ApiResponse<CreatedAPIKey>>(
    `/organizations/${encodeURIComponent(orgId)}/api-keys`,
    input,
  );
  return response.data.data;
}

export function useRevokeAPIKey(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (apiKeyId: string) =>
      apiClient.delete(
        `/organizations/${encodeURIComponent(orgId)}/api-keys/${encodeURIComponent(apiKeyId)}`,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys(orgId) }),
  });
}
