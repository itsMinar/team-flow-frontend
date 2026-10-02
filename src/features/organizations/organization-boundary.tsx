"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useLogout } from "@/features/auth/queries";
import { useOrganization } from "@/features/organizations/api";
import { OrganizationProvider } from "@/features/organizations/organization-context";
import { useAuthStore } from "@/lib/api/auth-store";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

function OrganizationState({
  title,
  message,
  children,
}: {
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f2f4ef] px-5 text-[#1b2d27]">
      <section className="w-full max-w-lg rounded-md border border-[#d5ddd6] bg-white p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
          TeamFlow
        </p>
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#64756c]">{message}</p>
        <div className="mt-6 flex flex-wrap gap-4">{children}</div>
      </section>
    </main>
  );
}

export function OrganizationBoundary({
  orgId,
  children,
}: {
  orgId: string;
  children: ReactNode;
}) {
  const organization = useOrganization(orgId);
  const logout = useLogout();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  if (organization.isPending) {
    return (
      <main
        aria-busy="true"
        className="flex min-h-screen items-center justify-center bg-[#f2f4ef] text-sm text-[#53665d]"
        role="status"
      >
        Loading organization…
      </main>
    );
  }

  if (organization.isError) {
    const error = normalizeApiError(organization.error);
    if (
      error.code === "ORGANIZATION_SUSPENDED" ||
      error.code === "ORGANIZATION_NOT_FOUND" ||
      error.code === "NOT_FOUND"
    ) {
      const isSuspended = error.code === "ORGANIZATION_SUSPENDED";
      return (
        <OrganizationState
          title={
            isSuspended ? "Organization suspended" : "Organization not found"
          }
          message={
            isSuspended
              ? "This workspace is suspended. Contact your organization owner or TeamFlow support."
              : "This workspace is unavailable or you no longer have access to it."
          }
        >
          <Link
            className="rounded-md bg-[#193c35] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193c35]"
            href="/orgs"
          >
            Switch organization
          </Link>
        </OrganizationState>
      );
    }

    return (
      <OrganizationState title="Workspace unavailable" message={error.message}>
        <Link
          className="text-sm font-semibold text-[#245448] underline underline-offset-4"
          href="/orgs"
        >
          Back to organizations
        </Link>
      </OrganizationState>
    );
  }

  if (organization.data.status.toLowerCase() === "suspended") {
    return (
      <OrganizationState
        title="Organization suspended"
        message="This workspace is suspended. Contact your organization owner or TeamFlow support."
      >
        <Link
          className="rounded-md bg-[#193c35] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193c35]"
          href="/orgs"
        >
          Switch organization
        </Link>
      </OrganizationState>
    );
  }

  return (
    <OrganizationProvider organization={organization.data}>
      <div className="min-h-screen bg-[#f2f4ef] text-[#1b2d27]">
        <header className="flex min-h-16 items-center justify-between border-b border-[#d5ddd6] bg-white px-4 sm:px-8">
          <Link className="font-semibold tracking-wide" href="/orgs">
            TeamFlow
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden max-w-48 truncate text-sm text-[#53665d] sm:inline">
              {organization.data.name}
            </span>
            <Link
              className="text-sm font-medium text-[#245448] underline underline-offset-4"
              href="/orgs"
            >
              Switch workspace
            </Link>
            <button
              className="rounded-md border border-[#cbd4ce] px-3 py-2 text-sm font-medium hover:bg-[#f5f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346e58] disabled:opacity-60"
              disabled={logout.isPending}
              onClick={async () => {
                try {
                  await logout.mutateAsync();
                } finally {
                  clearSession();
                  router.replace("/login");
                }
              }}
              type="button"
            >
              {logout.isPending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </header>
        {children}
      </div>
    </OrganizationProvider>
  );
}
