import { ThemeSelect } from "@/components/shared/theme-select";
import { Layers3 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

function Brand() {
  return (
    <Link className="inline-flex items-center gap-3" href="/login">
      <span className="grid size-10 place-items-center rounded-md bg-[#d9f16a] text-[#193c35]">
        <Layers3 aria-hidden="true" size={21} strokeWidth={2.2} />
      </span>
      <span className="text-lg font-semibold tracking-wide">TeamFlow</span>
    </Link>
  );
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f2f4ef] text-[#1b2d27]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#193c35] p-10 text-white lg:flex xl:p-14">
          <div className="flex items-center justify-between gap-4">
            <Brand />
            <ThemeSelect />
          </div>
          <div
            aria-hidden="true"
            className="absolute bottom-28 left-10 right-10 h-64"
          >
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full border border-white/15" />
            <div className="absolute bottom-8 left-8 h-40 w-40 rounded-full border border-white/15" />
            <div className="absolute bottom-16 left-16 h-40 w-40 rounded-full border border-[#d9f16a]/55" />
            <div className="absolute bottom-24 left-24 h-40 w-40 rounded-full border border-white/15" />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/65">
            Organization workspace
          </p>
        </aside>
        <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[440px]">
            <div className="mb-10 flex items-center justify-between gap-4 lg:hidden">
              <Brand />
              <ThemeSelect />
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AuthLoading() {
  return (
    <div
      aria-busy="true"
      className="flex min-h-48 items-center justify-center text-sm text-[#53665d]"
      role="status"
    >
      Checking your session…
    </div>
  );
}
