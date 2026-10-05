"use client";

import { Dialog } from "@/components/shared/dialog";
import { mapApiErrorToForm } from "@/features/auth/form-errors";
import type { OrganizationRole } from "@/features/permissions/api";
import {
  permissionKeys,
  type Permission,
} from "@/features/permissions/permissions";
import { useCreateRole, useUpdateRole } from "@/features/roles/api";
import {
  roleFormSchema,
  type RoleFormInput,
  type RoleFormValues,
} from "@/features/roles/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

const permissionLabels: Record<Permission, string> = {
  "organizations.read": "Read organization",
  "organizations.update": "Update organization",
  "members.read": "Read members",
  "members.manage": "Manage members",
  "roles.read": "Read roles",
  "roles.manage": "Manage roles",
  "teams.read": "Read teams",
  "teams.manage": "Manage teams",
  "projects.read": "Read projects",
  "projects.create": "Create projects",
  "projects.update": "Update projects",
  "projects.delete": "Delete projects",
  "tasks.read": "Read tasks",
  "tasks.create": "Create tasks",
  "tasks.update": "Update tasks",
  "tasks.delete": "Delete tasks",
  "api_keys.manage": "Manage API keys",
  "audit.read": "Read audit log",
};

export function RoleFormDialog({
  orgId,
  role,
  open,
  onOpenChange,
}: {
  orgId: string;
  role?: OrganizationRole;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createRole = useCreateRole(orgId);
  const updateRole = useUpdateRole(orgId, role?.id ?? "");
  const [formError, setFormError] = useState("");
  const form = useForm<RoleFormInput, unknown, RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    values: {
      name: role?.name ?? "",
      description: role?.description ?? "",
      permissions: (role?.permissions ?? []) as Permission[],
    },
    mode: "onBlur",
  });
  const isPending = createRole.isPending || updateRole.isPending;
  const selectedPermissions =
    useWatch({
      control: form.control,
      name: "permissions",
    }) ?? [];

  async function onSubmit(values: RoleFormValues) {
    setFormError("");
    try {
      if (role) await updateRole.mutateAsync(values);
      else await createRole.mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      setFormError(
        mapApiErrorToForm<RoleFormValues>(
          error,
          ["name", "description", "permissions"],
          form.setError,
        ),
      );
    }
  }

  return (
    <Dialog
      description="Choose a role name and the permissions it grants."
      onOpenChange={onOpenChange}
      open={open}
      title={role ? "Edit custom role" : "Create custom role"}
    >
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
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
          htmlFor="role-name"
        >
          Role name
          <input
            {...form.register("name")}
            autoFocus
            className="h-11 w-full rounded-md border border-[#cbd4ce] px-3 text-sm font-normal focus-visible:outline-2 focus-visible:outline-[#346e58]"
            id="role-name"
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
          htmlFor="role-description"
        >
          Description
          <textarea
            {...form.register("description")}
            className="min-h-20 w-full rounded-md border border-[#cbd4ce] px-3 py-2 text-sm font-normal focus-visible:outline-2 focus-visible:outline-[#346e58]"
            id="role-description"
            maxLength={500}
          />
        </label>
        <fieldset className="max-h-64 overflow-y-auto rounded-md border border-[#d5ddd6] p-4">
          <legend className="px-1 text-sm font-semibold">Permissions</legend>
          <div className="mt-1 grid gap-2 sm:grid-cols-2">
            {permissionKeys.map((permission) => (
              <label
                className="flex min-h-9 items-center gap-2 text-sm text-[#34463e]"
                key={permission}
              >
                <input
                  checked={selectedPermissions.includes(permission)}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...selectedPermissions, permission]
                      : selectedPermissions.filter(
                          (item) => item !== permission,
                        );
                    form.setValue("permissions", next, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                  type="checkbox"
                />
                {permissionLabels[permission]}
              </label>
            ))}
          </div>
        </fieldset>
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
            disabled={isPending}
            type="submit"
          >
            {isPending ? "Saving…" : role ? "Save changes" : "Create role"}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
