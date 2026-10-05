"use client";

import { Dialog } from "@/components/shared/dialog";
import { mapApiErrorToForm } from "@/features/auth/form-errors";
import { useCreateInvitation } from "@/features/invitations/queries";
import {
  invitationFormSchema,
  type InvitationFormValues,
} from "@/features/invitations/schemas";
import { useOrganizationRoles } from "@/features/permissions/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function InvitationFormDialog({
  orgId,
  open,
  onOpenChange,
}: {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const roles = useOrganizationRoles(orgId);
  const createInvitation = useCreateInvitation(orgId);
  const [formError, setFormError] = useState("");
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationFormSchema),
    defaultValues: { email: "", role_id: "" },
    mode: "onBlur",
  });

  async function onSubmit(values: InvitationFormValues) {
    setFormError("");
    try {
      await createInvitation.mutateAsync(values);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      setFormError(
        mapApiErrorToForm<InvitationFormValues>(
          error,
          ["email", "role_id"],
          form.setError,
        ),
      );
    }
  }

  return (
    <Dialog
      description="The invite link is emailed directly and is not shown here."
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          form.reset();
          setFormError("");
        }
        onOpenChange(nextOpen);
      }}
      open={open}
      title="Invite a teammate"
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
          htmlFor="invitation-email"
        >
          Email address
          <input
            {...form.register("email")}
            autoComplete="email"
            className="h-11 w-full rounded-md border border-[#cbd4ce] px-3 text-sm font-normal focus-visible:outline-2 focus-visible:outline-[#346e58]"
            id="invitation-email"
            required
            type="email"
          />
          {form.formState.errors.email && (
            <span
              className="block text-sm font-normal text-rose-700"
              role="alert"
            >
              {form.formState.errors.email.message}
            </span>
          )}
        </label>
        <label
          className="block space-y-1.5 text-sm font-medium"
          htmlFor="invitation-role"
        >
          Organization role
          <select
            {...form.register("role_id")}
            className="h-11 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal focus-visible:outline-2 focus-visible:outline-[#346e58]"
            disabled={roles.isPending || roles.isError}
            id="invitation-role"
            required
          >
            <option value="">Select a role</option>
            {roles.data?.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          {roles.isError && (
            <span className="block text-xs font-normal text-rose-700">
              Role options are unavailable; invitations cannot be sent.
            </span>
          )}
          {form.formState.errors.role_id && (
            <span
              className="block text-sm font-normal text-rose-700"
              role="alert"
            >
              {form.formState.errors.role_id.message}
            </span>
          )}
        </label>
        <footer className="flex justify-end gap-3 border-t border-[#e4e9e4] pt-4">
          <button
            className="h-10 rounded-md border border-[#cbd4ce] px-4 text-sm font-medium"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-10 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white disabled:opacity-60"
            disabled={
              createInvitation.isPending || roles.isPending || roles.isError
            }
            type="submit"
          >
            {createInvitation.isPending ? "Sending…" : "Send invitation"}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
