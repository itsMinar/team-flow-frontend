// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { OrganizationBoundary } from "@/features/organizations/organization-boundary";
import { apiBaseURL } from "@/lib/api/axios";
import { server } from "@/test/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

function renderBoundary() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizationBoundary orgId="org-1">
        <p>Workspace content</p>
      </OrganizationBoundary>
    </QueryClientProvider>,
  );
}

describe("OrganizationBoundary", () => {
  it.each([
    {
      code: "ORGANIZATION_SUSPENDED",
      title: "Organization suspended",
    },
    {
      code: "ORGANIZATION_NOT_FOUND",
      title: "Organization not found",
    },
  ])("shows the dedicated screen for $code", async ({ code, title }) => {
    server.use(
      http.get(`${apiBaseURL}/organizations/org-1`, () =>
        HttpResponse.json(
          { error: { code, message: "Organization cannot be loaded" } },
          { status: code === "ORGANIZATION_SUSPENDED" ? 403 : 404 },
        ),
      ),
    );

    renderBoundary();

    expect(await screen.findByRole("heading", { name: title })).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Switch organization" }),
    ).toHaveAttribute("href", "/orgs");
  });
});
