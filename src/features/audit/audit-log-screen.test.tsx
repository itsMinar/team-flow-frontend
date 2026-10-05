// @vitest-environment jsdom

import { AuditLogScreen } from "@/features/audit/audit-log-screen";
import type { Organization } from "@/features/organizations/api";
import { OrganizationProvider } from "@/features/organizations/organization-context";
import { apiBaseURL } from "@/lib/api/axios";
import { server } from "@/test/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/orgs/org-1/audit-logs",
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const organization: Organization = {
  id: "org-1",
  name: "Northstar Studio",
  slug: "northstar",
  status: "active",
  role: "Owner",
  created_at: "2026-10-02T00:00:00Z",
  updated_at: "2026-10-02T00:00:00Z",
};

describe("AuditLogScreen", () => {
  it("renders a paginated security event without network or metadata details", async () => {
    server.use(
      http.get(`${apiBaseURL}/organizations/org-1/roles`, () =>
        HttpResponse.json({
          data: [
            {
              id: "role-owner",
              organization_id: "org-1",
              name: "Owner",
              is_system: true,
              permissions: ["audit.read"],
              created_at: "2026-10-02T00:00:00Z",
              updated_at: "2026-10-02T00:00:00Z",
            },
          ],
        }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/audit-logs`, () =>
        HttpResponse.json({
          data: [
            {
              id: "audit-1",
              action: "member.role_assigned",
              outcome: "success",
              actor_user_id: "user-actor-123456789",
              target_type: "membership",
              target_id: "membership-123456789",
              ip_address: "198.51.100.42",
              user_agent: "private-browser-agent",
              request_id: "request-secret-id",
              trace_id: "trace-secret-id",
              metadata: { private: "do-not-display" },
              created_at: "2026-10-03T12:00:00Z",
            },
          ],
          pagination: { page: 1, page_size: 20, total: 1, total_pages: 1 },
        }),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <OrganizationProvider organization={organization}>
          <AuditLogScreen />
        </OrganizationProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText("member.role_assigned")).toBeVisible();
    expect(screen.getByText("success")).toBeVisible();
    expect(screen.getByText("membership · membersh…6789")).toBeVisible();
    expect(document.body.textContent).not.toContain("198.51.100.42");
    expect(document.body.textContent).not.toContain("private-browser-agent");
    expect(document.body.textContent).not.toContain("request-secret-id");
    expect(document.body.textContent).not.toContain("do-not-display");
  });
});
