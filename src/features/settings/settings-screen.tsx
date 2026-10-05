"use client";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useCurrentUser, useLogoutAll } from "@/features/auth/queries";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { useRouter } from "next/navigation";
import { useState } from "react";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(
    new Date(value),
  );
}

export function SettingsScreen() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const logoutAll = useLogoutAll();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  async function confirmLogoutAll() {
    setError("");
    try {
      await logoutAll.mutateAsync();
      router.replace("/login");
    } catch (cause) {
      setError(normalizeApiError(cause).message);
      router.replace("/login");
    }
  }

  if (currentUser.isPending) {
    return (
      <main
        aria-busy="true"
        className="mx-auto max-w-4xl px-5 py-10 text-sm text-[#53665d]"
        role="status"
      >
        Loading profile…
      </main>
    );
  }

  if (currentUser.isError) {
    return (
      <main
        className="mx-auto max-w-4xl px-5 py-10 text-sm text-rose-900"
        role="alert"
      >
        {normalizeApiError(currentUser.error).message}
      </main>
    );
  }

  const user = currentUser.data;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-9 sm:px-8 sm:py-12">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
        Account
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Settings</h1>
      <section
        aria-labelledby="profile-heading"
        className="mt-8 border-y border-[#d5ddd6] py-6"
      >
        <h2 className="text-lg font-semibold" id="profile-heading">
          Profile
        </h2>
        <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold text-[#64756c]">First name</dt>
            <dd className="mt-1 text-sm">{user.first_name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-[#64756c]">Last name</dt>
            <dd className="mt-1 text-sm">{user.last_name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-[#64756c]">Email</dt>
            <dd className="mt-1 text-sm">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-[#64756c]">
              Account status
            </dt>
            <dd className="mt-1 text-sm capitalize">{user.status}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-[#64756c]">Created</dt>
            <dd className="mt-1 text-sm">{formatDate(user.created_at)}</dd>
          </div>
        </dl>
      </section>

      <section
        aria-labelledby="sessions-heading"
        className="mt-8 border-b border-[#d5ddd6] pb-7"
      >
        <h2 className="text-lg font-semibold" id="sessions-heading">
          Sessions
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-6 text-[#64756c]">
          Sign out this account on every device. You will need to sign in again
          on this device.
        </p>
        {error && (
          <p
            className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900"
            role="alert"
          >
            {error}
          </p>
        )}
        <button
          className="mt-5 h-10 rounded-md border border-rose-200 px-4 text-sm font-semibold text-rose-800 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
          onClick={() => setConfirmOpen(true)}
          type="button"
        >
          Sign out all sessions
        </button>
      </section>
      <ConfirmDialog
        description="All refresh sessions for this account will be revoked, including the current session."
        confirmLabel={
          logoutAll.isPending ? "Signing out…" : "Sign out all sessions"
        }
        isPending={logoutAll.isPending}
        onConfirm={() => void confirmLogoutAll()}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        title="Sign out everywhere?"
      />
    </main>
  );
}
