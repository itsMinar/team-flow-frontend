export const permissionKeys = [
  "organizations.read",
  "organizations.update",
  "members.read",
  "members.manage",
  "roles.read",
  "roles.manage",
  "teams.read",
  "teams.manage",
  "projects.read",
  "projects.create",
  "projects.update",
  "projects.delete",
  "tasks.read",
  "tasks.create",
  "tasks.update",
  "tasks.delete",
  "api_keys.manage",
  "audit.read",
] as const;

export type Permission = (typeof permissionKeys)[number];
