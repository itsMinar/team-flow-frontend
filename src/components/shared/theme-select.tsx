"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeSelect() {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const { theme, setTheme } = useTheme();

  if (!mounted) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-9 w-28 rounded-md border border-[#cbd4ce] bg-white"
      />
    );
  }

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <label className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#cbd4ce] bg-white px-2 text-sm text-[#53665d] focus-within:outline-2 focus-within:outline-[#346e58]">
      <Icon aria-hidden="true" size={15} />
      <span className="sr-only">Appearance</span>
      <select
        aria-label="Appearance"
        className="h-full border-0 bg-transparent pr-1 text-sm outline-none"
        onChange={(event) => setTheme(event.target.value)}
        value={theme ?? "system"}
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </label>
  );
}
