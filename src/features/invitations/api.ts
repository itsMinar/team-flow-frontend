import { apiClient } from "@/lib/api/axios";
import type { components, paths } from "@/types/api";
import type { ApiResponse, Paginated } from "@/types/api-envelope";

export type Invitation = components["schemas"]["Invitation"];
export type InvitationPreview = components["schemas"]["InvitationPreview"];
export type InviteRequest = components["schemas"]["InviteRequest"];
export type AcceptInvitationRequest =
  components["schemas"]["AcceptInvitationRequest"];
export type InvitationListParams = NonNullable<
  paths["/api/v1/organizations/{orgID}/invitations"]["get"]["parameters"]["query"]
>;

export type InvitationAcceptResult = {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  organization: { id: string; name: string };
  role: string;
  user: components["schemas"]["User"];
};

export const invitationsApi = {
  async list(orgId: string, params: InvitationListParams) {
    const response = await apiClient.get<Paginated<Invitation>>(
      `/organizations/${encodeURIComponent(orgId)}/invitations`,
      { params },
    );
    return response.data;
  },

  async create(orgId: string, input: InviteRequest) {
    const response = await apiClient.post<ApiResponse<Invitation>>(
      `/organizations/${encodeURIComponent(orgId)}/invitations`,
      input,
    );
    return response.data.data;
  },

  async resend(orgId: string, invitationId: string) {
    const response = await apiClient.post<ApiResponse<Invitation>>(
      `/organizations/${encodeURIComponent(orgId)}/invitations/${encodeURIComponent(invitationId)}/resend`,
    );
    return response.data.data;
  },

  async revoke(orgId: string, invitationId: string) {
    await apiClient.post<ApiResponse<unknown>>(
      `/organizations/${encodeURIComponent(orgId)}/invitations/${encodeURIComponent(invitationId)}/revoke`,
    );
  },

  async preview(token: string, signal?: AbortSignal) {
    const response = await apiClient.get<ApiResponse<InvitationPreview>>(
      `/invitations/${encodeURIComponent(token)}`,
      { signal },
    );
    return response.data.data;
  },

  async accept(input: AcceptInvitationRequest) {
    const response = await apiClient.post<ApiResponse<InvitationAcceptResult>>(
      "/invitations/accept",
      input,
    );
    return response.data.data;
  },
};
