import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { projectsApi } from "@/features/projects/api";
import type {
  CreateProjectRequest,
  ProjectListParams,
  UpdateProjectRequest,
} from "@/features/projects/api";
import { queryKeys } from "@/lib/query/query-keys";

export function projectsQueryOptions(
  orgId: string,
  filters: ProjectListParams,
) {
  return queryOptions({
    queryKey: queryKeys.projectList(orgId, filters),
    queryFn: () => projectsApi.list(orgId, filters),
  });
}

export function projectQueryOptions(orgId: string, projectId: string) {
  return queryOptions({
    queryKey: queryKeys.project(orgId, projectId),
    queryFn: () => projectsApi.get(orgId, projectId),
  });
}

export function projectActivityQueryOptions(
  orgId: string,
  projectId: string,
  page = 1,
  pageSize = 20,
) {
  const filters = { page, page_size: pageSize };
  return queryOptions({
    queryKey: queryKeys.projectActivity(orgId, projectId, filters),
    queryFn: () => projectsApi.activity(orgId, projectId, filters),
  });
}

export function useProjects(
  orgId: string,
  filters: ProjectListParams,
  enabled = true,
) {
  return useQuery({ ...projectsQueryOptions(orgId, filters), enabled });
}

export function useProject(orgId: string, projectId: string) {
  return useQuery(projectQueryOptions(orgId, projectId));
}

export function useProjectActivity(
  orgId: string,
  projectId: string,
  page = 1,
  pageSize = 20,
) {
  return useQuery(
    projectActivityQueryOptions(orgId, projectId, page, pageSize),
  );
}

function invalidateProjectQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  orgId: string,
) {
  return queryClient.invalidateQueries({
    queryKey: ["organizations", orgId, "projects"],
  });
}

export function useCreateProject(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectRequest) =>
      projectsApi.create(orgId, input),
    onSuccess: async (project) => {
      queryClient.setQueryData(queryKeys.project(orgId, project.id), project);
      await invalidateProjectQueries(queryClient, orgId);
    },
  });
}

export function useUpdateProject(orgId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProjectRequest) =>
      projectsApi.update(orgId, projectId, input),
    onSuccess: async (project) => {
      queryClient.setQueryData(queryKeys.project(orgId, projectId), project);
      await invalidateProjectQueries(queryClient, orgId);
    },
  });
}

export function useDeleteProject(orgId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => projectsApi.remove(orgId, projectId),
    onSuccess: async () => {
      queryClient.removeQueries({
        queryKey: queryKeys.project(orgId, projectId),
      });
      await invalidateProjectQueries(queryClient, orgId);
    },
  });
}
