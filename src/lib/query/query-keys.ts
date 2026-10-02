export type QueryFilters = Readonly<
  Record<string, string | number | boolean | null | undefined>
>;

export const queryKeys = {
  currentUser: ["auth", "me"] as const,
  organizations: ["organizations"] as const,
  projectList: (orgId: string, filters: QueryFilters = {}) =>
    ["organizations", orgId, "projects", filters] as const,
  project: (orgId: string, projectId: string) =>
    ["organizations", orgId, "projects", projectId] as const,
  taskList: (orgId: string, filters: QueryFilters = {}) =>
    ["organizations", orgId, "tasks", filters] as const,
  task: (orgId: string, taskId: string) =>
    ["organizations", orgId, "tasks", taskId] as const,
  teams: (orgId: string) => ["organizations", orgId, "teams"] as const,
  members: (orgId: string) => ["organizations", orgId, "members"] as const,
  roles: (orgId: string) => ["organizations", orgId, "roles"] as const,
  invitations: (orgId: string) =>
    ["organizations", orgId, "invitations"] as const,
  apiKeys: (orgId: string) => ["organizations", orgId, "api-keys"] as const,
  auditLogs: (orgId: string, filters: QueryFilters = {}) =>
    ["organizations", orgId, "audit-logs", filters] as const,
};
