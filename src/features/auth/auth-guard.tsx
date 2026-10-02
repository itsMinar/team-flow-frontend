"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/api/auth-store";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status !== "unauthenticated") return;
    const next = `${pathname}${window.location.search}`;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [pathname, router, status]);

  if (status === "authenticated") return children;

  return (
    <main
      aria-busy="true"
      className="flex min-h-screen items-center justify-center bg-[#f2f4ef] text-sm text-[#53665d]"
      role="status"
    >
      Loading your workspace…
    </main>
  );
}
