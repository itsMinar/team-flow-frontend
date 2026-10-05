"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { Dialog } from "@/components/shared/dialog";
import type { APIKey, CreatedAPIKey } from "@/features/apikeys/api";
import {
  createAPIKey,
  useAPIKeys,
  useRevokeAPIKey,
} from "@/features/apikeys/api";
import {
  createAPIKeySchema,
  parseAPIKeySearchParams,
  type CreateAPIKeyInput,
  type CreateAPIKeyValues,
} from "@/features/apikeys/schemas";
import { useActiveOrganization } from "@/features/organizations/organization-context";
import { PermissionGate } from "@/features/permissions/permission-gate";
import { usePermission } from "@/features/permissions/use-permission";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { queryKeys } from "@/lib/query/query-keys";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, KeyRound } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

function expiryLabel(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value),
  );
}

function APIKeyCreateDialog({
  orgId,
  open,
  onOpenChange,
}: {
  orgId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [created, setCreated] = useState<CreatedAPIKey | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState("");
  const form = useForm<CreateAPIKeyInput, unknown, CreateAPIKeyValues>({
    resolver: zodResolver(createAPIKeySchema),
    defaultValues: { name: "", expires_in_days: 0 },
    mode: "onBlur",
  });

  async function onSubmit(values: CreateAPIKeyValues) {
    setError("");
    setPending(true);
    try {
      const result = await createAPIKey(orgId, values);
      setCreated(result);
      form.reset();
      await queryClient.invalidateQueries({
        queryKey: queryKeys.apiKeys(orgId),
      });
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    } finally {
      setPending(false);
    }
  }

  async function copySecret() {
    if (!created) return;
    try {
      await navigator.clipboard.writeText(created.key);
      setCopyState("Secret copied. Store it securely now.");
    } catch {
      setCopyState(
        "Clipboard access is unavailable. Select and copy the secret manually.",
      );
    }
  }

  function changeOpen(nextOpen: boolean) {
    if (!nextOpen) {
      setCreated(null);
      setError("");
      setCopyState("");
      form.reset();
    }
    onOpenChange(nextOpen);
  }

  return (
    <Dialog
      description={
        created
          ? "Copy this secret now. It will not be shown again."
          : "Create a machine credential for this organization."
      }
      onOpenChange={changeOpen}
      open={open}
      title={created ? "API key created" : "Create API key"}
    >
      {created ? (
        <div className="space-y-4">
          <p
            className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
            role="status"
          >
            This secret is shown only once and remains only in this open dialog.
            Copy it and store it securely.
          </p>
          <div className="space-y-1.5">
            <label
              className="text-sm font-semibold"
              htmlFor="created-api-key-secret"
            >
              Secret
            </label>
            <input
              className="h-11 w-full rounded-md border border-[#cbd4ce] bg-[#f5f7f3] px-3 font-mono text-sm"
              id="created-api-key-secret"
              readOnly
              value={created.key}
            />
          </div>
          <p className="text-sm text-[#64756c]">{created.warning}</p>
          {copyState && (
            <p className="text-sm text-[#245448]" role="status">
              {copyState}
            </p>
          )}
          <footer className="flex justify-end gap-3 border-t border-[#e4e9e4] pt-4">
            <button
              className="inline-flex h-10 items-center gap-2 rounded-md border border-[#cbd4ce] px-4 text-sm font-medium hover:bg-[#f5f7f3]"
              onClick={() => void copySecret()}
              type="button"
            >
              <Copy aria-hidden="true" size={16} /> Copy secret
            </button>
            <button
              className="h-10 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white"
              onClick={() => changeOpen(false)}
              type="button"
            >
              Done
            </button>
          </footer>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          {error && (
            <p
              className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
              role="alert"
            >
              {error}
            </p>
          )}
          <label
            className="block space-y-1.5 text-sm font-medium"
            htmlFor="api-key-name"
          >
            Key name
            <input
              {...form.register("name")}
              autoFocus
              className="h-11 w-full rounded-md border border-[#cbd4ce] px-3 text-sm font-normal focus-visible:outline-2 focus-visible:outline-[#346e58]"
              id="api-key-name"
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
            htmlFor="api-key-expiry"
          >
            Expiration
            <select
              {...form.register("expires_in_days", { valueAsNumber: true })}
              className="h-11 w-full rounded-md border border-[#cbd4ce] bg-white px-3 text-sm font-normal"
              id="api-key-expiry"
            >
              <option value={0}>Default lifetime</option>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
            </select>
          </label>
          <footer className="flex justify-end gap-3 border-t border-[#e4e9e4] pt-4">
            <button
              className="h-10 rounded-md border border-[#cbd4ce] px-4 text-sm font-medium"
              onClick={() => changeOpen(false)}
              type="button"
            >
              Cancel
            </button>
            <button
              className="h-10 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white disabled:opacity-60"
              disabled={pending}
              type="submit"
            >
              {pending ? "Creating…" : "Create key"}
            </button>
          </footer>
        </form>
      )}
    </Dialog>
  );
}

function APIKeyRowActions({
  apiKey,
  onRevoke,
}: {
  apiKey: APIKey;
  onRevoke: (apiKey: APIKey) => void;
}) {
  if (apiKey.status !== "active")
    return <span className="text-xs text-[#74847d]">—</span>;
  return (
    <PermissionGate permission="api_keys.manage">
      <button
        className="h-8 rounded-md border border-rose-200 px-2.5 text-xs font-medium text-rose-800 hover:bg-rose-50"
        onClick={() => onRevoke(apiKey)}
        type="button"
      >
        Revoke
      </button>
    </PermissionGate>
  );
}

export function APIKeyScreen() {
  const organization = useActiveOrganization();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const parsed = parseAPIKeySearchParams(searchParams);
  const filters = parsed.success
    ? parsed.data
    : {
        page: 1,
        page_size: 20,
        include_revoked: false,
        sort: "created_at" as const,
        order: "desc" as const,
      };
  const access = usePermission("api_keys.manage");
  const apiKeys = useAPIKeys(
    organization.id,
    filters,
    parsed.success && access.allowed,
  );
  const revoke = useRevokeAPIKey(organization.id);
  const [createOpen, setCreateOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<APIKey | null>(null);
  const [error, setError] = useState("");

  function updateSearch(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    router.replace(`${pathname}?${next.toString()}`);
  }

  async function confirmRevoke() {
    if (!keyToRevoke) return;
    setError("");
    try {
      await revoke.mutateAsync(keyToRevoke.id);
      setKeyToRevoke(null);
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    }
  }

  const columns: DataTableColumn<APIKey>[] = [
    { id: "name", header: "Name", rowHeader: true, render: (key) => key.name },
    {
      id: "secret-fragment",
      header: "Key",
      render: (key) => `${key.key_prefix}••••${key.key_last_four}`,
    },
    { id: "status", header: "Status", render: (key) => key.status },
    {
      id: "created",
      header: "Created",
      sortKey: "created_at",
      render: (key) => expiryLabel(key.created_at),
    },
    {
      id: "last-used",
      header: "Last used",
      sortKey: "last_used_at",
      render: (key) =>
        key.last_used_at ? expiryLabel(key.last_used_at) : "Never",
    },
    {
      id: "expires",
      header: "Expires",
      sortKey: "expires_at",
      render: (key) => expiryLabel(key.expires_at),
    },
    {
      id: "actions",
      header: "Actions",
      render: (key) => (
        <APIKeyRowActions apiKey={key} onRevoke={setKeyToRevoke} />
      ),
    },
  ];

  if (access.isPending) {
    return (
      <main
        aria-busy="true"
        className="mx-auto max-w-7xl px-5 py-10 text-sm text-[#53665d]"
        role="status"
      >
        Checking API key access…
      </main>
    );
  }

  if (access.isError || !access.allowed) {
    return (
      <main
        className="mx-auto max-w-7xl px-5 py-10 text-sm text-[#64756c]"
        role="status"
      >
        You do not have permission to manage API keys.
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
            {organization.name}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            API keys
          </h1>
          <p className="mt-1 text-sm text-[#64756c]">
            Machine credentials for integrations. Secrets are shown once at
            creation.
          </p>
        </div>
        <PermissionGate permission="api_keys.manage">
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white hover:bg-[#245448]"
            onClick={() => setCreateOpen(true)}
            type="button"
          >
            <KeyRound aria-hidden="true" size={16} /> Create key
          </button>
        </PermissionGate>
      </div>
      <label className="mt-7 inline-flex min-h-10 items-center gap-2 text-sm text-[#53665d]">
        <input
          checked={filters.include_revoked}
          onChange={(event) =>
            updateSearch("include_revoked", event.target.checked ? "true" : "")
          }
          type="checkbox"
        />
        Include revoked keys
      </label>
      {error && (
        <p
          className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
          role="alert"
        >
          {error}
        </p>
      )}
      <section
        aria-label="API keys"
        className="mt-3 overflow-hidden rounded-md border border-[#d5ddd6] bg-white"
      >
        {apiKeys.isPending ? (
          <div aria-busy="true" className="space-y-3 p-5" role="status">
            {[0, 1, 2].map((row) => (
              <div
                className="h-12 animate-pulse rounded bg-[#edf1ec]"
                key={row}
              />
            ))}
          </div>
        ) : apiKeys.isError ? (
          <p className="p-5 text-sm text-rose-900" role="alert">
            {normalizeApiError(apiKeys.error).message}
          </p>
        ) : apiKeys.data.data.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <h2 className="font-semibold">No API keys found</h2>
            <p className="mt-1 text-sm text-[#64756c]">
              Create a key when an integration needs machine access.
            </p>
          </div>
        ) : (
          <DataTable
            caption={`API keys for ${organization.name}`}
            columns={columns}
            onSort={(sort) => updateSearch("sort", sort)}
            order={filters.order}
            pagination={{
              page: apiKeys.data.pagination.page,
              pageSize: apiKeys.data.pagination.page_size,
              total: apiKeys.data.pagination.total,
              totalPages: apiKeys.data.pagination.total_pages,
              onPageChange: (page) => updateSearch("page", String(page)),
            }}
            rows={apiKeys.data.data}
            sortBy={filters.sort}
          />
        )}
      </section>
      <PermissionGate permission="api_keys.manage">
        <APIKeyCreateDialog
          onOpenChange={setCreateOpen}
          open={createOpen}
          orgId={organization.id}
        />
        <ConfirmDialog
          description={`Revoke ${keyToRevoke?.name ?? "this key"}? Integrations using it will stop working.`}
          confirmLabel={revoke.isPending ? "Revoking…" : "Revoke key"}
          isPending={revoke.isPending}
          onConfirm={() => void confirmRevoke()}
          onOpenChange={(open) => !open && setKeyToRevoke(null)}
          open={Boolean(keyToRevoke)}
          title="Revoke API key?"
        />
      </PermissionGate>
    </main>
  );
}
