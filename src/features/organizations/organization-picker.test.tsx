// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { OrganizationPicker } from "@/features/organizations/organization-picker";
import { apiBaseURL } from "@/lib/api/axios";
import { server } from "@/test/server";

function renderPicker() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OrganizationPicker />
    </QueryClientProvider>,
  );
}

describe("OrganizationPicker", () => {
  it("links the selected workspace through the tenant URL", async () => {
    server.use(
      http.get(`${apiBaseURL}/organizations`, () =>
        HttpResponse.json({
          data: [
            {
              id: "org-1",
              name: "Northstar Studio",
              slug: "northstar",
              status: "active",
              role: "Owner",
              created_at: "2026-10-02T00:00:00Z",
              updated_at: "2026-10-02T00:00:00Z",
            },
          ],
        }),
      ),
    );

    renderPicker();
    const workspace = await screen.findByRole("link", {
      name: /Northstar Studio northstar Owner/,
    });

    expect(workspace).toHaveAttribute("href", "/orgs/org-1/dashboard");
  });
});
