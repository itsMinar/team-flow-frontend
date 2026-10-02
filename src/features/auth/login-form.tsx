"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { AuthField } from "@/features/auth/auth-field";
import { mapApiErrorToForm } from "@/features/auth/form-errors";
import { safeNextPath } from "@/features/auth/navigation";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { useLogin } from "@/features/auth/queries";
import { useAuthStore } from "@/lib/api/auth-store";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get("next"));
  const status = useAuthStore((state) => state.status);
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  useEffect(() => {
    if (status === "authenticated") router.replace(nextPath);
  }, [nextPath, router, status]);

  async function onSubmit(values: LoginValues) {
    setFormError("");
    try {
      await login.mutateAsync(values);
      router.replace(nextPath);
    } catch (error) {
      setFormError(
        mapApiErrorToForm<LoginValues>(
          error,
          ["email", "password"],
          form.setError,
        ),
      );
    }
  }

  if (status === "restoring" || status === "authenticated") {
    return (
      <div className="rounded-md border border-[#d5ddd6] bg-white px-6 py-8">
        <p className="text-sm text-[#53665d]" role="status">
          Checking your session…
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-[#d5ddd6] bg-white p-6 shadow-[0_18px_55px_-38px_rgba(25,60,53,0.5)] sm:p-9">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#587567]">
        Your workspace
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-[#1b2d27]">
        Sign in
      </h1>
      <p className="mt-2 text-sm text-[#64756c]">
        Welcome back. Enter your account details.
      </p>

      <form className="mt-8 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        {formError && (
          <p
            className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
            role="alert"
          >
            {formError}
          </p>
        )}
        <AuthField
          autoComplete="email"
          error={form.formState.errors.email?.message}
          icon={<Mail aria-hidden="true" size={17} />}
          id="email"
          label="Email address"
          registration={form.register("email")}
          type="email"
        />
        <AuthField
          autoComplete="current-password"
          error={form.formState.errors.password?.message}
          icon={<LockKeyhole aria-hidden="true" size={17} />}
          id="password"
          label="Password"
          registration={form.register("password")}
          trailing={
            <button
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="rounded p-1 text-[#64756c] hover:text-[#193c35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346e58]"
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? (
                <EyeOff aria-hidden="true" size={18} />
              ) : (
                <Eye aria-hidden="true" size={18} />
              )}
            </button>
          }
          type={showPassword ? "text" : "password"}
        />
        <button
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#193c35] px-4 text-sm font-semibold text-white transition hover:bg-[#245448] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#193c35] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={login.isPending || form.formState.isSubmitting}
          type="submit"
        >
          {login.isPending ? "Signing in…" : "Sign in"}
          {!login.isPending && <ArrowRight aria-hidden="true" size={17} />}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#64756c]">
        New to TeamFlow?{" "}
        <Link
          className="font-semibold text-[#245448] underline decoration-[#a8c2b2] underline-offset-4 hover:text-[#193c35]"
          href="/register"
        >
          Create an account
        </Link>
      </p>
    </section>
  );
}
