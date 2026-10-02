"use client";

import Link from "next/link";
import { useOrganizations } from "@/features/organizations/api";
import { normalizeApiError } from "@/lib/api/normalize-api-error";

export function OrganizationPicker() {
  const organizations = useOrganizations();

  if (organizations.isPending) {
    return (
      <div aria-busy="true" className="space-y-3" role="status">
        <div className="h-16 animate-pulse rounded-md bg-[#e2e7e1]" />
        <div className="h-16 animate-pulse rounded-md bg-[#e2e7e1]" />
      </div>
    );
  }

  if (organizations.isError) {
    const error = normalizeApiError(organizations.error);
    return (
      <div
        className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
        role="alert"
      >
        <p className="font-semibold">Organizations could not be loaded</p>
        <p className="mt-1">{error.message}</p>
      </div>
    );
  }

  if (organizations.data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[#bdc9bf] bg-white p-6 text-sm text-[#53665d]">
        <p className="font-semibold text-[#1b2d27]">No organizations yet</p>
        <p className="mt-1">Ask an organization owner to invite you.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#e4e9e4] overflow-hidden rounded-md border border-[#d5ddd6] bg-white">
      {organizations.data.map((organization) => (
        <li key={organization.id}>
          <Link
            className="group flex min-h-20 items-center justify-between gap-4 px-4 py-3 transition hover:bg-[#f5f7f3] focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#346e58] sm:px-5"
            href={`/orgs/${encodeURIComponent(organization.id)}/dashboard`}
          >
            <span className="min-w-0">
              <span className="block truncate font-semibold text-[#1b2d27]">
                {organization.name}
              </span>
              <span className="mt-1 block truncate text-xs text-[#64756c]">
                {organization.slug}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              {organization.status.toLowerCase() === "suspended" ? (
                <span className="rounded-sm bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
                  Suspended
                </span>
              ) : (
                <span className="text-xs text-[#64756c]">
                  {organization.role ?? "Member"}
                </span>
              )}
              <span aria-hidden="true" className="text-[#346e58]">
                →
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
