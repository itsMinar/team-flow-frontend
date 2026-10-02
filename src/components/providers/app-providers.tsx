"use client";

import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/query-client";
import { restoreSession } from "@/lib/api/axios";

type RateLimitDetail = { retryAfterSeconds?: number };

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(getQueryClient);
  const [rateLimit, setRateLimit] = useState<RateLimitDetail | null>(null);

  useEffect(() => {
    void restoreSession();
  }, []);

  useEffect(() => {
    const handleRateLimit = (event: Event) => {
      setRateLimit((event as CustomEvent<RateLimitDetail>).detail);
    };

    window.addEventListener("teamflow:rate-limit", handleRateLimit);
    return () =>
      window.removeEventListener("teamflow:rate-limit", handleRateLimit);
  }, []);

  const retryAfter = rateLimit?.retryAfterSeconds;

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {rateLimit && (
        <div
          className="fixed bottom-4 right-4 z-50 flex max-w-sm items-center gap-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg"
          role="status"
          aria-live="polite"
        >
          <span>
            Too many requests.
            {retryAfter === undefined
              ? " Please try again shortly."
              : ` Try again in ${retryAfter} seconds.`}
          </span>
          <button
            className="font-semibold underline focus-visible:outline-2 focus-visible:outline-offset-2"
            onClick={() => setRateLimit(null)}
            type="button"
          >
            Dismiss
          </button>
        </div>
      )}
    </QueryClientProvider>
  );
}
