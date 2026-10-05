import { apiClient } from "@/lib/api/axios";
import { queryKeys } from "@/lib/query/query-keys";
import type { components } from "@/types/api";
import type { ApiResponse } from "@/types/api-envelope";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export type Team = components["schemas"]["Team"];
export type TeamMember = components["schemas"]["TeamMember"];
export type TeamRequest = components["schemas"]["TeamRequest"];

const teamPath = (orgId: string, teamId: string) =>
  `/organizations/${encodeURIComponent(orgId)}/teams/${encodeURIComponent(teamId)}`;

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

export function teamQueryOptions(orgId: string, teamId: string) {
  return queryOptions({
    queryKey: queryKeys.team(orgId, teamId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Team>>(
        teamPath(orgId, teamId),
      );
      return response.data.data;
    },
  });
}

export function teamMembersQueryOptions(orgId: string, teamId: string) {
  return queryOptions({
    queryKey: queryKeys.teamMembers(orgId, teamId),
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<TeamMember[]>>(
        `${teamPath(orgId, teamId)}/members`,
      );
      return response.data.data;
    },
  });
}

export function useTeam(orgId: string, teamId: string) {
  return useQuery(teamQueryOptions(orgId, teamId));
}

export function useTeamMembers(orgId: string, teamId: string) {
  return useQuery(teamMembersQueryOptions(orgId, teamId));
}

export function useCreateTeam(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TeamRequest) => {
      const response = await apiClient.post<ApiResponse<Team>>(
        `/organizations/${encodeURIComponent(orgId)}/teams`,
        input,
      );
      return response.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.teams(orgId) }),
  });
}

export function useUpdateTeam(orgId: string, teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TeamRequest) => {
      const response = await apiClient.patch<ApiResponse<Team>>(
        teamPath(orgId, teamId),
        input,
      );
      return response.data.data;
    },
    onSuccess: async (team) => {
      queryClient.setQueryData(queryKeys.team(orgId, teamId), team);
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams(orgId) });
    },
  });
}

export function useDeleteTeam(orgId: string, teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete(teamPath(orgId, teamId)),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: queryKeys.team(orgId, teamId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.teams(orgId) });
    },
  });
}

export function useAddTeamMember(orgId: string, teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.post<ApiResponse<TeamMember>>(
        `${teamPath(orgId, teamId)}/members`,
        { user_id: userId },
      );
      return response.data.data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.teamMembers(orgId, teamId),
      }),
  });
}

export function useRemoveTeamMember(orgId: string, teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamMemberId: string) =>
      apiClient.delete(
        `${teamPath(orgId, teamId)}/members/${encodeURIComponent(teamMemberId)}`,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.teamMembers(orgId, teamId),
      }),
  });
}
