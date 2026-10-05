"use client";

import { useActiveOrganization } from "@/features/organizations/organization-context";
import { PermissionGate } from "@/features/permissions/permission-gate";
import { useTeams } from "@/features/teams/api";
import { TeamFormDialog } from "@/features/teams/team-form-dialog";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { UsersRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function TeamListScreen() {
  const organization = useActiveOrganization();
  const teams = useTeams(organization.id);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
            {organization.name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Teams</h1>
          <p className="mt-1 text-sm text-[#64756c]">
            People and responsibilities within this workspace.
          </p>
        </div>
        <PermissionGate permission="teams.manage">
          <button
            className="h-10 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white hover:bg-[#245448] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193c35]"
            onClick={() => setFormOpen(true)}
            type="button"
          >
            Create team
          </button>
        </PermissionGate>
      </div>

      {teams.isPending ? (
        <div aria-busy="true" className="mt-8 space-y-3" role="status">
          {[0, 1, 2].map((row) => (
            <div className="h-20 animate-pulse rounded-md bg-white" key={row} />
          ))}
        </div>
      ) : teams.isError ? (
        <div
          className="mt-8 rounded-md border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900"
          role="alert"
        >
          <p className="font-semibold">Teams could not be loaded</p>
          <p className="mt-1">{normalizeApiError(teams.error).message}</p>
        </div>
      ) : teams.data.length === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-[#bdc9bf] bg-white p-8 text-center">
          <UsersRound
            aria-hidden="true"
            className="mx-auto text-[#6a9b78]"
            size={24}
          />
          <h2 className="mt-3 font-semibold">No teams yet</h2>
          <p className="mt-1 text-sm text-[#64756c]">
            Teams will appear here once they are created.
          </p>
          <PermissionGate permission="teams.manage">
            <button
              className="mt-4 text-sm font-semibold text-[#245448] underline underline-offset-4"
              onClick={() => setFormOpen(true)}
              type="button"
            >
              Create the first team
            </button>
          </PermissionGate>
        </div>
      ) : (
        <ul className="mt-8 divide-y divide-[#e4e9e4] border-y border-[#d5ddd6]">
          {teams.data.map((team) => (
            <li key={team.id}>
              <Link
                className="flex min-h-20 items-center justify-between gap-4 py-4 hover:text-[#245448] focus-visible:outline-2 focus-visible:outline-[#346e58]"
                href={`/orgs/${encodeURIComponent(organization.id)}/teams/${encodeURIComponent(team.id)}`}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-[#1b2d27]">
                    {team.name}
                  </span>
                  <span className="mt-1 block truncate text-sm text-[#64756c]">
                    {team.description || "No description"}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-medium text-[#245448]">
                  View team →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <PermissionGate permission="teams.manage">
        <TeamFormDialog
          onOpenChange={setFormOpen}
          open={formOpen}
          orgId={organization.id}
        />
      </PermissionGate>
    </main>
  );
}
