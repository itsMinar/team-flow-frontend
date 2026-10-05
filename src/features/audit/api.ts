import { apiClient } from "@/lib/api/axios";
import { queryKeys } from "@/lib/query/query-keys";
import type { paths } from "@/types/api";
import type { Paginated } from "@/types/api-envelope";
import { queryOptions, useQuery } from "@tanstack/react-query";

export type AuditEntry = {
  id: string;
  action: string;
  outcome: "success" | "failure" | "denied";
  actor_user_id?: string;
  target_type?: string;
  target_id?: string;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  trace_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AuditListParams = NonNullable<
  paths["/api/v1/organizations/{orgID}/audit-logs"]["get"]["parameters"]["query"]
>;

export function auditLogsQueryOptions(orgId: string, params: AuditListParams) {
  return queryOptions({
    queryKey: queryKeys.auditLogs(orgId, params),
    queryFn: async () => {
      const response = await apiClient.get<Paginated<AuditEntry>>(
        `/organizations/${encodeURIComponent(orgId)}/audit-logs`,
        { params },
      );
      return response.data;
    },
  });
}

export function useAuditLogs(
  orgId: string,
  params: AuditListParams,
  enabled = true,
) {
  return useQuery({ ...auditLogsQueryOptions(orgId, params), enabled });
}
