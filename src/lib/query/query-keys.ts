export type QueryFilters = Readonly<
  Record<string, string | number | boolean | null | undefined>
>;

export const queryKeys = {
  currentUser: ["auth", "me"] as const,
  organizations: ["organizations"] as const,
  organization: (orgId: string) => ["organizations", orgId] as const,
  dashboard: (orgId: string) => ["organizations", orgId, "dashboard"] as const,
  projectList: (orgId: string, filters: QueryFilters = {}) =>
    ["organizations", orgId, "projects", filters] as const,
  project: (orgId: string, projectId: string) =>
    ["organizations", orgId, "projects", projectId] as const,
  projectActivity: (
    orgId: string,
    projectId: string,
    filters: QueryFilters = {},
  ) =>
    [
      "organizations",
      orgId,
      "projects",
      projectId,
      "activity",
      filters,
    ] as const,
  taskList: (orgId: string, filters: QueryFilters = {}) =>
    ["organizations", orgId, "tasks", "list", filters] as const,
  task: (orgId: string, taskId: string) =>
    ["organizations", orgId, "tasks", "detail", taskId] as const,
  projectTaskList: (
    orgId: string,
    projectId: string,
    filters: QueryFilters = {},
  ) =>
    [
      "organizations",
      orgId,
      "projects",
      projectId,
      "tasks",
      "list",
      filters,
    ] as const,
  taskActivity: (orgId: string, taskId: string, filters: QueryFilters = {}) =>
    [
      "organizations",
      orgId,
      "tasks",
      "detail",
      taskId,
      "activity",
      filters,
    ] as const,
  teams: (orgId: string) => ["organizations", orgId, "teams"] as const,
  team: (orgId: string, teamId: string) =>
    ["organizations", orgId, "teams", teamId] as const,
  teamMembers: (orgId: string, teamId: string) =>
    ["organizations", orgId, "teams", teamId, "members"] as const,
  members: (orgId: string) => ["organizations", orgId, "members"] as const,
  roles: (orgId: string) => ["organizations", orgId, "roles"] as const,
  invitations: (orgId: string, filters: QueryFilters = {}) =>
    ["organizations", orgId, "invitations", filters] as const,
  apiKeys: (orgId: string, filters: QueryFilters = {}) =>
    ["organizations", orgId, "api-keys", filters] as const,
  auditLogs: (orgId: string, filters: QueryFilters = {}) =>
    ["organizations", orgId, "audit-logs", filters] as const,
};
