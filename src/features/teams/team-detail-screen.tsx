"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Dialog } from "@/components/shared/dialog";
import { useMembers } from "@/features/members/api";
import { useActiveOrganization } from "@/features/organizations/organization-context";
import { PermissionGate } from "@/features/permissions/permission-gate";
import type { TeamMember } from "@/features/teams/api";
import {
  useAddTeamMember,
  useDeleteTeam,
  useRemoveTeamMember,
  useTeam,
  useTeamMembers,
} from "@/features/teams/api";
import { TeamFormDialog } from "@/features/teams/team-form-dialog";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { ArrowLeft, Pencil, Plus, Trash2, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TeamDetailScreen({ teamId }: { teamId: string }) {
  const organization = useActiveOrganization();
  const router = useRouter();
  const team = useTeam(organization.id, teamId);
  const teamMembers = useTeamMembers(organization.id, teamId);
  const members = useMembers(organization.id);
  const addMember = useAddTeamMember(organization.id, teamId);
  const removeMember = useRemoveTeamMember(organization.id, teamId);
  const deleteTeam = useDeleteTeam(organization.id, teamId);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [error, setError] = useState("");

  if (team.isPending) {
    return (
      <main
        aria-busy="true"
        className="mx-auto max-w-7xl px-5 py-10 text-sm text-[#53665d]"
        role="status"
      >
        Loading team…
      </main>
    );
  }

  if (team.isError) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-10" role="alert">
        <h1 className="text-xl font-semibold">Team unavailable</h1>
        <p className="mt-2 text-sm text-[#64756c]">
          {normalizeApiError(team.error).message}
        </p>
        <Link
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#245448] underline underline-offset-4"
          href={`/orgs/${encodeURIComponent(organization.id)}/teams`}
        >
          <ArrowLeft aria-hidden="true" size={16} /> Back to teams
        </Link>
      </main>
    );
  }

  const currentTeam = team.data;
  const existingUserIds = new Set(
    (teamMembers.data ?? []).map((member) => member.user_id),
  );
  const availableMembers =
    members.data?.filter(
      (member) =>
        member.status.toLowerCase() === "active" &&
        !existingUserIds.has(member.user_id),
    ) ?? [];

  async function addSelectedMember() {
    if (!selectedUser) return;
    setError("");
    try {
      await addMember.mutateAsync(selectedUser);
      setSelectedUser("");
      setAddOpen(false);
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    }
  }

  async function confirmRemoveMember() {
    if (!memberToRemove) return;
    setError("");
    try {
      await removeMember.mutateAsync(memberToRemove.id);
      setMemberToRemove(null);
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    }
  }

  async function confirmDeleteTeam() {
    setError("");
    try {
      await deleteTeam.mutateAsync();
      router.replace(`/orgs/${encodeURIComponent(organization.id)}/teams`);
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-11">
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-[#53665d] hover:text-[#193c35]"
        href={`/orgs/${encodeURIComponent(organization.id)}/teams`}
      >
        <ArrowLeft aria-hidden="true" size={16} /> Teams
      </Link>
      <div className="mt-6 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
            {organization.name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {currentTeam.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64756c]">
            {currentTeam.description || "No description has been added."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PermissionGate permission="teams.manage">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-medium hover:bg-[#f5f7f3]"
              onClick={() => setEditOpen(true)}
              type="button"
            >
              <Pencil aria-hidden="true" size={16} /> Edit
            </button>
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-rose-200 bg-white px-3 text-sm font-medium text-rose-800 hover:bg-rose-50"
              onClick={() => setDeleteOpen(true)}
              type="button"
            >
              <Trash2 aria-hidden="true" size={16} /> Delete
            </button>
          </PermissionGate>
          <PermissionGate permission="teams.manage">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md bg-[#193c35] px-3 text-sm font-semibold text-white hover:bg-[#245448]"
              onClick={() => setAddOpen(true)}
              type="button"
            >
              <Plus aria-hidden="true" size={16} /> Add member
            </button>
          </PermissionGate>
        </div>
      </div>

      {error && (
        <p
          className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
          role="alert"
        >
          {error}
        </p>
      )}

      <section className="mt-8">
        <div className="flex items-center justify-between border-b border-[#d5ddd6] pb-3">
          <h2 className="text-lg font-semibold">Team members</h2>
          <span className="text-sm text-[#64756c]">
            {teamMembers.data?.length ?? 0} members
          </span>
        </div>
        {teamMembers.isPending ? (
          <div aria-busy="true" className="space-y-3 py-4" role="status">
            {[0, 1, 2].map((row) => (
              <div className="h-14 animate-pulse rounded bg-white" key={row} />
            ))}
          </div>
        ) : teamMembers.isError ? (
          <p className="py-5 text-sm text-rose-800" role="alert">
            {normalizeApiError(teamMembers.error).message}
          </p>
        ) : teamMembers.data.length === 0 ? (
          <div className="py-12 text-center">
            <UserRoundPlus
              aria-hidden="true"
              className="mx-auto text-[#6a9b78]"
              size={24}
            />
            <p className="mt-3 font-semibold">No members on this team</p>
            <PermissionGate permission="teams.manage">
              <button
                className="mt-2 text-sm font-semibold text-[#245448] underline underline-offset-4"
                onClick={() => setAddOpen(true)}
                type="button"
              >
                Add the first member
              </button>
            </PermissionGate>
          </div>
        ) : (
          <ul className="divide-y divide-[#e4e9e4]">
            {teamMembers.data.map((member) => (
              <li
                className="flex min-h-16 items-center justify-between gap-4 py-3"
                key={member.id}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="truncate text-xs text-[#64756c]">
                    {member.email}
                  </p>
                </div>
                <PermissionGate permission="teams.manage">
                  <button
                    aria-label={`Remove ${member.first_name} ${member.last_name}`}
                    className="rounded-md border border-[#cbd4ce] px-3 py-2 text-sm hover:bg-[#f5f7f3] focus-visible:outline-2 focus-visible:outline-[#346e58]"
                    onClick={() => setMemberToRemove(member)}
                    type="button"
                  >
                    Remove
                  </button>
                </PermissionGate>
              </li>
            ))}
          </ul>
        )}
      </section>

      <PermissionGate permission="teams.manage">
        <TeamFormDialog
          onOpenChange={setEditOpen}
          open={editOpen}
          orgId={organization.id}
          team={currentTeam}
        />
        <Dialog
          description="Choose an active organization member to add to this team."
          onOpenChange={setAddOpen}
          open={addOpen}
          title="Add team member"
        >
          <div className="space-y-5">
            {members.isError ? (
              <p className="text-sm text-rose-800" role="alert">
                Member choices are unavailable.
              </p>
            ) : availableMembers.length === 0 ? (
              <p className="text-sm text-[#64756c]">
                There are no active organization members available to add.
              </p>
            ) : (
              <label className="block space-y-1.5 text-sm font-medium">
                Member
                <select
                  className="h-11 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal"
                  onChange={(event) => setSelectedUser(event.target.value)}
                  value={selectedUser}
                >
                  <option value="">Select a member</option>
                  {availableMembers.map((member) => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.first_name} {member.last_name} · {member.email}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <footer className="flex justify-end gap-3 border-t border-[#e4e9e4] pt-4">
              <button
                className="h-10 rounded-md border border-[#cbd4ce] px-4 text-sm font-medium"
                onClick={() => setAddOpen(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="h-10 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white disabled:opacity-60"
                disabled={!selectedUser || addMember.isPending}
                onClick={() => void addSelectedMember()}
                type="button"
              >
                {addMember.isPending ? "Adding…" : "Add member"}
              </button>
            </footer>
          </div>
        </Dialog>
        <ConfirmDialog
          description={`Remove ${memberToRemove?.first_name ?? "this member"} from ${currentTeam.name}?`}
          confirmLabel={removeMember.isPending ? "Removing…" : "Remove member"}
          isPending={removeMember.isPending}
          onConfirm={() => void confirmRemoveMember()}
          onOpenChange={(open) => !open && setMemberToRemove(null)}
          open={Boolean(memberToRemove)}
          title="Remove team member?"
        />
        <ConfirmDialog
          description={`This deletes ${currentTeam.name}.`}
          confirmLabel={deleteTeam.isPending ? "Deleting…" : "Delete team"}
          isPending={deleteTeam.isPending}
          onConfirm={() => void confirmDeleteTeam()}
          onOpenChange={setDeleteOpen}
          open={deleteOpen}
          title="Delete team?"
        />
      </PermissionGate>
    </main>
  );
}
