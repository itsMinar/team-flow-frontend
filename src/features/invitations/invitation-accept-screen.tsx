"use client";

import { AuthField } from "@/features/auth/auth-field";
import { useLogout } from "@/features/auth/queries";
import {
  invitationsApi,
  type InvitationPreview,
} from "@/features/invitations/api";
import {
  newInviteeSchema,
  type NewInviteeValues,
} from "@/features/invitations/schemas";
import { useAuthStore } from "@/lib/api/auth-store";
import { normalizeApiError } from "@/lib/api/normalize-api-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, LockKeyhole, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type PreviewState =
  | { kind: "loading" }
  | { kind: "loaded"; value: InvitationPreview; expired: boolean }
  | { kind: "error"; message: string };

export function InvitationAcceptScreen({ token }: { token: string }) {
  const router = useRouter();
  const logout = useLogout();
  const authStatus = useAuthStore((state) => state.status);
  const [previewState, setPreviewState] = useState<PreviewState>({
    kind: "loading",
  });
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState("");
  const form = useForm<NewInviteeValues>({
    resolver: zodResolver(newInviteeSchema),
    defaultValues: { password: "", first_name: "", last_name: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    const controller = new AbortController();
    void invitationsApi.preview(token, controller.signal).then(
      (value) =>
        setPreviewState({
          kind: "loaded",
          value,
          expired: new Date(value.expires_at).getTime() <= Date.now(),
        }),
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setPreviewState({
            kind: "error",
            message: normalizeApiError(error).message,
          });
        }
      },
    );
    return () => controller.abort();
  }, [token]);

  async function accept(input: { token: string } & Partial<NewInviteeValues>) {
    setPending(true);
    setFormError("");
    try {
      const result = await invitationsApi.accept(input);
      useAuthStore.getState().setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        token_type: result.token_type,
        expires_in: result.expires_in,
        user: result.user,
      });
      router.replace(
        `/orgs/${encodeURIComponent(result.organization.id)}/dashboard`,
      );
    } catch (error) {
      setFormError(normalizeApiError(error).message);
    } finally {
      setPending(false);
    }
  }

  if (previewState.kind === "loading" || authStatus === "restoring") {
    return (
      <div
        aria-busy="true"
        className="rounded-md border border-[#d5ddd6] bg-white px-6 py-8 text-sm text-[#53665d]"
        role="status"
      >
        Checking invitation…
      </div>
    );
  }

  if (previewState.kind === "error") {
    return (
      <section
        className="rounded-md border border-rose-200 bg-white p-7"
        role="alert"
      >
        <h1 className="text-2xl font-semibold">Invitation unavailable</h1>
        <p className="mt-2 text-sm text-[#64756c]">{previewState.message}</p>
        <Link
          className="mt-5 inline-block text-sm font-semibold text-[#245448] underline underline-offset-4"
          href="/login"
        >
          Sign in
        </Link>
      </section>
    );
  }

  const invitation = previewState.value;
  if (invitation.status !== "pending" || previewState.expired) {
    return (
      <section className="rounded-md border border-[#d5ddd6] bg-white p-7">
        <h1 className="text-2xl font-semibold">
          Invitation is no longer active
        </h1>
        <p className="mt-2 text-sm text-[#64756c]">
          This invitation is{" "}
          {previewState.expired ? "expired" : invitation.status}. Ask the
          organization owner to send a new one.
        </p>
      </section>
    );
  }

  if (invitation.account_exists && authStatus !== "authenticated") {
    return (
      <section className="rounded-md border border-[#d5ddd6] bg-white p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
          Organization invitation
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          Join {invitation.organization_name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#64756c]">
          This invitation is for {invitation.email}. Sign in with that account,
          then reopen the invitation from your email.
        </p>
        <Link
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white"
          href="/login"
        >
          Sign in <ArrowRight aria-hidden="true" size={16} />
        </Link>
      </section>
    );
  }

  if (invitation.account_exists) {
    return (
      <section className="rounded-md border border-[#d5ddd6] bg-white p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
          Organization invitation
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          Join {invitation.organization_name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#64756c]">
          Accept as {invitation.email} with the {invitation.role_name} role.
        </p>
        {formError && (
          <p
            className="mt-4 rounded-md bg-rose-50 p-3 text-sm text-rose-900"
            role="alert"
          >
            {formError}
          </p>
        )}
        <button
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white disabled:opacity-60"
          disabled={pending}
          onClick={() => void accept({ token })}
          type="button"
        >
          {pending ? "Accepting…" : "Accept invitation"}{" "}
          <ArrowRight aria-hidden="true" size={16} />
        </button>
      </section>
    );
  }

  if (authStatus === "authenticated") {
    return (
      <section className="rounded-md border border-amber-200 bg-white p-7">
        <h1 className="text-2xl font-semibold">Sign out before accepting</h1>
        <p className="mt-2 text-sm leading-6 text-[#64756c]">
          This invitation is for a new account. Sign out, then reopen the invite
          link to create the invited account.
        </p>
        <button
          className="mt-5 h-10 rounded-md border border-[#cbd4ce] px-4 text-sm font-semibold text-[#245448] hover:bg-[#f5f7f3] disabled:opacity-60"
          disabled={logout.isPending}
          onClick={() => void logout.mutateAsync().catch(() => undefined)}
          type="button"
        >
          {logout.isPending ? "Signing out…" : "Sign out and continue"}
        </button>
      </section>
    );
  }

  async function onSubmit(values: NewInviteeValues) {
    await accept({ token, ...values });
  }

  return (
    <section className="rounded-lg border border-[#d5ddd6] bg-white p-6 shadow-[0_18px_55px_-38px_rgba(25,60,53,0.5)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
        Organization invitation
      </p>
      <h1 className="mt-2 text-2xl font-semibold">
        Join {invitation.organization_name}
      </h1>
      <p className="mt-2 text-sm text-[#64756c]">
        Create an account for {invitation.email} as {invitation.role_name}.
      </p>
      <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {formError && (
          <p
            className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900"
            role="alert"
          >
            {formError}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            autoComplete="given-name"
            error={form.formState.errors.first_name?.message}
            icon={<UserRound aria-hidden="true" size={17} />}
            id="first_name"
            label="First name"
            registration={form.register("first_name")}
          />
          <AuthField
            autoComplete="family-name"
            error={form.formState.errors.last_name?.message}
            icon={<UserRound aria-hidden="true" size={17} />}
            id="last_name"
            label="Last name"
            registration={form.register("last_name")}
          />
        </div>
        <label
          className="block space-y-1.5 text-sm font-medium"
          htmlFor="invite-email"
        >
          Invited email
          <input
            className="h-12 w-full rounded-md border border-[#cbd4ce] bg-[#f5f7f3] px-3 text-sm text-[#53665d]"
            id="invite-email"
            readOnly
            value={invitation.email}
          />
        </label>
        <AuthField
          autoComplete="new-password"
          error={form.formState.errors.password?.message}
          icon={<LockKeyhole aria-hidden="true" size={17} />}
          hint="8-72 UTF-8 bytes; include letters and numbers."
          id="password"
          label="Password"
          registration={form.register("password")}
          type="password"
        />
        <button
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white disabled:opacity-60"
          disabled={pending || form.formState.isSubmitting}
          type="submit"
        >
          {pending ? "Creating account…" : "Create account and join"}{" "}
          <ArrowRight aria-hidden="true" size={16} />
        </button>
      </form>
    </section>
  );
}
