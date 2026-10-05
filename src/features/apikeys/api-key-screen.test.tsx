// @vitest-environment jsdom

import { APIKeyScreen } from "@/features/apikeys/api-key-screen";
import type { Organization } from "@/features/organizations/api";
import { OrganizationProvider } from "@/features/organizations/organization-context";
import { apiBaseURL } from "@/lib/api/axios";
import { server } from "@/test/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({
  usePathname: () => "/orgs/org-1/api-keys",
  useRouter: () => navigation,
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

describe("APIKeyScreen", () => {
  beforeEach(() => navigation.replace.mockReset());

  it("shows the secret once, keeps it out of query cache, and clears it on close", async () => {
    const secret = "tf_live_one_time_secret_123456789";
    server.use(
      http.get(`${apiBaseURL}/organizations/org-1/api-keys`, () =>
        HttpResponse.json({
          data: [],
          pagination: { page: 1, page_size: 20, total: 0, total_pages: 0 },
        }),
      ),
      http.get(`${apiBaseURL}/organizations/org-1/roles`, () =>
        HttpResponse.json({
          data: [
            {
              id: "role-owner",
              organization_id: "org-1",
              name: "Owner",
              is_system: true,
              permissions: ["api_keys.manage", "roles.read"],
              created_at: "2026-10-02T00:00:00Z",
              updated_at: "2026-10-02T00:00:00Z",
            },
          ],
        }),
      ),
      http.post(`${apiBaseURL}/organizations/org-1/api-keys`, () =>
        HttpResponse.json(
          {
            data: {
              api_key: {
                id: "key-1",
                organization_id: "org-1",
                created_by: "user-1",
                name: "Nightly sync",
                key_prefix: "tf_live_",
                key_last_four: "6789",
                status: "active",
                expires_at: "2027-10-05T00:00:00Z",
                created_at: "2026-10-05T00:00:00Z",
              },
              key: secret,
              warning: "Copy and store this value securely.",
            },
          },
          { status: 201 },
        ),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <OrganizationProvider organization={organization}>
          <APIKeyScreen />
        </OrganizationProvider>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Create key" }));
    const createDialog = await screen.findByRole("dialog", {
      name: "Create API key",
    });
    fireEvent.change(within(createDialog).getByLabelText("Key name"), {
      target: { value: "Nightly sync" },
    });
    fireEvent.click(
      within(createDialog).getByRole("button", { name: "Create key" }),
    );

    const secretInput = await screen.findByLabelText("Secret");
    expect(secretInput).toHaveValue(secret);
    expect(
      within(screen.getByRole("dialog", { name: "API key created" })).getByRole(
        "button",
        { name: "Copy secret" },
      ),
    ).toBeVisible();
    expect(JSON.stringify(queryClient.getQueryCache().getAll())).not.toContain(
      secret,
    );
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.queryByDisplayValue(secret)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Create key" }));
    expect(
      await screen.findByRole("dialog", { name: "Create API key" }),
    ).toBeVisible();
    expect(screen.queryByDisplayValue(secret)).toBeNull();
  });
});
