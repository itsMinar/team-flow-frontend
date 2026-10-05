import type { InvitationListParams } from "@/features/invitations/api";
import { invitationsApi } from "@/features/invitations/api";
import { queryKeys } from "@/lib/query/query-keys";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export function invitationsQueryOptions(
  orgId: string,
  params: InvitationListParams,
) {
  return queryOptions({
    queryKey: queryKeys.invitations(orgId, params),
    queryFn: () => invitationsApi.list(orgId, params),
  });
}

export function useInvitations(
  orgId: string,
  params: InvitationListParams,
  enabled = true,
) {
  return useQuery({ ...invitationsQueryOptions(orgId, params), enabled });
}

export function useCreateInvitation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { email: string; role_id: string }) =>
      invitationsApi.create(orgId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations(orgId) }),
  });
}

export function useResendInvitation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      invitationsApi.resend(orgId, invitationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations(orgId) }),
  });
}

export function useRevokeInvitation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      invitationsApi.revoke(orgId, invitationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.invitations(orgId) }),
  });
}
