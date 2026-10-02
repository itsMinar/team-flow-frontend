import type { paths, components } from "@/types/api";
import { apiClient } from "@/lib/api/axios";
import type { ApiResponse, Paginated } from "@/types/api-envelope";

export type Project = components["schemas"]["Project"];
export type CreateProjectRequest =
  components["schemas"]["CreateProjectRequest"];
export type UpdateProjectRequest =
  components["schemas"]["UpdateProjectRequest"];
export type ProjectListParams = NonNullable<
  paths["/api/v1/organizations/{orgID}/projects"]["get"]["parameters"]["query"]
>;
export type ProjectActivity = {
  id: string;
  actor_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export const projectsApi = {
  async list(orgId: string, params: ProjectListParams) {
    const response = await apiClient.get<Paginated<Project>>(
      `/organizations/${encodeURIComponent(orgId)}/projects`,
      { params },
    );
    return response.data;
  },

  async get(orgId: string, projectId: string) {
    const response = await apiClient.get<ApiResponse<Project>>(
      `/organizations/${encodeURIComponent(orgId)}/projects/${encodeURIComponent(projectId)}`,
    );
    return response.data.data;
  },

  async activity(
    orgId: string,
    projectId: string,
    params: { page: number; page_size: number },
  ) {
    const response = await apiClient.get<Paginated<ProjectActivity>>(
      `/organizations/${encodeURIComponent(orgId)}/projects/${encodeURIComponent(projectId)}/activity`,
      { params },
    );
    return response.data;
  },

  async create(orgId: string, input: CreateProjectRequest) {
    const response = await apiClient.post<ApiResponse<Project>>(
      `/organizations/${encodeURIComponent(orgId)}/projects`,
      input,
    );
    return response.data.data;
  },

  async update(orgId: string, projectId: string, input: UpdateProjectRequest) {
    const response = await apiClient.patch<ApiResponse<Project>>(
      `/organizations/${encodeURIComponent(orgId)}/projects/${encodeURIComponent(projectId)}`,
      input,
    );
    return response.data.data;
  },

  async remove(orgId: string, projectId: string) {
    await apiClient.delete<ApiResponse<unknown>>(
      `/organizations/${encodeURIComponent(orgId)}/projects/${encodeURIComponent(projectId)}`,
    );
  },
};
