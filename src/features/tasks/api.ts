import type { paths, components } from "@/types/api";
import { apiClient } from "@/lib/api/axios";
import type { ApiResponse, Paginated } from "@/types/api-envelope";

export type Task = components["schemas"]["Task"];
export type CreateTaskRequest = components["schemas"]["CreateTaskRequest"];
export type UpdateTaskRequest = components["schemas"]["UpdateTaskRequest"];
export type OrganizationTaskParams = NonNullable<
  paths["/api/v1/organizations/{orgID}/tasks"]["get"]["parameters"]["query"]
>;
export type ProjectTaskParams = NonNullable<
  paths["/api/v1/organizations/{orgID}/projects/{projectID}/tasks"]["get"]["parameters"]["query"]
>;
export type TaskActivity = {
  id: string;
  actor_user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export const tasksApi = {
  async listOrganization(orgId: string, params: OrganizationTaskParams) {
    const response = await apiClient.get<Paginated<Task>>(
      `/organizations/${encodeURIComponent(orgId)}/tasks`,
      { params },
    );
    return response.data;
  },

  async listProject(
    orgId: string,
    projectId: string,
    params: ProjectTaskParams,
  ) {
    const response = await apiClient.get<Paginated<Task>>(
      `/organizations/${encodeURIComponent(orgId)}/projects/${encodeURIComponent(projectId)}/tasks`,
      { params },
    );
    return response.data;
  },

  async get(orgId: string, taskId: string) {
    const response = await apiClient.get<ApiResponse<Task>>(
      `/organizations/${encodeURIComponent(orgId)}/tasks/${encodeURIComponent(taskId)}`,
    );
    return response.data.data;
  },

  async activity(
    orgId: string,
    taskId: string,
    params: { page: number; page_size: number },
  ) {
    const response = await apiClient.get<Paginated<TaskActivity>>(
      `/organizations/${encodeURIComponent(orgId)}/tasks/${encodeURIComponent(taskId)}/activity`,
      { params },
    );
    return response.data;
  },

  async create(orgId: string, projectId: string, input: CreateTaskRequest) {
    const response = await apiClient.post<ApiResponse<Task>>(
      `/organizations/${encodeURIComponent(orgId)}/projects/${encodeURIComponent(projectId)}/tasks`,
      input,
    );
    return response.data.data;
  },

  async update(orgId: string, taskId: string, input: UpdateTaskRequest) {
    const response = await apiClient.patch<ApiResponse<Task>>(
      `/organizations/${encodeURIComponent(orgId)}/tasks/${encodeURIComponent(taskId)}`,
      input,
    );
    return response.data.data;
  },

  async remove(orgId: string, taskId: string) {
    await apiClient.delete<ApiResponse<unknown>>(
      `/organizations/${encodeURIComponent(orgId)}/tasks/${encodeURIComponent(taskId)}`,
    );
  },
};
