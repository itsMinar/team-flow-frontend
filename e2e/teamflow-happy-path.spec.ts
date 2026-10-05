import { expect, test } from "@playwright/test";

test("appearance follows the system and supports explicit light/dark modes", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/login");

  await expect(page.locator("html")).toHaveClass(/dark/);
  const appearance = page.locator('select[aria-label="Appearance"]:visible');
  await appearance.selectOption("light");
  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await appearance.selectOption("dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("login, create a project, and create a task", async ({ page }) => {
  const projects: Array<Record<string, unknown>> = [];
  const tasks: Array<Record<string, unknown>> = [];
  const timestamp = "2026-10-05T12:00:00Z";

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/api/v1", "");
    const method = request.method();

    if (path === "/auth/login" && method === "POST") {
      await route.fulfill({
        json: {
          data: {
            access_token: "e2e-access-token",
            refresh_token: "e2e-refresh-token",
            token_type: "Bearer",
            expires_in: 900,
            user: {
              id: "user-1",
              email: "ada@example.com",
              first_name: "Ada",
              last_name: "Lovelace",
              status: "active",
              created_at: timestamp,
            },
          },
        },
      });
      return;
    }

    if (path === "/organizations" && method === "GET") {
      await route.fulfill({
        json: {
          data: [
            {
              id: "org-1",
              name: "Northstar Studio",
              slug: "northstar",
              status: "active",
              role: "Owner",
              created_at: timestamp,
              updated_at: timestamp,
            },
          ],
        },
      });
      return;
    }

    if (path === "/organizations/org-1" && method === "GET") {
      await route.fulfill({
        json: {
          data: {
            id: "org-1",
            name: "Northstar Studio",
            slug: "northstar",
            status: "active",
            role: "Owner",
            created_at: timestamp,
            updated_at: timestamp,
          },
        },
      });
      return;
    }

    if (path === "/organizations/org-1/roles" && method === "GET") {
      await route.fulfill({
        json: {
          data: [
            {
              id: "role-owner",
              organization_id: "org-1",
              name: "Owner",
              is_system: true,
              permissions: [
                "projects.read",
                "projects.create",
                "projects.update",
                "projects.delete",
                "tasks.read",
                "tasks.create",
                "tasks.update",
                "tasks.delete",
                "members.read",
                "roles.read",
              ],
              created_at: timestamp,
              updated_at: timestamp,
            },
          ],
        },
      });
      return;
    }

    if (path === "/organizations/org-1/projects" && method === "GET") {
      await route.fulfill({
        json: {
          data: projects,
          pagination: {
            page: 1,
            page_size: 20,
            total: projects.length,
            total_pages: projects.length > 0 ? 1 : 0,
          },
        },
      });
      return;
    }

    if (path === "/organizations/org-1/projects" && method === "POST") {
      const input = request.postDataJSON() as Record<string, unknown>;
      const project = {
        id: "project-1",
        organization_id: "org-1",
        name: input.name,
        description: input.description,
        status: input.status ?? "planning",
        priority: input.priority ?? "medium",
        created_by: "user-1",
        created_at: timestamp,
        updated_at: timestamp,
      };
      projects.push(project);
      await route.fulfill({ status: 201, json: { data: project } });
      return;
    }

    if (
      path === "/organizations/org-1/projects/project-1" &&
      method === "GET"
    ) {
      await route.fulfill({ json: { data: projects[0] } });
      return;
    }

    if (
      path === "/organizations/org-1/projects/project-1/activity" &&
      method === "GET"
    ) {
      await route.fulfill({
        json: {
          data: [],
          pagination: { page: 1, page_size: 20, total: 0, total_pages: 0 },
        },
      });
      return;
    }

    if (
      path === "/organizations/org-1/projects/project-1/tasks" &&
      method === "GET"
    ) {
      await route.fulfill({
        json: {
          data: tasks,
          pagination: {
            page: 1,
            page_size: 20,
            total: tasks.length,
            total_pages: tasks.length > 0 ? 1 : 0,
          },
        },
      });
      return;
    }

    if (path === "/organizations/org-1/members" && method === "GET") {
      await route.fulfill({ json: { data: [] } });
      return;
    }

    if (
      path === "/organizations/org-1/projects/project-1/tasks" &&
      method === "POST"
    ) {
      const input = request.postDataJSON() as Record<string, unknown>;
      const task = {
        id: "task-1",
        organization_id: "org-1",
        project_id: "project-1",
        title: input.title,
        description: input.description,
        status: input.status ?? "todo",
        priority: input.priority ?? "medium",
        assignee_id: input.assignee_id ?? null,
        due_date: input.due_date ?? null,
        created_by: "user-1",
        created_at: timestamp,
        updated_at: timestamp,
      };
      tasks.push(task);
      await route.fulfill({ status: 201, json: { data: task } });
      return;
    }

    await route.fulfill({
      status: 404,
      json: {
        error: { code: "NOT_FOUND", message: "Mock endpoint not found" },
      },
    });
  });

  await page.goto("/login");
  await page.getByLabel("Email address").fill("ada@example.com");
  await page
    .getByRole("textbox", { name: "Password" })
    .fill("StrongPassword123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.getByRole("link", { name: /Northstar Studio/ }).click();
  await page.getByRole("link", { name: "Projects", exact: true }).click();
  await page.getByRole("button", { name: "New project" }).click();
  await page.getByLabel("Project name").fill("Migration plan");
  await page.getByRole("button", { name: "Create project" }).click();

  await page.getByRole("link", { name: "Migration plan" }).click();
  await page.getByRole("link", { name: "View tasks" }).click();
  await page.getByRole("button", { name: "New task" }).click();
  await page.getByLabel("Task title").fill("Review credentials rotation");
  await page.getByRole("button", { name: "Create task" }).click();

  await expect(
    page.getByRole("link", { name: "Review credentials rotation" }),
  ).toBeVisible();
});
