"use client";

import { Dialog } from "@/components/shared/dialog";
import { mapApiErrorToForm } from "@/features/auth/form-errors";
import type { Team } from "@/features/teams/api";
import { useCreateTeam, useUpdateTeam } from "@/features/teams/api";
import {
  teamFormSchema,
  type TeamFormInput,
  type TeamFormValues,
} from "@/features/teams/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function TeamFormDialog({
  orgId,
  team,
  open,
  onOpenChange,
}: {
  orgId: string;
  team?: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createTeam = useCreateTeam(orgId);
  const updateTeam = useUpdateTeam(orgId, team?.id ?? "");
  const [formError, setFormError] = useState("");
  const form = useForm<TeamFormInput, unknown, TeamFormValues>({
    resolver: zodResolver(teamFormSchema),
    values: {
      name: team?.name ?? "",
      description: team?.description ?? "",
    },
    mode: "onBlur",
  });
  const isPending = createTeam.isPending || updateTeam.isPending;

  async function onSubmit(values: TeamFormValues) {
    setFormError("");
    const input = {
      name: values.name,
      description: values.description || undefined,
    };

    try {
      if (team) await updateTeam.mutateAsync(input);
      else await createTeam.mutateAsync(input);
      onOpenChange(false);
    } catch (error) {
      setFormError(
        mapApiErrorToForm<TeamFormValues>(
          error,
          ["name", "description"],
          form.setError,
        ),
      );
    }
  }

  return (
    <Dialog
      description="Set a clear name and purpose for the team."
      onOpenChange={onOpenChange}
      open={open}
      title={team ? "Edit team" : "Create team"}
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {formError && (
          <p
            className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
            role="alert"
          >
            {formError}
          </p>
        )}
        <label
          className="block space-y-1.5 text-sm font-medium"
          htmlFor="team-name"
        >
          Team name
          <input
            {...form.register("name")}
            aria-invalid={Boolean(form.formState.errors.name)}
            autoFocus
            className="h-11 w-full rounded-md border border-[#cbd4ce] px-3 text-sm font-normal outline-none focus-visible:border-[#346e58] focus-visible:ring-2 focus-visible:ring-[#346e58]/20"
            id="team-name"
            maxLength={100}
            required
          />
          {form.formState.errors.name && (
            <span
              className="block text-sm font-normal text-rose-700"
              role="alert"
            >
              {form.formState.errors.name.message}
            </span>
          )}
        </label>
        <label
          className="block space-y-1.5 text-sm font-medium"
          htmlFor="team-description"
        >
          Description
          <textarea
            {...form.register("description")}
            className="min-h-24 w-full resize-y rounded-md border border-[#cbd4ce] px-3 py-2 text-sm font-normal outline-none focus-visible:border-[#346e58] focus-visible:ring-2 focus-visible:ring-[#346e58]/20"
            id="team-description"
            maxLength={500}
          />
        </label>
        <footer className="flex justify-end gap-3 border-t border-[#e4e9e4] pt-4">
          <button
            className="h-10 rounded-md border border-[#cbd4ce] px-4 text-sm font-medium hover:bg-[#f5f7f3]"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-10 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white hover:bg-[#245448] disabled:opacity-60"
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Saving…" : team ? "Save changes" : "Create team"}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
